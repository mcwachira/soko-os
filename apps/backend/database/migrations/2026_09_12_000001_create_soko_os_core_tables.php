<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Organizations & Businesses (Multi-Tenancy)
        Schema::create('organizations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('tax_number')->nullable();
            $table->string('country_code', 2)->default('KE');
            $table->string('currency', 3)->default('KES');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('businesses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('business_type')->default('retail');
            $table->string('tax_pin')->nullable();
            $table->string('currency', 3)->default('KES');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('branches', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('code')->index();
            $table->string('address')->nullable();
            $table->string('phone')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('warehouses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('code')->index();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('terminals', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('branch_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('terminal_code')->index();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('devices', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('branch_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('terminal_id')->nullable()->constrained()->nullOnDelete();
            $table->string('device_uuid')->unique();
            $table->string('device_name');
            $table->string('status')->default('approved'); // pending, approved, disabled, revoked
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamp('last_sync_at')->nullable();
            $table->string('app_version')->nullable();
            $table->timestamps();
        });

        // 2. Attach users to organizations (users table created in base Laravel migration)
        Schema::table('users', function (Blueprint $table) {
            $table->foreignUuid('organization_id')
                ->nullable()
                ->after('id')
                ->constrained()
                ->cascadeOnDelete();
            $table->foreignUuid('business_id')
                ->nullable()
                ->after('organization_id')
                ->constrained()
                ->cascadeOnDelete();
        });

        // 3. Products, Categories & Inventory Ledgers
        Schema::create('categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug');
            $table->uuid('parent_id')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->foreign('parent_id')
                ->references('id')
                ->on('categories')
                ->nullOnDelete();
        });

        Schema::create('products', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('sku')->index();
            $table->string('barcode')->nullable()->index();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('tax_category_code')->default('A');
            $table->string('unit')->default('pcs');
            $table->bigInteger('cost_price_minor')->default(0);
            $table->bigInteger('selling_price_minor')->default(0);
            $table->integer('reorder_level')->default(5);
            $table->boolean('track_inventory')->default(true);
            $table->boolean('is_active')->default(true);
            $table->bigInteger('version')->default(1);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('inventory_movements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('branch_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('warehouse_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('product_id')->constrained()->cascadeOnDelete();
            $table->string('movement_type'); // purchase, sale, return, damage, transfer, adjustment
            $table->decimal('quantity_change', 12, 4);
            $table->decimal('balance_after', 12, 4);
            $table->string('reference_type');
            $table->string('reference_id');
            $table->text('notes')->nullable();
            $table->foreignUuid('created_by_user_id')->nullable()->references('id')->on('users')->nullOnDelete();
            $table->timestamps();
        });

        // 4. Customers & Suppliers
        Schema::create('customers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->constrained()->cascadeOnDelete();
            $table->string('code')->nullable();
            $table->string('name');
            $table->string('phone')->nullable()->index();
            $table->string('email')->nullable();
            $table->string('tax_pin')->nullable();
            $table->bigInteger('credit_limit_minor')->default(0);
            $table->bigInteger('current_balance_minor')->default(0);
            $table->bigInteger('loyalty_points')->default(0);
            $table->string('price_level')->default('retail');
            $table->timestamps();
            $table->softDeletes();
        });

        // 5. Cash Shifts & Management
        Schema::create('cash_shifts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('branch_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('terminal_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('cashier_user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->string('status')->default('open'); // open, closed
            $table->timestamp('opened_at');
            $table->timestamp('closed_at')->nullable();
            $table->bigInteger('opening_float_minor')->default(0);
            $table->bigInteger('expected_cash_minor')->nullable();
            $table->bigInteger('actual_cash_minor')->nullable();
            $table->bigInteger('variance_minor')->nullable();
            $table->bigInteger('cash_sales_minor')->default(0);
            $table->bigInteger('cash_in_minor')->default(0);
            $table->bigInteger('cash_out_minor')->default(0);
            $table->bigInteger('cash_refunds_minor')->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // 6. Sales, Items & Payments
        Schema::create('sales', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('branch_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('terminal_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('cashier_user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreignUuid('shift_id')->nullable()->references('id')->on('cash_shifts')->nullOnDelete();
            $table->foreignUuid('customer_id')->nullable()->references('id')->on('customers')->nullOnDelete();
            $table->string('receipt_number')->unique();
            $table->string('invoice_number')->nullable();
            $table->string('status')->default('completed');
            $table->bigInteger('subtotal_minor')->default(0);
            $table->bigInteger('discount_minor')->default(0);
            $table->bigInteger('tax_total_minor')->default(0);
            $table->bigInteger('grand_total_minor')->default(0);
            $table->bigInteger('paid_total_minor')->default(0);
            $table->bigInteger('change_due_minor')->default(0);
            $table->string('tax_submission_status')->default('pending');
            $table->string('accounting_sync_status')->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('sale_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('sale_id')->constrained()->cascadeOnDelete();
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
            $table->timestamps();
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('sale_id')->constrained()->cascadeOnDelete();
            $table->bigInteger('amount_minor');
            $table->string('currency', 3)->default('KES');
            $table->string('payment_method'); // cash, mpesa, airtel, card, bank, credit, points
            $table->string('status')->default('completed');
            $table->string('reference')->nullable();
            $table->string('external_transaction_id')->nullable();
            $table->json('provider_response')->nullable();
            $table->timestamps();
        });

        // 7. Sync Operations & Cursors (Offline-first engine)
        Schema::create('sync_operations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('branch_id')->constrained()->cascadeOnDelete();
            $table->string('device_id')->index();
            $table->string('idempotency_key')->unique();
            $table->string('entity_name');
            $table->string('action');
            $table->string('local_id');
            $table->json('payload');
            $table->string('status')->default('accepted'); // accepted, rejected, conflict
            $table->text('error_message')->nullable();
            $table->timestamps();
        });

        // 8. Tax Submissions & Fiscalization (Kenya KRA eTIMS, TRA, URA, etc.)
        Schema::create('tax_submissions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('sale_id')->constrained()->cascadeOnDelete();
            $table->string('country_code', 2)->default('KE');
            $table->string('tax_authority')->default('KRA');
            $table->string('status')->default('pending'); // pending, queued, submitting, accepted, rejected, failed
            $table->string('control_code')->nullable();
            $table->string('qr_code_url')->nullable();
            $table->string('fiscal_signature')->nullable();
            $table->json('request_payload')->nullable();
            $table->json('response_payload')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamps();
        });

        // 9. Accounting Integrations & Double-Entry Ledger
        Schema::create('accounts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->constrained()->cascadeOnDelete();
            $table->string('code')->index();
            $table->string('name');
            $table->string('type'); // asset, liability, equity, revenue, expense
            $table->string('currency', 3)->default('KES');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('journal_entries', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->constrained()->cascadeOnDelete();
            $table->string('reference_type'); // sale, purchase, payment, shift_close
            $table->string('reference_id');
            $table->date('entry_date');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('journal_lines', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('journal_entry_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('account_id')->constrained()->cascadeOnDelete();
            $table->string('description')->nullable();
            $table->bigInteger('debit_minor')->default(0);
            $table->bigInteger('credit_minor')->default(0);
            $table->timestamps();
        });

        // 10. Outbox Events & Audit Logs
        Schema::create('outbox_events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->string('event_name');
            $table->json('payload');
            $table->string('status')->default('pending'); // pending, processing, published, failed
            $table->integer('retry_count')->default(0);
            $table->text('error_message')->nullable();
            $table->timestamps();
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignUuid('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action');
            $table->string('entity_type');
            $table->string('entity_id');
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('outbox_events');
        Schema::dropIfExists('journal_lines');
        Schema::dropIfExists('journal_entries');
        Schema::dropIfExists('accounts');
        Schema::dropIfExists('tax_submissions');
        Schema::dropIfExists('sync_operations');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('sale_items');
        Schema::dropIfExists('sales');
        Schema::dropIfExists('cash_shifts');
        Schema::dropIfExists('customers');
        Schema::dropIfExists('inventory_movements');
        Schema::dropIfExists('products');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('devices');
        Schema::dropIfExists('terminals');
        Schema::dropIfExists('warehouses');
        Schema::dropIfExists('branches');
        Schema::dropIfExists('businesses');

        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('organization_id');
        });

        Schema::dropIfExists('organizations');
    }
};
