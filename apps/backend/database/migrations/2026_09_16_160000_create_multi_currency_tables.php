<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('currencies', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->string('code', 3)->index();
            $table->string('name');
            $table->string('symbol')->nullable();
            $table->integer('decimal_places')->default(2);
            $table->boolean('is_base')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['organization_id', 'code']);
        });

        Schema::create('exchange_rates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('currency_id')->constrained()->cascadeOnDelete();
            $table->date('effective_date');
            $table->decimal('rate', 20, 6);
            $table->string('source')->default('manual');
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['organization_id', 'currency_id', 'effective_date']);
        });

        Schema::create('fx_adjustments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('journal_entry_id')->nullable()->constrained()->nullOnDelete();
            $table->string('adjustment_type')->default('unrealized');
            $table->date('effective_date');
            $table->bigInteger('gain_minor')->default(0);
            $table->bigInteger('loss_minor')->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fx_adjustments');
        Schema::dropIfExists('exchange_rates');
        Schema::dropIfExists('currencies');
    }
};
