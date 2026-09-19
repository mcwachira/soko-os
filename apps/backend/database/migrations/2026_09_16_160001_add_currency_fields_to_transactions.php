<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->string('currency', 3)->default('KES')->after('amount_minor');
            $table->decimal('exchange_rate', 20, 6)->default(1)->after('currency');
        });

        Schema::table('journal_entries', function (Blueprint $table) {
            $table->string('currency', 3)->default('KES')->after('entry_type');
            $table->decimal('exchange_rate', 20, 6)->default(1)->after('currency');
        });

        Schema::table('journal_lines', function (Blueprint $table) {
            $table->decimal('exchange_rate', 20, 6)->nullable()->after('credit_minor');
        });
    }

    public function down(): void
    {
        Schema::table('journal_lines', function (Blueprint $table) {
            $table->dropColumn(['exchange_rate']);
        });

        Schema::table('journal_entries', function (Blueprint $table) {
            $table->dropColumn(['currency', 'exchange_rate']);
        });

        Schema::table('expenses', function (Blueprint $table) {
            $table->dropColumn(['currency', 'exchange_rate']);
        });
    }
};
