<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->json('accounting_ids')->nullable()->after('price_level');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->json('accounting_ids')->nullable()->after('is_active');
        });

        Schema::table('sales', function (Blueprint $table) {
            $table->json('accounting_ids')->nullable()->after('accounting_sync_status');
        });

        Schema::table('returns', function (Blueprint $table) {
            $table->json('accounting_ids')->nullable()->after('approved_at');
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn('accounting_ids');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('accounting_ids');
        });

        Schema::table('sales', function (Blueprint $table) {
            $table->dropColumn('accounting_ids');
        });

        Schema::table('returns', function (Blueprint $table) {
            $table->dropColumn('accounting_ids');
        });
    }
};
