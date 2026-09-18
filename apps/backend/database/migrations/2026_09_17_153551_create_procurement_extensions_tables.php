<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Supplier extensions
        Schema::create('supplier_contacts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('supplier_id')->constrained()->cascadeOnDelete();
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('job_title')->nullable();
            $table->string('department')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('whatsapp_phone')->nullable();
            $table->boolean('is_primary')->default(false);
            $table->boolean('is_finance_contact')->default(false);
            $table->boolean('is_procurement_contact')->default(false);
            $table->timestamps();
        });

        Schema::create('supplier_addresses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('supplier_id')->constrained()->cascadeOnDelete();
            $table->string('address_type')->default('physical');
            $table->string('country_code')->default('KE');
            $table->string('county')->nullable();
            $table->string('city')->nullable();
            $table->string('address_line1')->nullable();
            $table->string('address_line2')->nullable();
            $table->string('postal_code')->nullable();
            $table->boolean('is_default')->default(false);
            $table->timestamps();
        });

        Schema::create('supplier_bank_accounts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('supplier_id')->constrained()->cascadeOnDelete();
            $table->string('bank_name');
            $table->string('branch_name')->nullable();
            $table->string('account_name');
            $table->string('account_number');
            $table->string('swift_code')->nullable();
            $table->boolean('is_default')->default(false);
            $table->timestamps();
        });

        Schema::create('supplier_documents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('supplier_id')->constrained()->cascadeOnDelete();
            $table->string('document_type');
            $table->string('document_number')->nullable();
            $table->date('issued_at')->nullable();
            $table->date('expires_at')->nullable();
            $table->string('status')->default('pending');
            $table->string('verification_status')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->foreignUuid('verified_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('failure_reason')->nullable();
            $table->string('attachment_url')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('supplier_compliance_records', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('supplier_id')->constrained()->cascadeOnDelete();
            $table->string('compliance_type');
            $table->string('status')->default('pending');
            $table->boolean('required')->default(true);
            $table->boolean('expiry_tracked')->default(false);
            $table->integer('reminder_days')->nullable();
            $table->timestamps();
        });

        Schema::create('supplier_categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('supplier_category_links', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('supplier_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('category_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('supplier_ratings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('supplier_id')->constrained()->cascadeOnDelete();
            $table->integer('rating');
            $table->foreignUuid('rated_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('comments')->nullable();
            $table->timestamps();
        });

        Schema::create('supplier_performance_records', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('supplier_id')->constrained()->cascadeOnDelete();
            $table->string('metric');
            $table->decimal('value', 12, 4);
            $table->date('period_start')->nullable();
            $table->date('period_end')->nullable();
            $table->timestamps();
        });

        // Purchase Requisitions
        Schema::create('purchase_requisitions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('warehouse_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('requester_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('department')->nullable();
            $table->string('cost_center')->nullable();
            $table->foreignUuid('project_id')->nullable()->constrained()->nullOnDelete();
            $table->string('priority')->default('medium');
            $table->date('required_date')->nullable();
            $table->text('reason')->nullable();
            $table->bigInteger('budget_minor')->nullable();
            $table->string('currency')->default('KES');
            $table->string('status')->default('draft');
            $table->json('converted_to_po_ids')->nullable();
            $table->json('custom_fields')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('purchase_requisition_lines', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('purchase_requisition_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('product_id')->nullable()->constrained()->nullOnDelete();
            $table->text('description')->nullable();
            $table->decimal('quantity', 12, 4);
            $table->string('unit')->nullable();
            $table->bigInteger('estimated_unit_price_minor')->nullable();
            $table->decimal('tax_rate_percentage', 5, 2)->nullable();
            $table->bigInteger('estimated_total_minor')->nullable();
            $table->date('required_date')->nullable();
            $table->foreignUuid('preferred_supplier_id')->nullable()->constrained('suppliers')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('purchase_requisition_approvals', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('purchase_requisition_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('approver_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->integer('sequence');
            $table->string('status')->default('pending');
            $table->text('comments')->nullable();
            $table->timestamp('acted_at')->nullable();
            $table->timestamps();
        });

        // RFQs
        Schema::create('rfqs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('warehouse_id')->nullable()->constrained()->nullOnDelete();
            $table->string('rfq_number')->unique();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('status')->default('draft');
            $table->timestamp('submission_deadline')->nullable();
            $table->date('delivery_required_date')->nullable();
            $table->text('commercial_terms')->nullable();
            $table->text('payment_terms')->nullable();
            $table->text('tax_requirements')->nullable();
            $table->json('evaluation_criteria')->nullable();
            $table->foreignUuid('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('published_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->json('custom_fields')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('rfq_lines', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('rfq_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('product_id')->nullable()->constrained()->nullOnDelete();
            $table->text('description')->nullable();
            $table->decimal('quantity', 12, 4);
            $table->string('unit')->nullable();
            $table->date('required_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('rfq_suppliers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('rfq_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('supplier_id')->constrained()->cascadeOnDelete();
            $table->timestamp('invited_at')->nullable();
            $table->timestamp('responded_at')->nullable();
            $table->string('status')->default('invited');
            $table->timestamps();
        });

        Schema::create('rfq_questions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('rfq_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('supplier_id')->nullable()->constrained()->nullOnDelete();
            $table->text('question');
            $table->text('answer')->nullable();
            $table->timestamp('answered_at')->nullable();
            $table->timestamps();
        });

        Schema::create('rfq_responses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('rfq_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('supplier_id')->constrained()->cascadeOnDelete();
            $table->timestamp('submitted_at')->nullable();
            $table->string('status')->default('draft');
            $table->integer('revision')->default(0);
            $table->boolean('is_final')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('rfq_response_lines', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('rfq_response_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('rfq_line_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('supplier_id')->constrained()->cascadeOnDelete();
            $table->bigInteger('unit_price_minor')->nullable();
            $table->decimal('quantity', 12, 4)->nullable();
            $table->bigInteger('discount_minor')->nullable();
            $table->decimal('tax_rate_percentage', 5, 2)->nullable();
            $table->bigInteger('tax_amount_minor')->nullable();
            $table->bigInteger('total_minor')->nullable();
            $table->integer('lead_time_days')->nullable();
            $table->bigInteger('delivery_cost_minor')->nullable();
            $table->string('payment_terms')->nullable();
            $table->date('validity')->nullable();
            $table->string('warranty')->nullable();
            $table->text('notes')->nullable();
            $table->foreignUuid('alternative_product_id')->nullable()->references('id')->on('products')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('rfq_attachments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('rfq_id')->constrained()->cascadeOnDelete();
            $table->string('filename');
            $table->string('url');
            $table->string('mime_type')->nullable();
            $table->bigInteger('size_bytes')->nullable();
            $table->timestamps();
        });

        // Tenders
        Schema::create('tenders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->string('tender_number')->unique();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('status')->default('draft');
            $table->timestamp('submission_deadline')->nullable();
            $table->timestamp('opening_date')->nullable();
            $table->json('evaluation_criteria')->nullable();
            $table->foreignUuid('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('published_at')->nullable();
            $table->timestamp('awarded_at')->nullable();
            $table->json('custom_fields')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('tender_documents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('tender_id')->constrained()->cascadeOnDelete();
            $table->string('filename');
            $table->string('url');
            $table->string('mime_type')->nullable();
            $table->bigInteger('size_bytes')->nullable();
            $table->timestamps();
        });

        Schema::create('tender_bids', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('tender_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('supplier_id')->constrained()->cascadeOnDelete();
            $table->timestamp('submitted_at')->nullable();
            $table->string('status')->default('draft');
            $table->bigInteger('total_price_minor')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('tender_bid_lines', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('tender_bid_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('product_id')->nullable()->constrained()->nullOnDelete();
            $table->text('description')->nullable();
            $table->decimal('quantity', 12, 4)->nullable();
            $table->bigInteger('unit_price_minor')->nullable();
            $table->bigInteger('total_minor')->nullable();
            $table->timestamps();
        });

        Schema::create('tender_evaluations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('tender_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('tender_bid_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('evaluator_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->json('criteria');
            $table->decimal('score', 5, 2);
            $table->text('comments')->nullable();
            $table->timestamp('evaluated_at')->nullable();
            $table->timestamps();
        });

        Schema::create('tender_awards', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('tender_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('tender_bid_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('supplier_id')->constrained()->cascadeOnDelete();
            $table->timestamp('awarded_at')->nullable();
            $table->bigInteger('amount_minor')->nullable();
            $table->string('currency')->default('KES');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // Supplier Invoices
        Schema::create('supplier_invoices', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('supplier_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('purchase_order_id')->nullable()->constrained()->nullOnDelete();
            $table->string('invoice_number');
            $table->string('invoice_date');
            $table->date('due_date')->nullable();
            $table->string('currency')->default('KES');
            $table->bigInteger('subtotal_minor')->default(0);
            $table->bigInteger('discount_minor')->default(0);
            $table->bigInteger('tax_minor')->default(0);
            $table->bigInteger('wht_minor')->default(0);
            $table->bigInteger('grand_total_minor')->default(0);
            $table->string('etims_status')->nullable();
            $table->string('etims_control_number')->nullable();
            $table->timestamp('etims_verified_at')->nullable();
            $table->json('etims_payload')->nullable();
            $table->string('status')->default('draft');
            $table->json('custom_fields')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('supplier_invoice_lines', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('supplier_invoice_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('purchase_order_item_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('product_id')->nullable()->constrained()->nullOnDelete();
            $table->text('description')->nullable();
            $table->decimal('quantity', 12, 4);
            $table->bigInteger('unit_price_minor');
            $table->bigInteger('discount_minor')->default(0);
            $table->decimal('tax_rate_percentage', 5, 2);
            $table->bigInteger('tax_amount_minor')->default(0);
            $table->bigInteger('wht_amount_minor')->default(0);
            $table->bigInteger('total_minor');
            $table->timestamps();
        });

        // Three Way Match
        Schema::create('three_way_matches', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('purchase_order_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('grn_id')->nullable()->references('id')->on('goods_received_notes')->nullOnDelete();
            $table->foreignUuid('supplier_invoice_id')->constrained()->cascadeOnDelete();
            $table->string('status')->default('pending');
            $table->timestamp('matched_at')->nullable();
            $table->json('mismatches')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('three_way_match_lines', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('three_way_match_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('po_line_id')->constrained('purchase_order_items')->cascadeOnDelete();
            $table->foreignUuid('grn_line_id')->nullable()->constrained('goods_received_note_items')->nullOnDelete();
            $table->foreignUuid('invoice_line_id')->constrained('supplier_invoice_lines')->cascadeOnDelete();
            $table->decimal('po_quantity', 12, 4);
            $table->decimal('grn_quantity', 12, 4)->nullable();
            $table->decimal('invoice_quantity', 12, 4);
            $table->bigInteger('po_unit_price_minor');
            $table->bigInteger('grn_unit_cost_minor')->nullable();
            $table->bigInteger('invoice_unit_price_minor');
            $table->string('status')->default('pending');
            $table->text('mismatch_reason')->nullable();
            $table->timestamps();
        });

        // Payment Vouchers
        Schema::create('payment_vouchers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->string('voucher_number')->unique();
            $table->foreignUuid('supplier_id')->constrained()->cascadeOnDelete();
            $table->string('currency')->default('KES');
            $table->bigInteger('gross_amount_minor');
            $table->decimal('wht_rate_percentage', 5, 2)->nullable();
            $table->bigInteger('wht_amount_minor')->default(0);
            $table->bigInteger('other_deductions_minor')->default(0);
            $table->bigInteger('net_payable_minor');
            $table->string('status')->default('draft');
            $table->timestamp('approved_at')->nullable();
            $table->foreignUuid('approved_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('payment_voucher_lines', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('payment_voucher_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('supplier_invoice_id')->constrained()->cascadeOnDelete();
            $table->bigInteger('amount_minor');
            $table->bigInteger('wht_amount_minor')->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('payment_approvals', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('payment_voucher_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('approver_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->integer('sequence');
            $table->string('status')->default('pending');
            $table->text('comments')->nullable();
            $table->timestamp('acted_at')->nullable();
            $table->timestamps();
        });

        // Supplier Payments
        Schema::create('supplier_payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('payment_voucher_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('supplier_id')->constrained()->cascadeOnDelete();
            $table->string('currency')->default('KES');
            $table->bigInteger('amount_minor');
            $table->string('payment_method');
            $table->string('reference')->nullable();
            $table->string('external_transaction_id')->nullable();
            $table->json('provider_response')->nullable();
            $table->string('status')->default('pending');
            $table->timestamp('paid_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('payment_reconciliations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('supplier_payment_id')->constrained()->cascadeOnDelete();
            $table->string('provider_transaction_id')->nullable();
            $table->bigInteger('amount_minor');
            $table->string('currency')->default('KES');
            $table->timestamp('reconciled_at')->nullable();
            $table->foreignUuid('reconciled_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status')->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // Contracts
        Schema::create('procurement_contracts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('supplier_id')->constrained()->cascadeOnDelete();
            $table->string('contract_number')->unique();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('start_date');
            $table->string('end_date');
            $table->string('renewal_date')->nullable();
            $table->bigInteger('contract_value_minor')->default(0);
            $table->string('currency')->default('KES');
            $table->text('terms')->nullable();
            $table->string('status')->default('draft');
            $table->string('attachment_url')->nullable();
            $table->timestamps();
        });

        Schema::create('contract_lines', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('procurement_contract_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('product_id')->nullable()->constrained()->nullOnDelete();
            $table->text('description')->nullable();
            $table->decimal('quantity', 12, 4)->nullable();
            $table->bigInteger('unit_price_minor')->nullable();
            $table->timestamps();
        });

        Schema::create('contract_renewals', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('procurement_contract_id')->constrained()->cascadeOnDelete();
            $table->timestamp('renewed_at')->nullable();
            $table->string('new_end_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // Approval Engine
        Schema::create('approval_rules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->string('entity_type');
            $table->bigInteger('min_amount_minor')->nullable();
            $table->bigInteger('max_amount_minor')->nullable();
            $table->string('department')->nullable();
            $table->foreignUuid('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('supplier_id')->nullable()->constrained()->nullOnDelete();
            $table->string('category')->nullable();
            $table->string('cost_center')->nullable();
            $table->foreignUuid('project_id')->nullable()->constrained()->nullOnDelete();
            $table->string('currency')->default('KES');
            $table->string('purchase_type')->nullable();
            $table->string('risk')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('approval_steps', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('approval_rule_id')->constrained()->cascadeOnDelete();
            $table->integer('sequence');
            $table->foreignUuid('approver_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('approver_role')->nullable();
            $table->string('mode')->default('sequential');
            $table->foreignUuid('escalation_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->integer('expiry_minutes')->nullable();
            $table->timestamps();
        });

        // Audit Logs
        Schema::create('procurement_audit_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('entity_type');
            $table->uuid('entity_id');
            $table->string('action');
            $table->json('before')->nullable();
            $table->json('after')->nullable();
            $table->text('reason')->nullable();
            $table->string('ip_address')->nullable();
            $table->string('correlation_id')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('procurement_audit_logs');
        Schema::dropIfExists('approval_steps');
        Schema::dropIfExists('approval_rules');
        Schema::dropIfExists('contract_renewals');
        Schema::dropIfExists('contract_lines');
        Schema::dropIfExists('procurement_contracts');
        Schema::dropIfExists('payment_reconciliations');
        Schema::dropIfExists('supplier_payments');
        Schema::dropIfExists('payment_approvals');
        Schema::dropIfExists('payment_voucher_lines');
        Schema::dropIfExists('payment_vouchers');
        Schema::dropIfExists('three_way_match_lines');
        Schema::dropIfExists('three_way_matches');
        Schema::dropIfExists('supplier_invoice_lines');
        Schema::dropIfExists('supplier_invoices');
        Schema::dropIfExists('tender_awards');
        Schema::dropIfExists('tender_evaluations');
        Schema::dropIfExists('tender_bid_lines');
        Schema::dropIfExists('tender_bids');
        Schema::dropIfExists('tender_documents');
        Schema::dropIfExists('tenders');
        Schema::dropIfExists('rfq_attachments');
        Schema::dropIfExists('rfq_response_lines');
        Schema::dropIfExists('rfq_responses');
        Schema::dropIfExists('rfq_questions');
        Schema::dropIfExists('rfq_suppliers');
        Schema::dropIfExists('rfq_lines');
        Schema::dropIfExists('rfqs');
        Schema::dropIfExists('purchase_requisition_approvals');
        Schema::dropIfExists('purchase_requisition_lines');
        Schema::dropIfExists('purchase_requisitions');
        Schema::dropIfExists('supplier_performance_records');
        Schema::dropIfExists('supplier_ratings');
        Schema::dropIfExists('supplier_category_links');
        Schema::dropIfExists('supplier_categories');
        Schema::dropIfExists('supplier_compliance_records');
        Schema::dropIfExists('supplier_documents');
        Schema::dropIfExists('supplier_bank_accounts');
        Schema::dropIfExists('supplier_addresses');
        Schema::dropIfExists('supplier_contacts');
    }
};
