<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_stocks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('product_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('warehouse_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('quantity_on_hand', 12, 4)->default(0);
            $table->decimal('quantity_reserved', 12, 4)->default(0);
            $table->decimal('quantity_available', 12, 4)->default(0);
            $table->timestamps();

            $table->unique(['organization_id', 'product_id', 'warehouse_id'], 'product_stocks_org_prod_wh_unique');
            $table->index(['organization_id', 'product_id'], 'product_stocks_org_prod_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_stocks');
    }
};
