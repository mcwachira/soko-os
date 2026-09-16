<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('suppliers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('contact_person')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('tax_pin')->nullable();
            $table->text('address')->nullable();
            $table->bigInteger('credit_limit_minor')->default(0);
            $table->bigInteger('current_balance_minor')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('branch_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('warehouse_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('supplier_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->string('po_number')->unique();
            $table->string('status')->default('draft');
            $table->bigInteger('subtotal_minor')->default(0);
            $table->bigInteger('tax_total_minor')->default(0);
            $table->bigInteger('grand_total_minor')->default(0);
            $table->date('expected_date')->nullable();
            $table->date('received_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('purchase_order_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('purchase_order_id')->constrained()->cascadeOnDelete();
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
            $table->decimal('received_quantity', 12, 4)->default(0);
            $table->timestamps();
        });

        Schema::create('goods_received_notes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('branch_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('warehouse_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('purchase_order_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('supplier_id')->constrained()->cascadeOnDelete();
            $table->string('grn_number')->unique();
            $table->foreignUuid('received_by_user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('goods_received_note_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('grn_id')->references('id')->on('goods_received_notes')->cascadeOnDelete();
            $table->foreignUuid('purchase_order_item_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('product_id')->constrained()->cascadeOnDelete();
            $table->decimal('quantity_received', 12, 4);
            $table->bigInteger('unit_cost_minor');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('goods_received_note_items');
        Schema::dropIfExists('goods_received_notes');
        Schema::dropIfExists('purchase_order_items');
        Schema::dropIfExists('purchase_orders');
        Schema::dropIfExists('suppliers');
    }
};
