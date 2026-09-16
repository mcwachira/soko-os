<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('key')->unique()->after('id');
        });

        Schema::create('plans', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('key')->unique();
            $table->text('description')->nullable();
            $table->string('status')->default('active');
            $table->string('billing_interval')->default('monthly');
            $table->string('currency', 3)->default('KES');
            $table->bigInteger('price_minor')->default(0);
            $table->integer('trial_days')->default(0);
            $table->integer('grace_period_days')->default(0);
            $table->timestamps();
        });

        Schema::create('plan_products', function (Blueprint $table) {
            $table->foreignUuid('plan_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('product_id')->constrained()->cascadeOnDelete();
            $table->boolean('enabled')->default(true);
            $table->primary(['plan_id', 'product_id']);
        });

        Schema::create('subscriptions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('plan_id')->constrained()->cascadeOnDelete();
            $table->string('status')->default('trial');
            $table->string('payment_status')->default('pending');
            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamp('current_period_started_at')->nullable();
            $table->timestamp('current_period_ends_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('subscription_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('subscription_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('product_id')->constrained()->cascadeOnDelete();
            $table->boolean('enabled')->default(true);
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('invitations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('role_id')->nullable()->constrained()->nullOnDelete();
            $table->string('email');
            $table->string('token');
            $table->string('status')->default('pending');
            $table->timestamp('expires_at');
            $table->timestamp('accepted_at')->nullable();
            $table->foreignUuid('invited_by_user_id')->nullable()->references('id')->on('users')->nullOnDelete();
            $table->foreignUuid('accepted_by_user_id')->nullable()->references('id')->on('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('tenant_memberships', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('business_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('role_id')->nullable()->constrained()->nullOnDelete();
            $table->string('status')->default('active');
            $table->timestamp('joined_at')->nullable();
            $table->timestamp('left_at')->nullable();
            $table->timestamps();

            $table->unique(['organization_id', 'user_id']);
            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenant_memberships');
        Schema::dropIfExists('invitations');
        Schema::dropIfExists('subscription_items');
        Schema::dropIfExists('subscriptions');
        Schema::dropIfExists('plan_products');
        Schema::dropIfExists('plans');
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('key');
        });
    }
};
