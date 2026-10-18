<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\KhqrPaymentController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\StatsController;
use App\Http\Controllers\SubscriberController;
use Illuminate\Support\Facades\Route;

// Health & System Status
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'framework' => 'Laravel',
        'version' => app()->version(),
        'database' => config('database.default'),
        'timestamp' => now()->toIso8601String(),
    ]);
});

// Authentication
Route::post('/auth/send-otp', [AuthController::class, 'sendOtp']);
Route::post('/auth/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::get('/auth/me', [AuthController::class, 'me'])->middleware('auth:sanctum');

// Categories CRUD API
Route::apiResource('categories', CategoryController::class);

// Products / Tools CRUD API
Route::delete('/products/uncategorized', [ProductController::class, 'destroyUncategorized']);
Route::delete('/tools/uncategorized', [ProductController::class, 'destroyUncategorized']);
Route::delete('/products/bulk', [ProductController::class, 'bulkDestroy']);
Route::delete('/tools/bulk', [ProductController::class, 'bulkDestroy']);
Route::apiResource('products', ProductController::class);

// Backward-compatible routes for existing frontend
Route::get('/tools', [ProductController::class, 'index']);
Route::post('/tools', [ProductController::class, 'store']);
Route::get('/tools/{id}', [ProductController::class, 'show']);
Route::put('/tools/{id}', [ProductController::class, 'update']);
Route::delete('/tools/{id}', [ProductController::class, 'destroy']);

// Orders Management
Route::get('/orders', [OrderController::class, 'index']);
Route::post('/orders', [OrderController::class, 'store']);
Route::delete('/orders/bulk', [OrderController::class, 'bulkDestroy']);
Route::get('/orders/{id}', [OrderController::class, 'show']);
Route::put('/orders/{id}/activate', [OrderController::class, 'activate']);
Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);
Route::delete('/orders/{id}', [OrderController::class, 'destroy']);

// Subscribers Management
Route::get('/subscribers', [SubscriberController::class, 'index']);
Route::put('/subscribers/{id}/tokens', [SubscriberController::class, 'updateTokens']);
Route::delete('/subscribers/bulk', [SubscriberController::class, 'bulkDestroy']);
Route::delete('/subscribers/{id}', [SubscriberController::class, 'destroy']);

// KHQR Dynamic Gateway Payment Routes
Route::post('/payment/khqr/generate', [KhqrPaymentController::class, 'generate']);
Route::get('/payment/khqr/verify/{transaction_id}', [KhqrPaymentController::class, 'verify']);
Route::get('/payment/khqr/info', [KhqrPaymentController::class, 'info']);

// Global Settings & ABA PayWay Link
Route::get('/settings', [SettingController::class, 'getSettings']);
Route::put('/settings', [SettingController::class, 'updateSettings']);
Route::post('/settings/test-telegram', [SettingController::class, 'testTelegram']);

// Dashboard Stats
Route::get('/stats', [StatsController::class, 'index']);



// Outbound Connectivity Diagnostics Endpoint
Route::get('/diagnostics/mail', function () {
    $ports = [587, 465, 2525, 80, 443];
    $results = [];
    foreach ($ports as $port) {
        $t1 = microtime(true);
        $fp = @fsockopen('smtp.gmail.com', $port, $errno, $errstr, 2);
        $time = round((microtime(true) - $t1) * 1000);
        if ($fp) {
            $results[$port] = "OPEN ({$time}ms)";
            fclose($fp);
        } else {
            $results[$port] = "BLOCKED ($errstr)";
        }
    }
    return response()->json([
        'environment' => app()->environment(),
        'mail_mailer' => config('mail.default'),
        'mail_host' => config('mail.mailers.smtp.host'),
        'mail_port' => config('mail.mailers.smtp.port'),
        'port_tests' => $results,
    ]);
});
