<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CheckoutRequest;
use App\Http\Requests\UploadPaymentProofRequest;
use App\Models\Order;
use App\Models\PaymentProof;
use App\Models\SystemSetting;
use App\Services\CommissionService;
use App\Services\OrderService;
use App\Services\TierService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class OrderController extends Controller
{
    /**
     * Create a new order (checkout).
     * Validasi variant_id milik product_id ditangani oleh CheckoutRequest.
     */
    public function checkout(CheckoutRequest $request, OrderService $orderService)
    {
        $validated = $request->validated();

        try {
            $order = $orderService->createOrder(
                $request->user(),
                $validated['customer_info'],
                $validated['items']
            );

            return response()->json([
                'data' => [
                    'message' => 'Pesanan berhasil dibuat.',
                    'order_number' => $order->order_number,
                    'order_id' => $order->id,
                    'total' => (float) $order->total,
                ],
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /**
     * Get user's order history.
     */
    public function myOrders(Request $request)
    {
        $orders = Order::where('user_id', $request->user()->id)
            ->with(['items.product', 'paymentProof'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($orders);
    }

    /**
     * Get invoice for a specific order (public by order_number).
     */
    public function invoice(string $orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)
            ->with(['items', 'paymentProof'])
            ->firstOrFail();

        // Get payment config
        $paymentConfig = [
            'bank_name' => SystemSetting::getValue('payment_bank_name', 'BCA'),
            'account_number' => SystemSetting::getValue('payment_account_number', '888888888'),
            'account_name' => SystemSetting::getValue('payment_account_name', 'PT BBK'),
        ];

        return response()->json([
            'order' => $order,
            'payment_config' => $paymentConfig,
        ]);
    }

    /**
     * Upload payment proof for an order.
     *
     * B5: Validasi MIME type ketat (jpg, png, pdf), max 2MB.
     * File disimpan di private storage (storage/app/private/) agar tidak bisa diakses publik.
     * Admin mengakses file melalui endpoint terpisah dengan otorisasi.
     */
    public function uploadPaymentProof(UploadPaymentProofRequest $request, int $orderId)
    {
        $order = Order::where('id', $orderId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if (! in_array($order->status, ['pending_payment', 'processing'])) {
            return response()->json([
                'message' => 'Bukti pembayaran hanya bisa diunggah untuk order yang belum selesai.',
            ], 422);
        }

        // Simpan ke private storage — tidak bisa diakses via URL publik
        $path = $request->file('file')->store('payment-proofs', 'local');

        $proof = PaymentProof::updateOrCreate(
            ['order_id' => $order->id],
            [
                'file_path' => $path,
                'status' => 'pending',
            ]
        );

        return response()->json([
            'message' => 'Bukti pembayaran berhasil diunggah.',
            'data' => [
                'proof_id' => $proof->id,
                'status' => $proof->status,
                'created_at' => $proof->created_at,
            ],
        ]);
    }

    /**
     * Serve payment proof file to admin (private storage access).
     * Hanya admin yang bisa mengakses file ini — proteksi via EnsureIsAdmin middleware di route.
     */
    public function servePaymentProof(int $proofId)
    {
        $proof = PaymentProof::findOrFail($proofId);

        if (! Storage::disk('local')->exists($proof->file_path)) {
            return response()->json(['message' => 'File tidak ditemukan.'], 404);
        }

        return Storage::disk('local')->response($proof->file_path);
    }

    // ── Admin Endpoints ──

    /**
     * List all orders (admin).
     */
    public function adminIndex(Request $request)
    {
        $query = Order::with(['items', 'paymentProof', 'user']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate(30);

        return response()->json($orders);
    }

    /**
     * Update order status (admin).
     */
    public function updateStatus(Request $request, int $id, TierService $tierService, CommissionService $commissionService, OrderService $orderService)
    {
        $order = Order::with('user')->findOrFail($id);
        $oldStatus = $order->status;

        $validated = $request->validate([
            'status' => 'required|in:pending_payment,processing,shipped,completed,rejected',
        ]);

        $newStatus = $validated['status'];

        if ($oldStatus === $newStatus) {
            return response()->json(['message' => 'Status tidak berubah.']);
        }

        $order->update(['status' => $newStatus]);

        // Business logic on status change
        if ($order->user) {
            $user = $order->user;

            if ($newStatus === 'completed' && $oldStatus !== 'completed') {
                // Add to cumulative spending & evaluate tier upgrade
                $productSpend = $order->subtotal - $order->discount_amount;
                $user->increment('cumulative_spending', $productSpend);
                $user->update(['last_transaction_at' => now()]);

                $tierService->evaluateUpgrade($user->fresh());
                $commissionService->distribute($order);

            } elseif ($oldStatus === 'completed' && $newStatus !== 'completed') {
                // Reverse: subtract spending & cancel commissions
                $productSpend = $order->subtotal - $order->discount_amount;
                $user->decrement('cumulative_spending', min($user->cumulative_spending, $productSpend));

                $tierService->evaluateUpgrade($user->fresh());
                $commissionService->cancelForOrder($order);
            }
        }

        // B4: Kembalikan stok jika order dibatalkan/ditolak dari status non-rejected
        if ($newStatus === 'rejected' && $oldStatus !== 'rejected') {
            $orderService->restoreStock($order);
        }

        return response()->json([
            'message' => 'Status pesanan berhasil diperbarui menjadi '.$newStatus,
            'order' => $order->fresh()->load(['items', 'paymentProof']),
        ]);
    }

    /**
     * Approve/reject payment proof (admin).
     */
    public function reviewPayment(Request $request, int $orderId)
    {
        $order = Order::findOrFail($orderId);
        $proof = PaymentProof::where('order_id', $order->id)->firstOrFail();

        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
            'notes' => 'nullable|string|max:500',
        ]);

        $proof->update([
            'status' => $validated['status'],
            'admin_notes' => $validated['notes'] ?? null,
            'reviewed_at' => now(),
        ]);

        // If approved, auto-change order status to processing
        if ($validated['status'] === 'approved' && $order->status === 'pending_payment') {
            $order->update(['status' => 'processing']);
        }

        return response()->json([
            'message' => 'Review pembayaran berhasil.',
            'proof' => $proof,
        ]);
    }

    /**
     * Update tracking number for shipped order (admin).
     */
    public function updateTracking(Request $request, int $id)
    {
        $order = Order::findOrFail($id);

        $validated = $request->validate([
            'tracking_number' => 'required|string|max:100',
            'shipping_provider' => 'nullable|string|max:50',
        ]);

        $order->update([
            'tracking_number' => $validated['tracking_number'],
            'shipping_provider' => $validated['shipping_provider'] ?? null,
        ]);

        return response()->json([
            'message' => 'Nomor resi berhasil diperbarui.',
            'order' => $order->fresh()->load(['items', 'paymentProof']),
        ]);
    }
}
