<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Product;
use App\Models\Order;
use App\Models\PaymentProof;
use App\Models\StarcenterNetwork;
use App\Services\OrderService;
use App\Services\CommissionService;
use App\Services\TierService;
use App\Models\Tier;

class DummyDataSeeder extends Seeder
{
    public function run(OrderService $orderService, CommissionService $commissionService, TierService $tierService): void
    {
        // 1. Get or create Starcenter tier (assume diamond is ID 5, or just query it)
        $diamondTier = Tier::where('slug', 'diamond')->first();
        if (!$diamondTier) {
            $diamondTier = Tier::create(['name' => 'Diamond', 'slug' => 'diamond', 'discount_percent' => 20, 'min_spend' => 50000000, 'sort_order' => 5]);
        }

        // 2. Create Starcenter Account
        $starcenter = User::firstOrCreate(
            ['email' => 'starcenter@starinc.com'],
            [
                'name' => 'Distributor Utama',
                'password' => Hash::make('password123'),
                'phone' => '08111111111',
                'role' => 'starcenter',
                'tier_id' => $diamondTier->id,
                'referral_code' => 'STAR123',
            ]
        );

        // 3. Create dummy products
        $products = [];
        $productData = [
            ['title' => 'Starinc Whitening Serum', 'price' => 150000, 'category' => 'Skincare'],
            ['title' => 'Starinc Night Cream', 'price' => 120000, 'category' => 'Skincare'],
            ['title' => 'Starinc Facial Wash', 'price' => 80000, 'category' => 'Skincare']
        ];

        foreach ($productData as $pd) {
            $products[] = Product::firstOrCreate(
                ['title' => $pd['title']],
                [
                    'description' => 'Dummy description for ' . $pd['title'],
                    'price' => $pd['price'],
                    'category' => $pd['category'],
                ]
            );
        }

        // 4. Create downlines
        $downlines = [];
        for ($i = 1; $i <= 3; $i++) {
            $downline = User::firstOrCreate(
                ['email' => "downline{$i}@example.com"],
                [
                    'name' => "Downline {$i}",
                    'password' => Hash::make('password123'),
                    'phone' => "0822222222{$i}",
                    'role' => 'regular',
                    'referrer_id' => $starcenter->id,
                ]
            );

            // Populate Network
            StarcenterNetwork::firstOrCreate([
                'upline_id' => $starcenter->id,
                'downline_id' => $downline->id,
                'depth' => 1
            ]);
            $downlines[] = $downline;
        }

        // 5. Create orders for downlines
        foreach ($downlines as $index => $downline) {
            $customerInfo = [
                'name' => $downline->name,
                'phone' => $downline->phone,
                'address' => 'Jl. Dummy No. ' . $index,
                'city' => 'Jakarta',
                'postal_code' => '10000'
            ];

            // Mix the items
            $items = [
                [
                    'product_id' => $products[0]->id,
                    'quantity' => 2
                ],
                [
                    'product_id' => $products[1]->id,
                    'quantity' => 1
                ]
            ];

            // Create order
            $order = $orderService->createOrder($downline, $customerInfo, $items);

            // Add payment proof
            PaymentProof::create([
                'order_id' => $order->id,
                'file_path' => 'dummy/proof.jpg',
                'status' => 'approved',
                'reviewed_at' => now(),
            ]);

            // Complete the order
            $order->update(['status' => 'completed']);
            
            // Add to cumulative spending
            $productSpend = $order->subtotal - $order->discount_amount;
            $downline->increment('cumulative_spending', $productSpend);
            $downline->update(['last_transaction_at' => now()]);

            // Evaluate tier & Distribute
            $tierService->evaluateUpgrade($downline->fresh());
            $commissionService->distribute($order);
        }
    }
}
