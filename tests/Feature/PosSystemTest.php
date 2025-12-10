<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Category;
use App\Models\Product;

class PosSystemTest extends TestCase
{
    // Use RefreshDatabase to reset DB for every test (White-box isolation)
    use RefreshDatabase;

    public function test_login_api_returns_user_data_and_updates_status()
    {
        // 1. Arrange: Create a user
        $user = User::create([
            'username' => 'admin',
            'password_hash' => hash('sha256', 'password'),
            'first_name' => 'Admin',
            'last_name' => 'User',
            'role' => 'admin',
            'status' => 0
        ]);

        // 2. Act: Call the API
        $response = $this->postJson('/api/login', [
            'username' => 'admin',
            'password' => 'password',
        ]);

        // 3. Assert (Black-box): Check JSON response
        $response->assertStatus(200)
                 ->assertJson([
                     'username' => 'admin',
                     'role' => 'admin'
                 ]);

        // 4. Assert (White-box): Check Database state
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'status' => 1 // Status should be updated to online
        ]);
    }

    public function test_logout_api_updates_status_to_offline()
    {
        // Arrange
        $user = User::create([
            'username' => 'cashier',
            'password_hash' => hash('sha256', '123'),
            'first_name' => 'Cash',
            'last_name' => 'ier',
            'role' => 'cashier',
            'status' => 1
        ]);

        // Act
        $response = $this->postJson('/api/logout', [
            'id' => $user->id
        ]);

        // Assert
        $response->assertStatus(200);
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'status' => 0 // Should be offline
        ]);
    }

    public function test_get_menu_returns_categories_and_products()
    {
        // Arrange
        $cat = Category::create(['name' => 'Drinks']);
        Product::create(['category_id' => $cat->id, 'name' => 'Coke', 'price' => 50]);

        // Act
        $response = $this->getJson('/api/menu');

        // Assert
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'Drinks' => [
                         '*' => ['id', 'name', 'price']
                     ]
                 ]);
    }

    public function test_save_order_transaction()
    {
        // Arrange
        $user = User::create(['username' => 'cashier', 'password_hash' => 'x', 'first_name'=>'C', 'last_name'=>'U', 'role'=>'cashier']);
        
        $data = [
            'referenceNumber' => 'TX-1001',
            'totalCost' => 100,
            'cashPaid' => 150,
            'change' => 50,
            'orderType' => 'Dine In',
            'cashier' => 'cashier',
            'items' => [
                ['name' => 'Burger', 'quantity' => 1, 'price' => 100]
            ]
        ];

        // Act
        $response = $this->postJson('/api/order', $data);

        // Assert
        $response->assertStatus(200)
                 ->assertJson(['success' => true]);

        $this->assertDatabaseHas('transactions', ['reference_number' => 'TX-1001']);
        $this->assertDatabaseHas('transaction_items', ['product_name' => 'Burger']);
    }

    public function test_get_users_returns_list()
    {
        // Arrange
        User::create(['username' => 'u1', 'password_hash' => 'x', 'first_name'=>'F', 'last_name'=>'L', 'role'=>'admin']);
        User::create(['username' => 'u2', 'password_hash' => 'x', 'first_name'=>'F', 'last_name'=>'L', 'role'=>'cashier']);

        // Act
        $response = $this->getJson('/api/users');

        // Assert
        $response->assertStatus(200);
        $this->assertCount(2, $response->json());
    }

    public function test_add_product_api()
    {
        // Act
        $response = $this->postJson('/api/add-product', [
            'category' => 'New Cat',
            'name' => 'New Item',
            'price' => 99.00
        ]);

        // Assert
        $response->assertStatus(200)->assertJson(['success' => true]);
        $this->assertDatabaseHas('categories', ['name' => 'New Cat']);
        $this->assertDatabaseHas('products', ['name' => 'New Item', 'price' => 99.00]);
    }
}