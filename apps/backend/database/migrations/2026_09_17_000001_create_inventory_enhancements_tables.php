<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Units & Unit Conversions
        Schema::create('units', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('symbol');
            $table->string('type')->default('base'); // base, purchase, warehouse, sales
            $table->boolean('is_base')->default(false);
            $table->timestamps();
        });

        Schema::create('unit_conversions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('from_unit_id')->constrained('units')->cascadeOnDelete();
            $table->foreignUuid('to_unit_id')->constrained('units')->cascadeOnDelete();
            $table->decimal('conversion_factor', 12, 6);
            $table->timestamps();
        });

        // Product Variants
        Schema::create('product_variants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('product_id')->constrained()->cascadeOnDelete();
            $table->string('sku')->index();
            $table->string('barcode')->nullable()->index();
            $table->json('attributes'); // size, color, etc.
            $table->bigInteger('cost_price_minor')->default(0);
            $table->bigInteger('selling_price_minor')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        // Batches & Serial Numbers
        Schema::create('batches', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('warehouse_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('product_id')->constrained()->cascadeOnDelete();
            $table->string('batch_number')->index();
            $table->date('manufacture_date')->nullable();
            $table->date('expiry_date')->nullable();
            $table->string('supplier')->nullable();
            $table->decimal('quantity', 12, 4)->default(0);
            $table->bigInteger('unit_cost_minor')->default(0);
            $table->string('status')->default('active'); // active, expired, recalled, quarantined
            $table->timestamps();
        });

        Schema::create('serial_numbers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('warehouse_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('product_id')->constrained()->cascadeOnDelete();
            $table->string('serial_number')->index();
            $table->string('status')->default('in_stock'); // in_stock, reserved, sold, returned, repaired, written_off, disposed
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        // Bins / Locations
        Schema::create('zones', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('warehouse_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('code')->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('bins', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('warehouse_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('zone_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('code')->nullable();
            $table->string('aisle')->nullable();
            $table->string('rack')->nullable();
            $table->string('shelf')->nullable();
            $table->decimal('capacity', 12, 4)->nullable();
            $table->string('status')->default('active'); // active, inactive, blocked
            $table->integer('pick_priority')->default(0);
            $table->integer('putaway_priority')->default(0);
            $table->timestamps();
        });

        // Stock Adjustments
        Schema::create('inventory_adjustments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('branch_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('warehouse_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->string('adjustment_number')->unique();
            $table->string('type'); // positive, negative, damage, loss, expiry, theft, stocktake, found, write_off
            $table->text('reason');
            $table->string('status')->default('pending'); // pending, approved, posted, cancelled
            $table->foreignUuid('approved_by_user_id')->nullable()->references('id')->on('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
        });

        Schema::create('inventory_adjustment_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('adjustment_id')->constrained('inventory_adjustments')->cascadeOnDelete();
            $table->foreignUuid('product_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('bin_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('quantity_before', 12, 4);
            $table->decimal('quantity_change', 12, 4);
            $table->decimal('quantity_after', 12, 4);
            $table->bigInteger('unit_cost_minor')->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // Stocktakes
        Schema::create('stocktakes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('branch_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('warehouse_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->string('stocktake_number')->unique();
            $table->string('type'); // full, zone, category, product, cycle
            $table->json('scope')->nullable(); // product_ids, category_ids, bin_ids
            $table->boolean('freeze_stock')->default(false);
            $table->boolean('blind_count')->default(false);
            $table->string('status')->default('draft'); // draft, in_progress, completed, approved, posted, cancelled
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->foreignUuid('approved_by_user_id')->nullable()->references('id')->on('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
        });

        Schema::create('stocktake_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('stocktake_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('product_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('bin_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('system_quantity', 12, 4);
            $table->decimal('counted_quantity', 12, 4)->nullable();
            $table->decimal('variance', 12, 4)->nullable();
            $table->string('status')->default('pending'); // pending, counted, recounted, approved, posted
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // Transfers
        Schema::create('transfer_orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('branch_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('source_warehouse_id')->constrained('warehouses')->cascadeOnDelete();
            $table->foreignUuid('destination_warehouse_id')->constrained('warehouses')->cascadeOnDelete();
            $table->foreignUuid('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->string('transfer_number')->unique();
            $table->string('status')->default('draft'); // draft, approved, dispatched, in_transit, received, completed, cancelled
            $table->text('notes')->nullable();
            $table->timestamp('dispatched_at')->nullable();
            $table->timestamp('received_at')->nullable();
            $table->timestamps();
        });

        Schema::create('transfer_order_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('transfer_order_id')->constrained('transfer_orders')->cascadeOnDelete();
            $table->foreignUuid('product_id')->constrained()->cascadeOnDelete();
            $table->decimal('quantity_requested', 12, 4);
            $table->decimal('quantity_dispatched', 12, 4)->default(0);
            $table->decimal('quantity_received', 12, 4)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // Assemblies / Kitting
        Schema::create('assemblies', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('warehouse_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('finished_product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignUuid('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->string('assembly_number')->unique();
            $table->string('type'); // assembly, disassembly, kit
            $table->decimal('quantity', 12, 4);
            $table->string('status')->default('draft'); // draft, completed, reversed
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('assembly_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('assembly_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('product_id')->constrained()->cascadeOnDelete();
            $table->decimal('quantity', 12, 4);
            $table->bigInteger('unit_cost_minor')->default(0);
            $table->timestamps();
        });

        // Landed Costs
        Schema::create('landed_costs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('purchase_order_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('grn_id')->constrained('goods_received_notes')->cascadeOnDelete();
            $table->foreignUuid('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->string('landed_cost_number')->unique();
            $table->json('costs'); // freight, insurance, customs_duty, handling, etc.
            $table->bigInteger('total_cost_minor')->default(0);
            $table->string('allocation_method'); // quantity, value, weight, volume, manual
            $table->string('status')->default('draft'); // draft, allocated, posted
            $table->timestamps();
        });

        Schema::create('landed_cost_allocations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('landed_cost_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('product_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('purchase_order_item_id')->constrained()->cascadeOnDelete();
            $table->bigInteger('allocated_cost_minor')->default(0);
            $table->timestamps();
        });

        // Replenishment
        Schema::create('replenishment_rules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('product_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('warehouse_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('preferred_supplier_id')->nullable()->constrained('suppliers')->nullOnDelete();
            $table->integer('reorder_point')->default(0);
            $table->integer('reorder_quantity')->default(0);
            $table->integer('minimum_stock')->default(0);
            $table->integer('maximum_stock')->default(0);
            $table->integer('safety_stock')->default(0);
            $table->integer('lead_time_days')->default(0);
            $table->string('status')->default('active'); // active, inactive
            $table->timestamps();
        });

        Schema::create('replenishment_suggestions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('product_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('warehouse_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('preferred_supplier_id')->nullable()->constrained('suppliers')->nullOnDelete();
            $table->integer('suggested_quantity')->default(0);
            $table->string('reason'); // below_reorder_point, below_safety_stock, out_of_stock
            $table->string('status')->default('pending'); // pending, converted, dismissed
            $table->timestamps();
        });

        // Price Lists
        Schema::create('price_lists', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('type'); // retail, wholesale, vip, customer_specific, vendor
            $table->string('currency', 3)->default('KES');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('price_list_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('price_list_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('product_id')->constrained()->cascadeOnDelete();
            $table->decimal('min_quantity', 12, 4)->nullable();
            $table->decimal('max_quantity', 12, 4)->nullable();
            $table->bigInteger('unit_price_minor')->default(0);
            $table->timestamps();
        });

        // Packages & Shipments
        Schema::create('packages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('sale_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('sales_order_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('warehouse_id')->constrained()->cascadeOnDelete();
            $table->string('package_number')->unique();
            $table->string('status')->default('pending'); // pending, packed, shipped, delivered
            $table->decimal('weight', 10, 2)->nullable();
            $table->string('dimensions')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('package_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('package_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('product_id')->constrained()->cascadeOnDelete();
            $table->decimal('quantity', 12, 4);
            $table->timestamps();
        });

        Schema::create('shipments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('sale_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('sales_order_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('warehouse_id')->constrained()->cascadeOnDelete();
            $table->string('shipment_number')->unique();
            $table->string('carrier')->nullable();
            $table->string('tracking_number')->nullable();
            $table->string('status')->default('pending'); // pending, picked_up, in_transit, out_for_delivery, delivered, failed, returned
            $table->string('shipping_label_url')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('shipment_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('shipment_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('package_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('product_id')->constrained()->cascadeOnDelete();
            $table->decimal('quantity', 12, 4);
            $table->timestamps();
        });

        // eTIMS Stock Submissions
        Schema::create('etims_stock_submissions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->string('event_type'); // stock_inflow, purchase_receipt, adjustment, assembly, import
            $table->foreignUuid('inventory_event_id')->constrained('inventory_movements')->cascadeOnDelete();
            $table->json('payload');
            $table->string('hash')->unique();
            $table->string('submission_status')->default('queued'); // queued, submitted, accepted, rejected, retrying, failed, blocked_external
            $table->integer('attempt_count')->default(0);
            $table->timestamp('last_attempt_at')->nullable();
            $table->timestamp('next_retry_at')->nullable();
            $table->string('external_reference')->nullable();
            $table->string('response_code')->nullable();
            $table->json('response_payload')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('etims_stock_submissions');
        Schema::dropIfExists('shipment_items');
        Schema::dropIfExists('shipments');
        Schema::dropIfExists('package_items');
        Schema::dropIfExists('packages');
        Schema::dropIfExists('price_list_items');
        Schema::dropIfExists('price_lists');
        Schema::dropIfExists('replenishment_suggestions');
        Schema::dropIfExists('replenishment_rules');
        Schema::dropIfExists('landed_cost_allocations');
        Schema::dropIfExists('landed_costs');
        Schema::dropIfExists('assembly_items');
        Schema::dropIfExists('assemblies');
        Schema::dropIfExists('transfer_order_items');
        Schema::dropIfExists('transfer_orders');
        Schema::dropIfExists('stocktake_items');
        Schema::dropIfExists('stocktakes');
        Schema::dropIfExists('inventory_adjustment_items');
        Schema::dropIfExists('inventory_adjustments');
        Schema::dropIfExists('bins');
        Schema::dropIfExists('zones');
        Schema::dropIfExists('serial_numbers');
        Schema::dropIfExists('batches');
        Schema::dropIfExists('product_variants');
        Schema::dropIfExists('unit_conversions');
        Schema::dropIfExists('units');
    }
};
