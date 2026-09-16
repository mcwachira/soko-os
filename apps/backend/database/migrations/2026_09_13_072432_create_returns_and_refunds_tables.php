<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('returns', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('branch_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('terminal_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('sale_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('cashier_user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreignUuid('shift_id')->nullable()->references('id')->on('cash_shifts')->nullOnDelete();
            $table->string('return_number')->unique();
            $table->string('status')->default('pending'); // pending, approved, rejected, completed, cancelled
            $table->string('return_type')->default('refund'); // refund, exchange, store_credit
            $table->bigInteger('subtotal_minor')->default(0);
            $table->bigInteger('tax_total_minor')->default(0);
            $table->bigInteger('grand_total_minor')->default(0);
            $table->bigInteger('refunded_total_minor')->default(0);
            $table->text('reason')->nullable();
            $table->text('notes')->nullable();
            $table->foreignUuid('approved_by_user_id')->nullable()->references('id')->on('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('return_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('return_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('sale_item_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('product_id')->constrained()->cascadeOnDelete();
            $table->string('sku');
            $table->string('name');
            $table->decimal('quantity', 12, 4);
            $table->bigInteger('unit_price_minor');
            $table->bigInteger('discount_minor')->default(0);
            $table->decimal('tax_rate_percentage', 5, 2)->default(16.0);
            $table->bigInteger('tax_amount_minor')->default(0);
            $table->bigInteger('subtotal_minor');
            $table->bigInteger('total_minor');
            $table->string('return_reason')->nullable(); // defective, wrong_item, changed_mind, etc.
            $table->string('condition')->default('good'); // good, damaged, expired
            $table->timestamps();
        });

        Schema::create('refunds', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('branch_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('return_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('sale_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('payment_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('customer_id')->nullable()->constrained()->nullOnDelete();
            $table->string('refund_number')->unique();
            $table->string('status')->default('pending'); // pending, processing, completed, failed, cancelled
            $table->string('refund_method'); // cash, card, mpesa, airtel, bank, store_credit, original
            $table->bigInteger('amount_minor');
            $table->string('currency', 3)->default('KES');
            $table->string('reference')->nullable();
            $table->string('external_transaction_id')->nullable();
            $table->json('provider_response')->nullable();
            $table->text('reason')->nullable();
            $table->foreignUuid('processed_by_user_id')->nullable()->references('id')->on('users')->nullOnDelete();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('refund_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('refund_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('return_item_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('sale_item_id')->constrained()->cascadeOnDelete();
            $table->decimal('quantity', 12, 4);
            $table->bigInteger('unit_price_minor');
            $table->bigInteger('tax_amount_minor')->default(0);
            $table->bigInteger('total_minor');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('refund_items');
        Schema::dropIfExists('refunds');
        Schema::dropIfExists('return_items');
        Schema::dropIfExists('returns');
    }
};
