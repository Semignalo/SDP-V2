<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\SystemSetting;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class OrderService
{
    /**
     * Create a new order with server-side price validation.
     *
     * @param User|null $user
     * @param array $customerInfo {name, phone, address, city, postal_code}
     * @param array $items [{product_id, variant_id?, quantity}]
     * @return Order
     * @throws \Exception
     */
    public function createOrder(?User $user, array $customerInfo, array $items): Order
    {
        return DB::transaction(function () use ($user, $customerInfo, $items) {

            // 1. Calculate subtotal from DB prices (NOT from frontend)
            $subtotal = 0;
            $orderItems = [];

            foreach ($items as $item) {
                $product = Product::findOrFail($item['product_id']);
                $variant = null;
                $unitPrice = $product->price;
                $variantName = null;

                if (!empty($item['variant_id'])) {
                    $variant = ProductVariant::where('id', $item['variant_id'])
                        ->where('product_id', $product->id)
                        ->firstOrFail();
                    $unitPrice = $variant->price;
                    $variantName = $variant->name;
                }

                $quantity = max(1, (int) $item['quantity']);
                $lineTotal = round($unitPrice * $quantity, 2);
                $subtotal += $lineTotal;

                $orderItems[] = [
                    'product_id'         => $product->id,
                    'product_variant_id' => $variant?->id,
                    'product_title'      => $product->title,
                    'variant_name'       => $variantName,
                    'unit_price'         => $unitPrice,
                    'quantity'           => $quantity,
                    'line_total'         => $lineTotal,
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
                    throw new \Exception("Minimum order untuk Starcenter adalah Rp " . number_format($moq, 0, ',', '.'));
                }
            }

            // 6. Create order
            $order = Order::create([
                'user_id'          => $user?->id,
                'customer_info'    => $customerInfo,
                'subtotal'         => $subtotal,
                'discount_percent' => $discountPercent,
                'discount_amount'  => $discountAmount,
                'shipping_cost'    => $shippingCost,
                'total'            => $total,
                'status'           => 'pending_payment',
            ]);

            // 7. Create order items
            foreach ($orderItems as $itemData) {
                $order->items()->create($itemData);
            }

            // 8. Update user's last transaction date
            if ($user) {
                $user->update(['last_transaction_at' => now()]);
            }

            return $order->load('items');
        });
    }
}
