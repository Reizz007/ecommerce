<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('product_id')->unique()->nullable();
            $table->string('name');
            $table->string('slug')->unique();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('category_slug')->default('llm');
            $table->string('badge')->nullable();
            $table->decimal('rating', 3, 2)->default(4.95);
            $table->integer('reviews_count')->default(100);
            $table->string('users_count')->default('10k+');
            $table->text('short_desc')->nullable();
            $table->longText('description')->nullable();
            $table->json('capabilities')->nullable();
            $table->decimal('price_monthly', 10, 2)->default(29.00);
            $table->decimal('price_lifetime', 10, 2)->default(199.00);
            $table->boolean('included_in_sub')->default(true);
            $table->string('engine_version')->nullable();
            $table->string('latency')->nullable();
            $table->string('icon')->default('Brain');
            $table->string('color')->default('#8b5cf6');
            $table->string('status')->default('Active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
