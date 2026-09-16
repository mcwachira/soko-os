<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tax_rates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('code')->index();
            $table->decimal('rate_percentage', 5, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('fiscal_years', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->date('start_date');
            $table->date('end_date');
            $table->boolean('is_current')->default(false);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('accounting_periods', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('fiscal_year_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->date('start_date');
            $table->date('end_date');
            $table->string('status')->default('open'); // open, closed, locked
            $table->timestamp('closed_at')->nullable();
            $table->foreignUuid('closed_by_user_id')->nullable()->references('id')->on('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('bank_accounts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('account_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('account_number_masked')->nullable();
            $table->string('bank_name')->nullable();
            $table->string('currency', 3)->default('KES');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('expense_categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('code')->nullable();
            $table->foreignUuid('account_id')->nullable()->constrained()->nullOnDelete();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('expenses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('supplier_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('expense_category_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('account_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('bank_account_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('created_by_user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreignUuid('approved_by_user_id')->nullable()->references('id')->on('users')->nullOnDelete();
            $table->string('expense_number')->index();
            $table->string('status')->default('draft'); // draft, submitted, approved, paid, rejected
            $table->date('expense_date');
            $table->date('payment_date')->nullable();
            $table->string('payment_method')->nullable(); // cash, bank, mpesa, card
            $table->string('reference')->nullable();
            $table->string('payee_name');
            $table->text('description')->nullable();
            $table->text('notes')->nullable();
            $table->string('receipt_path')->nullable();
            $table->bigInteger('amount_minor')->default(0);
            $table->bigInteger('tax_minor')->default(0);
            $table->bigInteger('total_minor')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('invoices', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('customer_id')->nullable()->constrained()->nullOnDelete();
            $table->string('invoice_number')->index();
            $table->string('status')->default('draft'); // draft, issued, sent, partially_paid, paid, overdue, void
            $table->date('issue_date');
            $table->date('due_date')->nullable();
            $table->string('currency', 3)->default('KES');
            $table->bigInteger('subtotal_minor')->default(0);
            $table->bigInteger('discount_minor')->default(0);
            $table->bigInteger('tax_total_minor')->default(0);
            $table->bigInteger('grand_total_minor')->default(0);
            $table->bigInteger('paid_total_minor')->default(0);
            $table->bigInteger('balance_minor')->default(0);
            $table->text('notes')->nullable();
            $table->text('terms')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('invoice_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('invoice_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('product_id')->nullable()->constrained()->nullOnDelete();
            $table->string('description');
            $table->decimal('quantity', 12, 4)->default(1);
            $table->bigInteger('unit_price_minor')->default(0);
            $table->bigInteger('discount_minor')->default(0);
            $table->decimal('tax_rate_percentage', 5, 2)->default(0);
            $table->bigInteger('tax_amount_minor')->default(0);
            $table->bigInteger('subtotal_minor')->default(0);
            $table->bigInteger('total_minor')->default(0);
            $table->timestamps();
        });

        Schema::create('bills', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('supplier_id')->nullable()->constrained()->nullOnDelete();
            $table->string('bill_number')->index();
            $table->string('status')->default('draft'); // draft, approved, paid, partially_paid, overdue, void
            $table->date('issue_date');
            $table->date('due_date')->nullable();
            $table->string('currency', 3)->default('KES');
            $table->bigInteger('subtotal_minor')->default(0);
            $table->bigInteger('discount_minor')->default(0);
            $table->bigInteger('tax_total_minor')->default(0);
            $table->bigInteger('grand_total_minor')->default(0);
            $table->bigInteger('paid_total_minor')->default(0);
            $table->bigInteger('balance_minor')->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('bill_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('bill_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('product_id')->nullable()->constrained()->nullOnDelete();
            $table->string('description');
            $table->decimal('quantity', 12, 4)->default(1);
            $table->bigInteger('unit_cost_minor')->default(0);
            $table->bigInteger('discount_minor')->default(0);
            $table->decimal('tax_rate_percentage', 5, 2)->default(0);
            $table->bigInteger('tax_amount_minor')->default(0);
            $table->bigInteger('subtotal_minor')->default(0);
            $table->bigInteger('total_minor')->default(0);
            $table->timestamps();
        });

        Schema::create('bank_transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('bank_account_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('journal_entry_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type'); // deposit, withdrawal, transfer, fee, interest
            $table->string('direction')->default('in'); // in, out
            $table->date('transaction_date');
            $table->string('reference')->nullable();
            $table->string('description')->nullable();
            $table->string('counterparty')->nullable();
            $table->bigInteger('amount_minor')->default(0);
            $table->string('currency', 3)->default('KES');
            $table->string('status')->default('unreconciled'); // unreconciled, reconciled, excluded
            $table->string('source'); // manual, import, integration
            $table->string('external_id')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('bank_reconciliations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('bank_account_id')->constrained()->cascadeOnDelete();
            $table->date('statement_date');
            $table->date('start_date');
            $table->date('end_date');
            $table->bigInteger('statement_balance_minor')->default(0);
            $table->bigInteger('book_balance_minor')->default(0);
            $table->bigInteger('difference_minor')->default(0);
            $table->string('status')->default('in_progress'); // in_progress, completed
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('bank_reconciliation_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('bank_reconciliation_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('bank_transaction_id')->constrained()->cascadeOnDelete();
            $table->string('status')->default('matched'); // matched, unmatched, excluded
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::table('journal_entries', function (Blueprint $table) {
            $table->string('status')->default('draft')->after('notes');
            $table->timestamp('posted_at')->nullable()->after('status');
            $table->foreignUuid('posted_by_user_id')->nullable()->references('id')->on('users')->nullOnDelete()->after('posted_at');
            $table->string('entry_type')->default('manual')->after('posted_by_user_id'); // manual, sale, purchase, payment, expense, reversal
        });

        Schema::table('journal_lines', function (Blueprint $table) {
            $table->string('entry_type')->default('manual')->after('description');
            $table->foreignUuid('branch_id')->nullable()->constrained()->nullOnDelete()->after('entry_type');
            $table->string('external_reference')->nullable()->index()->after('branch_id');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->foreignUuid('customer_id')->nullable()->references('id')->on('customers')->nullOnDelete()->after('sale_id');
            $table->string('payment_type')->default('sale')->after('payment_method'); // sale, refund, expense, bill
            $table->string('reference_type')->nullable()->after('reference'); // invoice, bill, expense
            $table->string('reference_id')->nullable()->after('reference_type');
            $table->text('notes')->nullable()->after('reference_id');
        });

        Schema::table('accounts', function (Blueprint $table) {
            $table->uuid('parent_id')->nullable()->after('business_id');
            $table->string('description')->nullable()->after('parent_id');
            $table->boolean('is_system')->default(false)->after('description');
            $table->foreign('parent_id')->references('id')->on('accounts')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('accounts', function (Blueprint $table) {
            $table->dropForeign(['parent_id']);
            $table->dropColumn(['parent_id', 'description', 'is_system']);
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropConstrainedForeignId('customer_id');
            $table->dropColumn(['payment_type', 'reference_type', 'reference_id', 'notes']);
        });

        Schema::table('journal_lines', function (Blueprint $table) {
            $table->dropForeign(['branch_id']);
            $table->dropColumn(['entry_type', 'branch_id', 'external_reference']);
        });

        Schema::table('journal_entries', function (Blueprint $table) {
            $table->dropForeign(['posted_by_user_id']);
            $table->dropColumn(['status', 'posted_at', 'posted_by_user_id', 'entry_type']);
        });

        Schema::dropIfExists('bank_reconciliation_items');
        Schema::dropIfExists('bank_reconciliations');
        Schema::dropIfExists('bank_transactions');
        Schema::dropIfExists('bill_items');
        Schema::dropIfExists('bills');
        Schema::dropIfExists('invoice_items');
        Schema::dropIfExists('invoices');
        Schema::dropIfExists('expenses');
        Schema::dropIfExists('expense_categories');
        Schema::dropIfExists('bank_accounts');
        Schema::dropIfExists('accounting_periods');
        Schema::dropIfExists('fiscal_years');
        Schema::dropIfExists('tax_rates');
    }
};
