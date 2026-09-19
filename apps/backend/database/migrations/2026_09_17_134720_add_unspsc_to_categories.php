<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->string('unspsc_code', 20)->nullable()->after('slug');
            $table->string('unspsc_description', 255)->nullable()->after('unspsc_code');
            $table->index('unspsc_code', 'idx_categories_unspsc');
        });
    }

    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropIndex('idx_categories_unspsc');
            $table->dropColumn(['unspsc_code', 'unspsc_description']);
        });
    }
};
