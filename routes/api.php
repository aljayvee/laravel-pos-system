<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PosController;

// Default Laravel route
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// --- YOUR POS ROUTES ---
Route::post('/login', [PosController::class, 'login']);
Route::get('/menu', [PosController::class, 'getMenu']);
Route::post('/order', [PosController::class, 'saveOrder']);
Route::get('/dashboard-stats', [PosController::class, 'getStats']);
Route::get('/daily-sales', [PosController::class, 'getDailySales']);
Route::post('/add-product', [PosController::class, 'addProduct']);

// User Management
// FIX: Ensure this matches the frontend call "/api/users"
Route::get('/users', [PosController::class, 'getUsers']); 
Route::post('/users/add', [PosController::class, 'addUser']);
Route::post('/users/update', [PosController::class, 'updateUser']);
Route::post('/users/delete', [PosController::class, 'deleteUser']);

// Reports
Route::get('/history', [PosController::class, 'getHistory']);
Route::get('/logs', [PosController::class, 'getLogs']);
Route::get('/sales-category', [PosController::class, 'getSalesByCategory']);

// Logout
Route::post('/logout', [PosController::class, 'logout']);

// Category Management
Route::post('/categories/add', [PosController::class, 'addCategory']);
Route::post('/categories/update', [PosController::class, 'updateCategory']);
Route::post('/categories/delete', [PosController::class, 'deleteCategory']);

// Product Management
Route::post('/products/update', [PosController::class, 'updateProduct']);
Route::post('/products/delete', [PosController::class, 'deleteProduct']);