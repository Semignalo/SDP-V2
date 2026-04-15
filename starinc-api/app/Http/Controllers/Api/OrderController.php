<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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
     */
    public function checkout(Request $request, OrderService $orderService)
    {
        $validated = $request->validate([
            'customer_info.name'        => 'required|string|max:255',
            'customer_info.phone'       => 'required|string|max:20',
            'customer_info.address'     => 'required|string|max:500',
            'customer_info.city'        => 'required|string|max:100',
            'customer_info.postal_code' => 'required|string|max:10',
            'items'                     => 'required|array|min:1',
            'items.*.product_id'        => 'required|integer|exists:products,id',
            'items.*.variant_id'        => 'nullable|integer|exists:product_variants,id',
            'items.*.quantity'          => 'required|integer|min:1',
        ]);

        try {
            $order = $orderService->createOrder(
                $request->user(),
                $validated['customer_info'],
                $validated['items']
            );

            return response()->json([
                'message'      => 'Pesanan berhasil dibuat.',
                'order_number' => $order->order_number,
                'order_id'     => $order->id,
                'total'        => (float) $order->total,
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
            'bank_name'      => SystemSetting::getValue('payment_bank_name', 'BCA'),
            'account_number' => SystemSetting::getValue('payment_account_number', '888888888'),
            'account_name'   => SystemSetting::getValue('payment_account_name', 'PT BBK'),
        ];

        return response()->json([
            'order'          => $order,
            'payment_config' => $paymentConfig,
        ]);
    }

    /**
     * Upload payment proof for an order.
     */
    public function uploadPaymentProof(Request $request, int $orderId)
    {
        $order = Order::where('id', $orderId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $request->validate([
            'file' => 'required|file|mimes:jpg,jpeg,png,webp|max:5120', // 5MB
        ]);

        $path = $request->file('file')->store('payment-proofs', 'public');

        $proof = PaymentProof::updateOrCreate(
            ['order_id' => $order->id],
            [
                'file_path' => $path,
                'status'    => 'pending',
            ]
        );

        return response()->json([
            'message' => 'Bukti pembayaran berhasil diunggah.',
            'proof'   => $proof,
        ]);
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

        $orders = $query->orderBy('created_at', 'desc')->paginate(30);

        return response()->json($orders);
    }

    /**
     * Update order status (admin).
     */
    public function updateStatus(Request $request, int $id, TierService $tierService, CommissionService $commissionService)
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

        return response()->json([
            'message' => 'Status pesanan berhasil diperbarui menjadi ' . $newStatus,
            'order'   => $order->fresh()->load(['items', 'paymentProof']),
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
            'notes'  => 'nullable|string|max:500',
        ]);

        $proof->update([
            'status'      => $validated['status'],
            'admin_notes' => $validated['notes'] ?? null,
            'reviewed_at' => now(),
        ]);

        // If approved, auto-change order status to processing
        if ($validated['status'] === 'approved' && $order->status === 'pending_payment') {
            $order->update(['status' => 'processing']);
        }

        return response()->json([
            'message' => 'Review pembayaran berhasil.',
            'proof'   => $proof,
        ]);
    }
}
