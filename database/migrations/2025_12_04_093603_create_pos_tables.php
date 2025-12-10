<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Users Table (Check if exists to avoid collision with default Laravel migration)
        if (!Schema::hasTable('users')) {
            Schema::create('users', function (Blueprint $table) {
                $table->id();
                $table->string('username')->unique(); // Ensure unique
                $table->string('password_hash');
                $table->string('first_name');
                $table->string('last_name');
                $table->string('role');
                $table->integer('status')->default(0); // 0 = Offline, 1 = Online
                $table->rememberToken(); // <--- Add this line
                $table->timestamps();
            });
        }

        // ... rest of the tables (categories, products, etc.) remain unchanged
        if (!Schema::hasTable('categories')) {
            Schema::create('categories', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('products')) {
            Schema::create('products', function (Blueprint $table) {
                $table->id();
                $table->foreignId('category_id')->constrained()->onDelete('cascade');
                $table->string('name');
                $table->decimal('price', 10, 2);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('transactions')) {
            Schema::create('transactions', function (Blueprint $table) {
                $table->id();
                $table->string('reference_number')->unique();
                $table->decimal('total_cost', 10, 2);
                $table->decimal('cash_paid', 10, 2);
                $table->decimal('change_amount', 10, 2);
                $table->string('order_status')->default('Completed');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('transaction_items')) {
            Schema::create('transaction_items', function (Blueprint $table) {
                $table->id();
                $table->foreignId('transaction_id')->constrained()->onDelete('cascade');
                $table->string('product_name');
                $table->integer('quantity');
                $table->decimal('price_at_sale', 10, 2);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('audit_logs')) {
            Schema::create('audit_logs', function (Blueprint $table) {
                $table->id();
                $table->string('username');
                $table->string('action');
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('transaction_items');
        Schema::dropIfExists('transactions');
        Schema::dropIfExists('products');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('users'); 
    }
};