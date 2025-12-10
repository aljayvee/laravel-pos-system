<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Run the specific UserSeeder first (creates admin)
        $this->call(UserSeeder::class);

        // Create additional random users using the Factory
        User::factory(5)->create();

        // Create a specific test user matching your schema
        User::factory()->create([
            'username' => 'testuser',
            'first_name' => 'Test',
            'last_name' => 'User',
            'role' => 'cashier',
            'password_hash' => Hash::make('password'),
        ]);
    }
}