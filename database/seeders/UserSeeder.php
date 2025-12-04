<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        // Re-create the admin user from your Electron app
        DB::table('users')->insert([
            'username' => 'admin',
            // Laravel uses Bcrypt (Hash::make), unlike the simple SHA256 in your old app
            'password_hash' => hash('sha256', 'admin123'), 
            'first_name' => 'Super',
            'last_name' => 'Admin',
            'role' => 'admin',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Add Categories
        DB::table('categories')->insert([
            ['name' => 'Best Sellers'],
            ['name' => 'Drinks'],
            ['name' => 'Combos'],
        ]);
    }
}