<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('carts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('branch_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('terminal_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreignUuid('customer_id')->nullable()->constrained()->nullOnDelete();
            $table->string('status')->default('active'); // active, held, completed, abandoned
            $table->bigInteger('subtotal_minor')->default(0);
            $table->bigInteger('discount_minor')->default(0);
            $table->bigInteger('tax_total_minor')->default(0);
            $table->bigInteger('grand_total_minor')->default(0);
            $table->text('notes')->nullable();
            $table->timestamp('held_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('cart_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('cart_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('product_id')->constrained()->cascadeOnDelete();
            $table->string('sku');
            $table->string('name');
            $table->decimal('quantity', 12, 4)->default(1);
            $table->bigInteger('unit_price_minor');
            $table->bigInteger('discount_minor')->default(0);
            $table->decimal('tax_rate_percentage', 5, 2)->default(16.0);
            $table->bigInteger('tax_amount_minor')->default(0);
            $table->bigInteger('subtotal_minor');
            $table->bigInteger('total_minor');
            $table->timestamps();
        });

        Schema::create('price_overrides', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('sale_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('sale_item_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('product_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreignUuid('approved_by_user_id')->nullable()->references('id')->on('users')->nullOnDelete();
            $table->bigInteger('original_price_minor');
            $table->bigInteger('new_price_minor');
            $table->bigInteger('difference_minor');
            $table->string('reason')->nullable();
            $table->string('status')->default('pending'); // pending, approved, rejected
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
        });

        Schema::create('cash_movements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('branch_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('terminal_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('shift_id')->nullable()->references('id')->on('cash_shifts')->nullOnDelete();
            $table->foreignUuid('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->string('movement_type'); // cash_in, cash_out, safe_drop, float
            $table->bigInteger('amount_minor');
            $table->string('currency', 3)->default('KES');
            $table->string('reference')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('loyalty_accounts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('customer_id')->constrained()->cascadeOnDelete();
            $table->string('tier')->default('bronze'); // bronze, silver, gold
            $table->bigInteger('points_balance')->default(0);
            $table->bigInteger('total_earned')->default(0);
            $table->bigInteger('total_redeemed')->default(0);
            $table->timestamp('tier_updated_at')->nullable();
            $table->timestamps();
            $table->unique(['organization_id', 'customer_id']);
        });

        Schema::create('loyalty_transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('loyalty_account_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('sale_id')->nullable()->constrained()->nullOnDelete();
            $table->string('transaction_type'); // earn, redeem, adjust, expire
            $table->integer('points');
            $table->string('description')->nullable();
            $table->timestamps();
        });

        Schema::create('store_credits', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('customer_id')->constrained()->cascadeOnDelete();
            $table->bigInteger('amount_minor');
            $table->string('currency', 3)->default('KES');
            $table->string('type'); // issued, redeemed, refunded, adjusted
            $table->string('reference_type')->nullable(); // sale, return, manual
            $table->string('reference_id')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('quick_keys', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('terminal_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('action_type'); // product, variant, service, custom
            $table->string('action_data'); // JSON: product_id, variant_id, etc.
            $table->string('color')->default('#000000');
            $table->integer('position')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quick_keys');
        Schema::dropIfExists('store_credits');
        Schema::dropIfExists('loyalty_transactions');
        Schema::dropIfExists('loyalty_accounts');
        Schema::dropIfExists('cash_movements');
        Schema::dropIfExists('price_overrides');
        Schema::dropIfExists('cart_items');
        Schema::dropIfExists('carts');
    }
};
