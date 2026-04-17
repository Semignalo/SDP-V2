<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\SystemSetting;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class OrderService
{
    /**
     * Create a new order with server-side price validation and stock checking.
     *
     * @param  array  $customerInfo  {name, phone, address, city, postal_code}
     * @param  array  $items  [{product_id, variant_id?, quantity}]
     *
     * @throws \Exception
     */
    public function createOrder(?User $user, array $customerInfo, array $items): Order
    {
        return DB::transaction(function () use ($user, $customerInfo, $items) {

            // 1. Calculate subtotal from DB prices (NOT from frontend)
            //    Gunakan lockForUpdate() untuk mencegah race condition stok saat checkout bersamaan
            $subtotal = 0;
            $orderItems = [];
            $stockDeductions = []; // [['model' => ..., 'qty' => ...]]

            foreach ($items as $item) {
                // Lock row produk agar tidak ada concurrent checkout yang ambil stok yang sama
                $product = Product::lockForUpdate()->findOrFail($item['product_id']);
                $variant = null;
                $unitPrice = $product->price;
                $variantName = null;
                $quantity = max(1, (int) $item['quantity']);

                if (! empty($item['variant_id'])) {
                    $variant = ProductVariant::lockForUpdate()
                        ->where('id', $item['variant_id'])
                        ->where('product_id', $product->id)
                        ->firstOrFail();
                    $unitPrice = $variant->price;
                    $variantName = $variant->name;
                }

                // B4: Validasi stok — null berarti unlimited (tidak di-track)
                $this->validateStock($product, $variant, $quantity);

                $lineTotal = round($unitPrice * $quantity, 2);
                $subtotal += $lineTotal;

                $orderItems[] = [
                    'product_id' => $product->id,
                    'product_variant_id' => $variant?->id,
                    'product_title' => $product->title,
                    'variant_name' => $variantName,
                    'unit_price' => $unitPrice,
                    'quantity' => $quantity,
                    'line_total' => $lineTotal,
                ];

                // Catat deduction yang akan dilakukan setelah order dibuat
                $stockDeductions[] = [
                    'model' => $variant ?? $product,
                    'qty' => $quantity,
                    'is_variant' => $variant !== null,
                ];
            }

            // 2. Calculate discount from user's tier
            $discountPercent = 0;
            if ($user && $user->tier) {
                $discountPercent = (float) $user->tier->discount_percent;
            }
            $discountAmount = round($subtotal * $discountPercent / 100, 2);

            // 3. Get shipping cost from settings
            $shippingCost = (float) SystemSetting::getValue('flat_shipping_cost', 20000);

            // 4. Calculate total
            $total = $subtotal - $discountAmount + $shippingCost;

            // 5. Check MOQ for starcenter
            if ($user && $user->role === 'starcenter') {
                $moq = (float) SystemSetting::getValue('starcenter_moq', 5000000);
                if ($total < $moq) {
                    throw new \Exception('Minimum order untuk Starcenter adalah Rp '.number_format($moq, 0, ',', '.'));
                }
            }

            // 6. Create order
            $order = Order::create([
                'user_id' => $user?->id,
                'customer_info' => $customerInfo,
                'subtotal' => $subtotal,
                'discount_percent' => $discountPercent,
                'discount_amount' => $discountAmount,
                'shipping_cost' => $shippingCost,
                'total' => $total,
                'status' => 'pending_payment',
            ]);

            // 7. Create order items
            foreach ($orderItems as $itemData) {
                $order->items()->create($itemData);
            }

            // 8. B4: Kurangi stok setelah order berhasil dibuat
            //    Hanya kurangi jika stok tidak null (produk dengan tracking stok)
            foreach ($stockDeductions as $deduction) {
                $model = $deduction['model'];
                if ($model->stock !== null) {
                    $model->decrement('stock', $deduction['qty']);
                }
            }

            // 9. Update user's last transaction date
            if ($user) {
                $user->update(['last_transaction_at' => now()]);
            }

            return $order->load('items');
        });
    }

    /**
     * Restore stok ketika order dibatalkan.
     * Dipanggil dari OrderController saat status berubah ke cancelled/rejected.
     */
    public function restoreStock(Order $order): void
    {
        $order->loadMissing('items.product', 'items.variant');

        foreach ($order->items as $item) {
            // Jika ada variant dan variant tersebut tracking stok
            if ($item->product_variant_id && $item->variant) {
                $variant = $item->variant;
                if ($variant->stock !== null) {
                    $variant->increment('stock', $item->quantity);
                }
            } elseif ($item->product) {
                // Produk tanpa variant
                $product = $item->product;
                if ($product->stock !== null) {
                    $product->increment('stock', $item->quantity);
                }
            }
        }
    }

    /**
     * Validasi stok produk atau variant sebelum order dibuat.
     * Jika stok null, dianggap unlimited — tidak divalidasi.
     *
     * @throws \Exception jika stok tidak mencukupi
     */
    private function validateStock(Product $product, ?ProductVariant $variant, int $quantity): void
    {
        if ($variant !== null) {
            // Variant dengan stok sendiri
            if ($variant->stock !== null && $variant->stock < $quantity) {
                throw new \Exception(
                    "Stok variant '{$variant->name}' dari produk '{$product->title}' tidak mencukupi. "
                    ."Tersisa: {$variant->stock}, diminta: {$quantity}."
                );
            }
        } else {
            // Produk tanpa variant
            if ($product->stock !== null && $product->stock < $quantity) {
                throw new \Exception(
                    "Stok produk '{$product->title}' tidak mencukupi. "
                    ."Tersisa: {$product->stock}, diminta: {$quantity}."
                );
            }
        }
    }
}
