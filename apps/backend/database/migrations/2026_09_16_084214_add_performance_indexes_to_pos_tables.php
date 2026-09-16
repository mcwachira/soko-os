<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->index(['organization_id', 'branch_id', 'status', 'created_at'], 'sales_org_branch_status_created_idx');
            $table->index(['organization_id', 'receipt_number'], 'sales_org_receipt_idx');
        });

        Schema::table('sale_items', function (Blueprint $table) {
            $table->index(['sale_id', 'product_id'], 'sale_items_sale_product_idx');
        });

        Schema::table('inventory_movements', function (Blueprint $table) {
            $table->index(['organization_id', 'product_id', 'warehouse_id', 'created_at'], 'inv_mov_org_prod_wh_created_idx');
            $table->index(['product_id', 'created_at'], 'inv_mov_prod_created_idx');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->index(['sale_id', 'payment_method', 'status'], 'payments_sale_method_status_idx');
        });

        Schema::table('cash_shifts', function (Blueprint $table) {
            $table->index(['organization_id', 'branch_id', 'status'], 'shifts_org_branch_status_idx');
        });

        Schema::table('returns', function (Blueprint $table) {
            $table->index(['organization_id', 'sale_id', 'status'], 'returns_org_sale_status_idx');
        });

        Schema::table('refunds', function (Blueprint $table) {
            $table->index(['organization_id', 'sale_id', 'status'], 'refunds_org_sale_status_idx');
        });

        Schema::table('sync_operations', function (Blueprint $table) {
            $table->index(['organization_id', 'entity_name', 'status'], 'sync_ops_org_entity_status_idx');
        });
    }

    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->dropIndex('sales_org_branch_status_created_idx');
            $table->dropIndex('sales_org_receipt_idx');
        });

        Schema::table('sale_items', function (Blueprint $table) {
            $table->dropIndex('sale_items_sale_product_idx');
        });

        Schema::table('inventory_movements', function (Blueprint $table) {
            $table->dropIndex('inv_mov_org_prod_wh_created_idx');
            $table->dropIndex('inv_mov_prod_created_idx');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex('payments_sale_method_status_idx');
        });

        Schema::table('cash_shifts', function (Blueprint $table) {
            $table->dropIndex('shifts_org_branch_status_idx');
        });

        Schema::table('returns', function (Blueprint $table) {
            $table->dropIndex('returns_org_sale_status_idx');
        });

        Schema::table('refunds', function (Blueprint $table) {
            $table->dropIndex('refunds_org_sale_status_idx');
        });

        Schema::table('sync_operations', function (Blueprint $table) {
            $table->dropIndex('sync_ops_org_entity_status_idx');
        });
    }
};
