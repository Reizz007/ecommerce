<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->string('customer_name');
            $table->string('customer_email');
            $table->string('company')->nullable();
            $table->json('items')->nullable();
            $table->decimal('amount', 10, 2);
            $table->string('payment_method')->default('ABA PAY / PayWay');
            $table->string('aba_link')->nullable();
            $table->string('status')->default('Verified');
            $table->string('api_key')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
