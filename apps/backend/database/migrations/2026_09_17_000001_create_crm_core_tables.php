<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // CRM Core Tables

        Schema::create('leads', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('assigned_to_user_id')->nullable()->references('id')->on('users')->nullOnDelete();
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('company_name')->nullable();
            $table->string('email')->nullable()->index();
            $table->string('phone')->nullable()->index();
            $table->string('whatsapp_phone')->nullable();
            $table->string('source')->nullable()->index(); // website, whatsapp, facebook, referral, phone, walk_in, event, api, manual
            $table->string('status')->default('new')->index(); // new, contacted, qualified, unqualified, converted, discarded
            $table->string('lifecycle_stage')->default('lead'); // lead, marketing_qualified, sales_qualified, opportunity, customer
            $table->integer('score')->default(0);
            $table->json('custom_fields')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('last_contacted_at')->nullable();
            $table->timestamp('converted_at')->nullable();
            $table->foreignUuid('converted_by_user_id')->nullable()->references('id')->on('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['organization_id', 'status']);
            $table->index(['organization_id', 'assigned_to_user_id']);
            $table->index(['organization_id', 'score']);
        });

        Schema::create('crm_accounts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('owner_user_id')->nullable()->references('id')->on('users')->nullOnDelete();
            $table->string('account_type')->default('customer'); // customer, prospect, partner, distributor, reseller, government, ngo
            $table->string('legal_name')->nullable();
            $table->string('trading_name')->nullable();
            $table->string('registration_number')->nullable();
            $table->string('kra_pin')->nullable()->index();
            $table->string('industry')->nullable()->index();
            $table->string('country_code', 2)->default('KE');
            $table->string('county')->nullable();
            $table->string('city')->nullable();
            $table->text('address')->nullable();
            $table->string('website')->nullable();
            $table->string('phone')->nullable()->index();
            $table->string('email')->nullable();
            $table->bigInteger('credit_limit_minor')->default(0);
            $table->string('payment_terms')->nullable();
            $table->string('price_list')->nullable();
            $table->json('custom_fields')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['organization_id', 'account_type']);
            $table->index(['organization_id', 'owner_user_id']);
        });

        Schema::table('crm_accounts', function (Blueprint $table) {
            $table->foreignUuid('parent_account_id')->nullable()->references('id')->on('crm_accounts')->nullOnDelete();
        });

        Schema::create('contacts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('account_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('lead_id')->nullable()->constrained()->nullOnDelete();
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('job_title')->nullable();
            $table->string('department')->nullable();
            $table->string('email')->nullable()->index();
            $table->string('phone')->nullable()->index();
            $table->string('whatsapp_phone')->nullable();
            $table->string('preferred_channel')->nullable(); // email, phone, whatsapp, sms
            $table->boolean('is_decision_maker')->default(false);
            $table->boolean('is_billing_contact')->default(false);
            $table->boolean('is_technical_contact')->default(false);
            $table->json('custom_fields')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['organization_id', 'account_id']);
            $table->index(['organization_id', 'lead_id']);
        });

        Schema::create('pipelines', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('slug')->nullable();
            $table->string('description')->nullable();
            $table->string('type')->default('sales'); // sales, retail, enterprise, services, renewals, partnerships
            $table->boolean('is_active')->default(true);
            $table->boolean('is_default')->default(false);
            $table->json('settings')->nullable(); // rotting thresholds, SLAs, etc.
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['organization_id', 'slug']);
        });

        Schema::create('deal_stages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('pipeline_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->nullable();
            $table->text('description')->nullable();
            $table->integer('position')->default(0);
            $table->integer('probability_percentage')->default(0);
            $table->json('required_fields')->nullable(); // fields required to enter this stage
            $table->json('allowed_next_stages')->nullable(); // null = all allowed
            $table->integer('rotting_threshold_days')->nullable(); // days before deal is considered rotting
            $table->json('automation')->nullable(); // stage entry/exit automations
            $table->timestamps();
            $table->softDeletes();

            $table->index(['pipeline_id', 'position']);
        });

        Schema::create('deals', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('account_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('contact_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('pipeline_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('stage_id')->references('id')->on('deal_stages')->cascadeOnDelete();
            $table->foreignUuid('owner_user_id')->nullable()->references('id')->on('users')->nullOnDelete();
            $table->foreignUuid('lead_id')->nullable()->constrained()->nullOnDelete();
            $table->string('deal_name');
            $table->text('description')->nullable();
            $table->string('currency', 3)->default('KES');
            $table->bigInteger('value_minor')->default(0);
            $table->bigInteger('probability_minor')->default(0);
            $table->date('expected_close_date')->nullable();
            $table->date('actual_close_date')->nullable();
            $table->string('status')->default('open'); // open, won, lost, abandoned, cancelled
            $table->string('lost_reason')->nullable();
            $table->string('competitors')->nullable();
            $table->string('source_campaign')->nullable();
            $table->json('custom_fields')->nullable();
            $table->json('metadata')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('stage_entered_at')->nullable();
            $table->timestamp('stage_exited_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['organization_id', 'pipeline_id', 'stage_id']);
            $table->index(['organization_id', 'status']);
            $table->index(['organization_id', 'owner_user_id']);
            $table->index(['organization_id', 'expected_close_date']);
            $table->index(['organization_id', 'created_at']);
        });

        Schema::create('activities', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('user_id')->nullable()->references('id')->on('users')->nullOnDelete();
            $table->string('activity_type')->default('note'); // task, call, meeting, email, note, visit, follow_up, whatsapp, sms
            $table->string('subject')->nullable();
            $table->text('description')->nullable();
            $table->string('status')->default('pending'); // pending, in_progress, completed, cancelled
            $table->string('priority')->default('medium'); // low, medium, high, urgent
            $table->timestamp('due_date')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['organization_id', 'activity_type']);
            $table->index(['organization_id', 'user_id']);
            $table->index(['organization_id', 'due_date']);
        });

        Schema::create('activity_links', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('activity_id')->constrained()->cascadeOnDelete();
            $table->string('linkable_type'); // lead, account, contact, deal, case
            $table->foreignUuid('linkable_id');
            $table->timestamps();

            $table->unique(['activity_id', 'linkable_type', 'linkable_id']);
            $table->index(['linkable_type', 'linkable_id']);
        });

        Schema::create('communications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->nullable()->constrained()->nullOnDelete();
            $table->string('channel')->default('email'); // email, whatsapp, sms, phone, web, social
            $table->string('direction')->default('inbound'); // inbound, outbound
            $table->string('status')->default('received'); // received, sent, delivered, read, failed
            $table->string('from_address')->nullable();
            $table->string('to_address')->nullable();
            $table->string('subject')->nullable();
            $table->text('body')->nullable();
            $table->json('attachments')->nullable();
            $table->json('metadata')->nullable();
            $table->string('external_id')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['organization_id', 'channel']);
            $table->index(['organization_id', 'created_at']);
            $table->index(['external_id']);
        });

        Schema::create('communication_links', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('communication_id')->constrained()->cascadeOnDelete();
            $table->string('linkable_type'); // lead, account, contact, deal, case
            $table->foreignUuid('linkable_id');
            $table->timestamps();

            $table->unique(['communication_id', 'linkable_type', 'linkable_id']);
            $table->index(['linkable_type', 'linkable_id']);
        });

        Schema::create('campaigns', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('type')->default('marketing'); // marketing, sales, nurture, event
            $table->string('status')->default('draft'); // draft, scheduled, active, paused, completed, cancelled
            $table->string('channel')->nullable(); // email, whatsapp, sms, phone, social, multi
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->bigInteger('budget_minor')->nullable();
            $table->string('currency', 3)->default('KES');
            $table->json('utm_parameters')->nullable();
            $table->json('target_audience')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['organization_id', 'status']);
        });

        Schema::create('cases', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('account_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('contact_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('deal_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('assigned_to_user_id')->nullable()->references('id')->on('users')->nullOnDelete();
            $table->string('case_number')->nullable();
            $table->string('subject');
            $table->text('description')->nullable();
            $table->string('priority')->default('medium'); // low, medium, high, urgent
            $table->string('status')->default('new'); // new, open, pending, resolved, closed, cancelled
            $table->string('category')->nullable();
            $table->string('channel')->nullable();
            $table->timestamp('first_response_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->json('custom_fields')->nullable();
            $table->text('resolution')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['organization_id', 'status']);
            $table->index(['organization_id', 'assigned_to_user_id']);
            $table->index(['organization_id', 'priority']);
        });

        Schema::create('workflows', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('description')->nullable();
            $table->string('trigger_entity')->nullable(); // lead, deal, quote, invoice, payment, case
            $table->string('trigger_event')->nullable(); // created, updated, field_changed, stage_changed
            $table->json('trigger_conditions')->nullable();
            $table->json('actions')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('priority')->default(0);
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['organization_id', 'is_active']);
        });

        Schema::create('workflow_executions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('workflow_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->string('trigger_entity_type');
            $table->foreignUuid('trigger_entity_id');
            $table->string('status')->default('running'); // running, completed, failed, cancelled
            $table->json('input')->nullable();
            $table->json('output')->nullable();
            $table->text('error_message')->nullable();
            $table->integer('retry_count')->default(0);
            $table->timestamp('executed_at')->nullable();
            $table->timestamps();

            $table->index(['workflow_id', 'status']);
            $table->index(['trigger_entity_type', 'trigger_entity_id']);
        });

        Schema::create('sla_policies', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('description')->nullable();
            $table->string('applies_to_entity')->nullable(); // lead, deal, case
            $table->string('sla_type')->default('first_response'); // first_response, next_response, resolution, follow_up
            $table->integer('threshold_minutes')->nullable();
            $table->integer('threshold_hours')->nullable();
            $table->integer('threshold_days')->nullable();
            $table->json('business_hours')->nullable(); // working days/hours configuration
            $table->json('escalation_rules')->nullable(); // level 1 -> level 2 -> manager
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['organization_id', 'applies_to_entity']);
        });

        Schema::create('custom_field_definitions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->string('entity_type'); // lead, account, contact, deal, case
            $table->string('field_name');
            $table->string('field_label');
            $table->string('field_type')->default('text'); // text, number, date, select, multiselect, boolean, url, email, phone
            $table->json('options')->nullable(); // for select/multiselect
            $table->boolean('is_required')->default(false);
            $table->boolean('is_unique')->default(false);
            $table->json('default_value')->nullable();
            $table->json('validation_rules')->nullable();
            $table->integer('position')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['organization_id', 'entity_type', 'field_name']);
            $table->index(['organization_id', 'entity_type']);
        });

        Schema::create('lead_sources', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('type')->default('custom'); // preset, custom
            $table->string('channel')->nullable(); // website, whatsapp, facebook, instagram, linkedin, google, referral, phone, walk_in, event, partner, campaign, api, manual
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['organization_id', 'name']);
        });

        Schema::create('lead_scoring_rules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('condition_type')->default('event'); // event, field_value, decay
            $table->string('condition_field')->nullable();
            $table->string('condition_operator')->nullable(); // equals, contains, greater_than, less_than
            $table->json('condition_value')->nullable();
            $table->integer('score_change')->default(0);
            $table->boolean('is_decay')->default(false);
            $table->integer('decay_after_hours')->nullable();
            $table->integer('decay_amount')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['organization_id', 'is_active']);
        });

        Schema::create('lead_assignments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->string('rule_name');
            $table->string('assignment_type')->default('round_robin'); // round_robin, territory, branch, product, industry, source, weighted, manual
            $table->json('criteria')->nullable();
            $table->json('assignees')->nullable(); // list of user IDs with weights
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['organization_id', 'is_active']);
        });

        Schema::create('territories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('code')->nullable();
            $table->string('type')->default('region'); // region, county, district, zone
            $table->string('country_code', 2)->default('KE');
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['organization_id', 'country_code']);
        });

        Schema::table('territories', function (Blueprint $table) {
            $table->foreignUuid('parent_territory_id')->nullable()->references('id')->on('territories')->nullOnDelete();
        });

        Schema::create('price_books', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('type')->default('retail'); // retail, wholesale, distributor, vip, enterprise, customer_specific, promotional
            $table->string('currency', 3)->default('KES');
            $table->boolean('is_active')->default(true);
            $table->boolean('is_default')->default(false);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['organization_id', 'name']);
        });

        Schema::create('price_book_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('price_book_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('product_id')->constrained()->cascadeOnDelete();
            $table->integer('min_quantity')->default(1);
            $table->integer('max_quantity')->nullable();
            $table->bigInteger('unit_price_minor')->default(0);
            $table->bigInteger('discount_minor')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['price_book_id', 'product_id', 'min_quantity']);
        });

        Schema::create('deal_products', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('deal_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('product_id')->nullable()->constrained()->nullOnDelete();
            $table->string('product_name')->nullable();
            $table->string('sku')->nullable();
            $table->decimal('quantity', 12, 4)->default(1);
            $table->bigInteger('unit_price_minor')->default(0);
            $table->bigInteger('discount_minor')->default(0);
            $table->bigInteger('subtotal_minor')->default(0);
            $table->timestamps();
        });

        Schema::create('deal_payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('deal_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('payment_id')->nullable()->constrained()->nullOnDelete();
            $table->bigInteger('amount_minor')->default(0);
            $table->string('currency', 3)->default('KES');
            $table->string('payment_method')->nullable();
            $table->string('status')->default('pending');
            $table->string('external_transaction_id')->nullable();
            $table->json('provider_response')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index(['deal_id', 'status']);
        });

        Schema::create('knowledge_articles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('slug')->nullable();
            $table->text('content')->nullable();
            $table->string('category')->nullable();
            $table->json('tags')->nullable();
            $table->string('status')->default('draft'); // draft, published, archived
            $table->foreignUuid('author_user_id')->nullable()->references('id')->on('users')->nullOnDelete();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['organization_id', 'status']);
            $table->index(['organization_id', 'category']);
        });

        Schema::create('case_satisfaction_surveys', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('case_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->integer('rating')->nullable(); // 1-5
            $table->text('comment')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['case_id']);
        });

        Schema::create('sequences', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('description')->nullable();
            $table->string('target_entity')->nullable(); // lead, contact, account
            $table->string('status')->default('draft'); // draft, active, paused, completed
            $table->integer('total_steps')->default(0);
            $table->json('steps')->nullable(); // array of {day_offset, channel, template, action}
            $table->json('settings')->nullable(); // business_hours, stop_on_reply, stop_on_conversion
            $table->timestamps();
            $table->softDeletes();

            $table->index(['organization_id', 'status']);
        });

        Schema::create('sequence_events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('sequence_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->string('entity_type'); // lead, contact, account
            $table->foreignUuid('entity_id');
            $table->string('status')->default('pending'); // pending, sent, skipped, failed
            $table->integer('step_index')->default(0);
            $table->string('channel')->nullable();
            $table->string('template')->nullable();
            $table->json('payload')->nullable();
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('executed_at')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamps();

            $table->index(['sequence_id', 'status']);
            $table->index(['entity_type', 'entity_id']);
        });

        Schema::create('crm_audit_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('user_id')->nullable()->references('id')->on('users')->nullOnDelete();
            $table->string('entity_type'); // lead, account, contact, deal, case, workflow
            $table->string('entity_id');
            $table->string('action'); // created, updated, deleted, stage_changed, assigned, converted
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->string('correlation_id')->nullable()->index();
            $table->timestamps();

            $table->index(['organization_id', 'entity_type', 'entity_id']);
            $table->index(['organization_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_audit_logs');
        Schema::dropIfExists('sequence_events');
        Schema::dropIfExists('sequences');
        Schema::dropIfExists('case_satisfaction_surveys');
        Schema::dropIfExists('knowledge_articles');
        Schema::dropIfExists('deal_payments');
        Schema::dropIfExists('deal_products');
        Schema::dropIfExists('price_book_items');
        Schema::dropIfExists('price_books');
        Schema::dropIfExists('territories');
        Schema::dropIfExists('lead_assignments');
        Schema::dropIfExists('lead_scoring_rules');
        Schema::dropIfExists('lead_sources');
        Schema::dropIfExists('custom_field_definitions');
        Schema::dropIfExists('sla_policies');
        Schema::dropIfExists('workflow_executions');
        Schema::dropIfExists('workflows');
        Schema::dropIfExists('cases');
        Schema::dropIfExists('campaigns');
        Schema::dropIfExists('communication_links');
        Schema::dropIfExists('communications');
        Schema::dropIfExists('activity_links');
        Schema::dropIfExists('activities');
        Schema::dropIfExists('deals');
        Schema::dropIfExists('deal_stages');
        Schema::dropIfExists('pipelines');
        Schema::dropIfExists('contacts');
        Schema::dropIfExists('crm_accounts');
        Schema::dropIfExists('leads');
    }
};
