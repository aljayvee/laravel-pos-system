<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ReportController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// --- AUTHENTICATION (Public) ---
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);

// --- SHARED/COMMON ROUTES (Authenticated) ---
Route::middleware('auth:sanctum')->group(function () {
    
    Route::get('/user', function (Request $request) { return $request->user(); });

    // --- CASHIER & ORDERING ---
    Route::get('/menu', [ProductController::class, 'getMenu']); // Cashier needs menu
    Route::post('/order', [OrderController::class, 'store']);
    
    // --- ADMIN & MANAGER & SECURITY ---
    // User Management
    Route::prefix('users')->group(function () {
        Route::get('/', [AdminController::class, 'index']);
        Route::post('/add', [AdminController::class, 'store']);
        Route::post('/update', [AdminController::class, 'update']);
        Route::post('/delete', [AdminController::class, 'destroy']);
        Route::get('/online', [AdminController::class, 'getOnlineUsers']);
    });

    // Product Management
    Route::prefix('products')->group(function () {
        Route::post('/add', [ProductController::class, 'store']);
        Route::post('/update', [ProductController::class, 'update']);
        Route::post('/delete', [ProductController::class, 'destroy']);
    });

    Route::prefix('categories')->group(function () {
        Route::post('/add', [ProductController::class, 'storeCategory']);
        Route::post('/update', [ProductController::class, 'updateCategory']);
        Route::post('/delete', [ProductController::class, 'destroyCategory']);
    });

    // Reports & Dashboard
    Route::get('/dashboard-stats', [ReportController::class, 'getStats']);
    Route::get('/daily-sales', [ReportController::class, 'getDailySales']);
    Route::get('/sales-category', [ReportController::class, 'getSalesByCategory']);
    Route::get('/history', [ReportController::class, 'getTransactionHistory']);
    Route::get('/logs', [AdminController::class, 'getAuditLogs']);
});