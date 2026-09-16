<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->foreignUuid('organization_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
        });

        Schema::table('sale_items', function (Blueprint $table) {
            $table->foreignUuid('organization_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropConstrainedForeignId('organization_id');
        });

        Schema::table('sale_items', function (Blueprint $table) {
            $table->dropConstrainedForeignId('organization_id');
        });
    }
};
