<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\SettingsController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Products (public)
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);

// Appearance & Payment Info (public)
Route::get('/appearance', [SettingsController::class, 'appearance']);
Route::get('/settings/payment', [SettingsController::class, 'paymentInfo']);

// Invoice (public by order number)
Route::get('/orders/{orderNumber}/invoice', [OrderController::class, 'invoice']);

// Tiers list (public)
Route::get('/tiers', function () {
    return response()->json(\App\Models\Tier::orderBy('sort_order')->get());
});

/*
|--------------------------------------------------------------------------
| Authenticated Routes (Sanctum)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user/profile', [AuthController::class, 'profile']);
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);
    Route::put('/user/password', [AuthController::class, 'updatePassword']);

    // Checkout & Orders
    Route::post('/checkout', [OrderController::class, 'checkout']);
    Route::get('/user/orders', [OrderController::class, 'myOrders']);
    Route::post('/orders/{id}/payment-proof', [OrderController::class, 'uploadPaymentProof']);

    // Commissions (my commissions)
    Route::get('/user/commissions', function (\Illuminate\Http\Request $request) {
        return response()->json(
            $request->user()->commissions()
                ->with(['order', 'sourceUser'])
                ->orderBy('created_at', 'desc')
                ->paginate(20)
        );
    });

    // Referral info
    Route::get('/user/referral-link', function (\Illuminate\Http\Request $request) {
        $user = $request->user();
        
        if ($user->role === 'starcenter' || $user->role === 'admin') {
            // Get all downlines up to 7 levels
            $network = \App\Models\StarcenterNetwork::where('upline_id', $user->id)
                ->with(['downline.tier'])
                ->orderBy('depth', 'asc')
                ->get();
                
            $referrals = $network->map(function ($net) {
                return [
                    'id'                  => $net->downline->id,
                    'name'                => $net->downline->name,
                    'email'               => $net->downline->email,
                    'referrer_id'         => $net->downline->referrer_id,
                    'tier'                => $net->downline->tier,
                    'created_at'          => $net->downline->created_at,
                    'cumulative_spending' => $net->downline->cumulative_spending,
                    'level'               => $net->depth,
                ];
            });
        } else {
            // Regular user: only direct referrals (Level 1)
            $referrals = $user->referrals()->with('tier')
                ->select('id', 'name', 'email', 'referrer_id', 'tier_id', 'created_at', 'cumulative_spending')
                ->orderBy('created_at', 'desc')->get()
                ->map(function ($ref) {
                    $ref->level = 1;
                    return $ref;
                });
        }

        return response()->json([
            'referral_code'   => $user->referral_code,
            'referral_url'    => config('app.frontend_url', 'http://localhost:5173') . '/register?ref=' . $user->referral_code,
            'total_referrals' => $referrals->count(),
            'referrals'       => $referrals,
        ]);
    });

    /*
    |----------------------------------------------------------------------
    | Admin Routes
    |----------------------------------------------------------------------
    */
    Route::middleware(\App\Http\Middleware\EnsureIsAdmin::class)->prefix('admin')->group(function () {

        // Dashboard
        Route::get('/dashboard', [AdminController::class, 'dashboard']);

        // Orders
        Route::get('/orders', [OrderController::class, 'adminIndex']);
        Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);
        Route::put('/orders/{id}/payment', [OrderController::class, 'reviewPayment']);

        // Products (CRUD)
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{id}', [ProductController::class, 'update']);
        Route::delete('/products/{id}', [ProductController::class, 'destroy']);
        Route::post('/products/{id}/media', [ProductController::class, 'uploadMedia']);

        // Users
        Route::get('/users', [AdminController::class, 'users']);
        Route::get('/users/{id}', [AdminController::class, 'showUser']);
        Route::put('/users/{id}/role', [AdminController::class, 'updateUserRole']);

        // Commissions
        Route::get('/commissions', [AdminController::class, 'commissions']);
        Route::put('/commissions/{id}/pay', [AdminController::class, 'payCommission']);
        Route::post('/commissions/bulk-pay', [AdminController::class, 'bulkPayCommissions']);
        Route::get('/commissions/export', [AdminController::class, 'exportCommissions']);

        // Export Orders (place before {id} routes if needed, but it's isolated)
        Route::get('/orders/export', [AdminController::class, 'exportOrders']);

        // Settings
        Route::get('/settings', [SettingsController::class, 'adminSettings']);
        Route::put('/settings', [SettingsController::class, 'updateSettings']);
        Route::put('/settings/tiers/{id}', [SettingsController::class, 'updateTier']);
        Route::get('/appearance', [SettingsController::class, 'adminAppearance']);
        Route::put('/appearance', [SettingsController::class, 'updateAppearance']);
    });
});
