<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Users Table
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('username')->unique();
            $table->string('password_hash');
            $table->string('first_name');
            $table->string('last_name');
            $table->string('role');
            $table->integer('status')->default(0); // Added status column
            $table->timestamps();
        });

        // Categories Table
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
        });

        // Products Table
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->decimal('price', 10, 2);
            $table->timestamps();
        });

        // Transactions Table
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('reference_number')->unique();
            $table->decimal('total_cost', 10, 2);
            $table->decimal('cash_paid', 10, 2);
            $table->decimal('change_amount', 10, 2);
            $table->string('order_type')->default('Dine In');
            $table->timestamp('created_at')->useCurrent();
        });

        // Transaction Items Table
        Schema::create('transaction_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->constrained()->onDelete('cascade');
            $table->string('product_name');
            $table->integer('quantity');
            $table->decimal('price_at_sale', 10, 2);
        });
        
        // Logs Table
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->string('username');
            $table->text('action');
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down()
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('transaction_items');
        Schema::dropIfExists('transactions');
        Schema::dropIfExists('products');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('users');
    }
};