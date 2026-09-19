<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('customer_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('status')->default('active');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->bigInteger('budget_minor')->nullable();
            $table->bigInteger('billed_minor')->default(0);
            $table->bigInteger('cost_minor')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('tasks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('project_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('status')->default('pending');
            $table->foreignUuid('assigned_to_user_id')->nullable()->references('id')->on('users')->nullOnDelete();
            $table->date('due_date')->nullable();
            $table->bigInteger('estimated_minor')->nullable();
            $table->bigInteger('actual_minor')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('timesheets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('project_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('task_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->date('date');
            $table->decimal('hours', 8, 2)->default(0);
            $table->boolean('is_billable')->default(true);
            $table->bigInteger('rate_minor')->nullable();
            $table->text('notes')->nullable();
            $table->string('status')->default('draft');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('project_expenses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('project_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('task_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->bigInteger('amount_minor')->default(0);
            $table->string('currency', 3)->default('KES');
            $table->boolean('is_billable')->default(false);
            $table->string('receipt_path')->nullable();
            $table->string('status')->default('draft');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('retainer_invoices', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('customer_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('project_id')->nullable()->constrained()->nullOnDelete();
            $table->string('retainer_number')->index();
            $table->string('status')->default('active');
            $table->bigInteger('amount_minor')->default(0);
            $table->string('currency', 3)->default('KES');
            $table->string('frequency')->default('monthly');
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->bigInteger('remaining_minor')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('retainer_invoices');
        Schema::dropIfExists('project_expenses');
        Schema::dropIfExists('timesheets');
        Schema::dropIfExists('tasks');
        Schema::dropIfExists('projects');
    }
};
