<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_layers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('organization_id');
            $table->uuid('business_id')->nullable();
            $table->uuid('warehouse_id')->nullable();
            $table->uuid('product_id');
            $table->string('layer_type', 50)->default('purchase');
            $table->decimal('quantity', 12, 4)->default(0);
            $table->decimal('remaining_quantity', 12, 4)->default(0);
            $table->unsignedInteger('unit_cost_minor')->default(0);
            $table->unsignedInteger('total_cost_minor')->default(0);
            $table->uuid('reference_id')->nullable();
            $table->string('reference_type', 100)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['organization_id', 'product_id', 'warehouse_id'], 'idx_inventory_layers_lookup');
            $table->index(['product_id', 'warehouse_id', 'remaining_quantity'], 'idx_inventory_layers_valuation');
            $table->index('reference_id', 'idx_inventory_layers_reference');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_layers');
    }
};
