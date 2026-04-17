<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CommissionController;
use App\Http\Controllers\Api\NetworkController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Middleware\EnsureIsAdmin;
use App\Models\Tier;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::middleware('throttle:5,1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

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
    return response()->json(Tier::orderBy('sort_order')->get());
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
    Route::get('/user/commissions', [CommissionController::class, 'myCommissions']);

    // Referral info & network
    Route::get('/user/referral-link', [NetworkController::class, 'referralInfo']);

    // System Settings (for Starcenter/MLM flow)
    Route::get('/settings/system', [SettingsController::class, 'systemSettings']);

    /*
    |----------------------------------------------------------------------
    | Admin Routes
    |----------------------------------------------------------------------
    */
    Route::middleware(EnsureIsAdmin::class)->prefix('admin')->group(function () {

        // Dashboard
        Route::get('/dashboard', [AdminController::class, 'dashboard']);

        // Orders
        Route::get('/orders', [OrderController::class, 'adminIndex']);
        Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);
        Route::put('/orders/{id}/payment', [OrderController::class, 'reviewPayment']);
        Route::put('/orders/{id}/tracking', [OrderController::class, 'updateTracking']);

        // Serve private payment proof file (hanya admin)
        Route::get('/payment-proofs/{proofId}/file', [OrderController::class, 'servePaymentProof']);

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

        // Media Upload (for Appearance page video/image upload)
        Route::post('/upload', [SettingsController::class, 'upload']);

        // Settings
        Route::get('/settings', [SettingsController::class, 'adminSettings']);
        Route::put('/settings', [SettingsController::class, 'updateSettings']);
        Route::put('/settings/tiers/{id}', [SettingsController::class, 'updateTier']);
        Route::get('/appearance', [SettingsController::class, 'adminAppearance']);
        Route::put('/appearance', [SettingsController::class, 'updateAppearance']);
    });
});
