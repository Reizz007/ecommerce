<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscribers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('plan')->default('Pro AI Suite (Annual)');
            $table->string('tier')->default('pro');
            $table->bigInteger('tokens_used')->default(0);
            $table->bigInteger('token_limit')->default(15000000);
            $table->string('status')->default('Active');
            $table->string('renews_on')->nullable();
            $table->string('payment_method')->default('ABA PAY / PayWay');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscribers');
    }
};
