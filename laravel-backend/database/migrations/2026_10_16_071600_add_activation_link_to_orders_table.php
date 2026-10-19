<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('activation_link')->nullable()->after('api_key');
            $table->text('activation_note')->nullable()->after('activation_link');
            $table->timestamp('activated_at')->nullable()->after('activation_note');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['activation_link', 'activation_note', 'activated_at']);
        });
    }
};
