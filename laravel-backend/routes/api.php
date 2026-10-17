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
Route::post('/auth/login', [AuthController::class, 'login']);
Route::get('/auth/me', [AuthController::class, 'me'])->middleware('auth:sanctum');

// Categories CRUD API
Route::apiResource('categories', CategoryController::class);

// Products / Tools CRUD API
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
Route::get('/orders/{id}', [OrderController::class, 'show']);
Route::put('/orders/{id}/activate', [OrderController::class, 'activate']);
Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);

// Subscribers Management
Route::get('/subscribers', [SubscriberController::class, 'index']);
Route::put('/subscribers/{id}/tokens', [SubscriberController::class, 'updateTokens']);

// KHQR Dynamic Gateway Payment Routes
Route::post('/payment/khqr/generate', [KhqrPaymentController::class, 'generate']);
Route::get('/payment/khqr/verify/{transaction_id}', [KhqrPaymentController::class, 'verify']);
Route::get('/payment/khqr/info', [KhqrPaymentController::class, 'info']);

// Global Settings & ABA PayWay Link
Route::get('/settings', [SettingController::class, 'getSettings']);
Route::put('/settings', [SettingController::class, 'updateSettings']);

// Dashboard Stats
Route::get('/stats', [StatsController::class, 'index']);
