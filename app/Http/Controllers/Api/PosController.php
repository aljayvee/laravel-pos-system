<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Category;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash; // Laravel uses Bcrypt, not SHA256 usually, but we will adapt.

class PosController extends Controller
{
    // 1. Auth (Login)
    public function login(Request $request) {
        // NOTE: In production, use Laravel Sanctum. For this migration, we simulate the logic.
        // Assuming you migrate the SHA256 logic or switch to Laravel Bcrypt.
        // This example assumes you switched to standard Laravel Bcrypt.
        $user = User::where('username', $request->username)->first();
        
        // Simple hash check for migration compatibility (SHA256)
        $inputHash = hash('sha256', $request->password);
        
        if ($user && $user->password_hash === $inputHash) {
            AuditLog::create(['username' => $user->username, 'action' => 'Logged In']);
            return response()->json($user);
        }
        return response()->json(null, 401);
    }

    // 2. Get Menu (Categorized)
    public function getMenu() {
        $categories = Category::with('products')->orderBy('name')->get();
        $menu = [];
        foreach($categories as $cat) {
            $menu[$cat->name] = $cat->products;
        }
        return response()->json($menu);
    }

    // 3. Save Order
    public function saveOrder(Request $request) {
        DB::beginTransaction();
        try {
            $tx = Transaction::create([
                'reference_number' => $request->referenceNumber,
                'total_cost' => $request->totalCost,
                'cash_paid' => $request->cashPaid,
                'change_amount' => $request->change,
                'order_status' => $request->orderType ?? 'Completed'
            ]);

            foreach($request->items as $item) {
                TransactionItem::create([
                    'transaction_id' => $tx->id,
                    'product_name' => $item['name'],
                    'quantity' => $item['quantity'],
                    'price_at_sale' => $item['price']
                ]);
            }

            AuditLog::create([
                'username' => $request->cashier,
                'action' => "Processed Order {$request->referenceNumber}"
            ]);

            DB::commit();
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['success' => false, 'error' => $e->getMessage()]);
        }
    }

    // 4. Dashboard Stats
    public function getStats() {
        $today = now()->format('Y-m-d');
        
        return response()->json([
            'todayRevenue' => Transaction::whereDate('created_at', $today)->sum('total_cost'),
            'todayOrders' => Transaction::whereDate('created_at', $today)->count(),
            'totalOrders' => Transaction::count(),
            'userCount' => User::count()
        ]);
    }
    
    // 5. Daily Sales Chart
    public function getDailySales() {
         $sales = Transaction::selectRaw('DATE(created_at) as date, SUM(total_cost) as total')
            ->where('created_at', '>=', now()->subDays(6))
            ->groupBy('date')
            ->orderBy('date')
            ->get();
         return response()->json($sales);
    }

    // 6. Manage Products (Add/Edit/Delete handled here simpler for brevity)
    public function addProduct(Request $request) {
        $cat = Category::firstOrCreate(['name' => $request->category]);
        Product::create([
            'category_id' => $cat->id,
            'name' => $request->name,
            'price' => $request->price
        ]);
        return response()->json(['success' => true]);
    }

    //7. --- USER MANAGEMENT (Security / Admin) ---
    public function getUsers() {
        // Return users with their online status (simulated or real)
        return response()->json(User::all());
    }

    public function addUser(Request $request) {
        try {
            User::create([
                'username' => $request->username,
                'password_hash' => hash('sha256', $request->password), // SHA256 for compatibility
                'first_name' => $request->firstName,
                'last_name' => $request->lastName,
                'role' => $request->role
            ]);
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()]);
        }
    }

    public function updateUser(Request $request) {
        try {
            $user = User::find($request->id);
            $data = [
                'username' => $request->username,
                'first_name' => $request->firstName,
                'last_name' => $request->lastName,
                'role' => $request->role
            ];
            // Only update password if provided
            if (!empty($request->password)) {
                $data['password_hash'] = hash('sha256', $request->password);
            }
            $user->update($data);
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()]);
        }
    }

    public function deleteUser(Request $request) {
        User::destroy($request->id);
        return response()->json(['success' => true]);
    }

    // --- ADMIN REPORTS ---
    public function getHistory() {
        return response()->json(Transaction::orderBy('id', 'desc')->limit(100)->get());
    }

    public function getLogs() {
        return response()->json(AuditLog::orderBy('id', 'desc')->limit(100)->get());
    }

    public function getSalesByCategory() {
        $data = DB::table('transaction_items')
            ->join('products', 'transaction_items.product_name', '=', 'products.name')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->select('categories.name as category', DB::raw('SUM(transaction_items.quantity * transaction_items.price_at_sale) as total_sales'))
            ->groupBy('categories.name')
            ->get();
        return response()->json($data);
    }

    //logout

    public function logout(Request $request) {
        // In a real app using Sanctum, you would revoke tokens here.
        // For this migration, we just handle the status if you have a tracking table, 
        // or simply return success.
        return response()->json(['success' => true]);
    }


    // --- CATEGORY MANAGEMENT ---
    public function addCategory(Request $request) {
        try {
            Category::create(['name' => $request->name]);
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()]);
        }
    }

    public function updateCategory(Request $request) {
        try {
            $cat = Category::find($request->id);
            $cat->update(['name' => $request->name]);
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()]);
        }
    }

    public function deleteCategory(Request $request) {
        try {
            Category::destroy($request->id);
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()]);
        }
    }

    // --- PRODUCT MANAGEMENT ---
    public function updateProduct(Request $request) {
        try {
            $prod = Product::find($request->id);
            $prod->update([
                'name' => $request->name,
                'price' => $request->price
            ]);
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()]);
        }
    }

    public function deleteProduct(Request $request) {
        try {
            Product::destroy($request->id);
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()]);
        }
    }

}