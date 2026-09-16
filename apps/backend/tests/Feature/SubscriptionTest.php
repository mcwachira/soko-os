<?php

namespace Tests\Feature;

use App\Models\Business;
use App\Models\Category;
use App\Models\Organization;
use App\Models\Plan;
use App\Models\Product;
use App\Models\Role;
use App\Models\Subscription;
use App\Models\SubscriptionItem;
use App\Models\TenantMembership;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SubscriptionTest extends TestCase
{
    use RefreshDatabase;

    private function createPlan(string $key = 'starter', array $overrides = []): \App\Models\Plan
    {
        return \App\Models\Plan::create(array_merge([
            'id' => (string) Str::uuid(),
            'name' => 'Starter Plan',
            'key' => $key,
            'description' => 'Starter plan for testing',
            'status' => 'active',
            'billing_interval' => 'monthly',
            'currency' => 'KES',
            'price_minor' => 5000,
            'trial_days' => 14,
            'grace_period_days' => 7,
        ], $overrides));
    }

    private function createSubscription(\App\Models\Organization $organization, \App\Models\Plan $plan, array $overrides = []): \App\Models\Subscription
    {
        return \App\Models\Subscription::create(array_merge([
            'id' => (string) Str::uuid(),
            'organization_id' => $organization->id,
            'plan_id' => $plan->id,
            'status' => 'active',
            'payment_status' => 'paid',
            'current_period_started_at' => now(),
            'current_period_ends_at' => now()->addMonth(),
        ], $overrides));
    }

    private function createProductWithKey(string $key, \App\Models\Organization $organization, array $overrides = []): \App\Models\Product
    {
        $business = Business::factory()->create(['organization_id' => $organization->id]);
        $category = \App\Models\Category::factory()->create(['organization_id' => $organization->id, 'business_id' => $business->id]);

        $product = new \App\Models\Product(array_merge([
            'id' => (string) Str::uuid(),
            'organization_id' => $organization->id,
            'business_id' => $business->id,
            'category_id' => $category->id,
            'key' => $key,
            'sku' => strtoupper($key) . '-' . Str::random(6),
            'name' => ucfirst($key) . ' Product',
            'description' => 'Test product',
            'is_active' => true,
        ], $overrides));

        $product->save();
        return $product;
    }

    private function createSubscriptionItem(\App\Models\Subscription $subscription, \App\Models\Product $product, bool $enabled = true): \App\Models\SubscriptionItem
    {
        return \App\Models\SubscriptionItem::create([
            'id' => (string) Str::uuid(),
            'subscription_id' => $subscription->id,
            'product_id' => $product->id,
            'enabled' => $enabled,
        ]);
    }

    private function createRole(string $slug, string $name, \App\Models\Organization $organization, array $permissions = []): \App\Models\Role
    {
        return \App\Models\Role::create([
            'id' => (string) Str::uuid(),
            'organization_id' => $organization->id,
            'name' => $name,
            'slug' => $slug,
            'description' => $name . ' role',
            'permissions' => $permissions,
        ]);
    }

    private function createMembership(\App\Models\User $user, \App\Models\Organization $organization, \App\Models\Role $role, string $status = 'active'): \App\Models\TenantMembership
    {
        $business = Business::factory()->create(['organization_id' => $organization->id]);

        return \App\Models\TenantMembership::create([
            'id' => (string) Str::uuid(),
            'organization_id' => $organization->id,
            'business_id' => $business->id,
            'user_id' => $user->id,
            'role_id' => $role->id,
            'status' => $status,
            'joined_at' => now(),
        ]);
    }

    private function createTenantUser(\App\Models\Organization $organization, array $permissions = []): \App\Models\User
    {
        $role = $this->createRole('member', 'Member', $organization, $permissions);
        $business = Business::factory()->create(['organization_id' => $organization->id]);

        $user = User::factory()->create([
            'organization_id' => $organization->id,
            'business_id' => $business->id,
            'role' => 'member',
            'permissions' => $permissions,
            'is_active' => true,
        ]);

        $this->createMembership($user, $organization, $role);

        return $user;
    }

    public function test_tenant_can_view_their_subscription(): void
    {
        $organization = Organization::factory()->create();
        $user = $this->createTenantUser($organization);

        $plan = $this->createPlan('starter');
        $subscription = $this->createSubscription($organization, $plan, [
            'status' => 'active',
            'payment_status' => 'paid',
        ]);

        $posProduct = $this->createProductWithKey('pos', $organization);
        $this->createSubscriptionItem($subscription, $posProduct);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/subscriptions');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'subscription' => [
                        'id',
                        'status',
                        'plan_name',
                        'current_period_ends_at',
                    ],
                ],
            ])
            ->assertJsonPath('data.subscription.id', $subscription->id)
            ->assertJsonPath('data.subscription.status', 'active')
            ->assertJsonPath('data.subscription.plan_name', 'Starter Plan')
            ->assertJsonCount(1, 'data.entitlements')
            ->assertJsonPath('data.entitlements.0', 'pos');
    }

    public function test_subscription_status_affects_entitlement(): void
    {
        $organization = Organization::factory()->create();
        $user = $this->createTenantUser($organization);

        $plan = $this->createPlan('starter');
        $subscription = $this->createSubscription($organization, $plan, [
            'status' => 'cancelled',
        ]);

        $posProduct = $this->createProductWithKey('pos', $organization);
        $this->createSubscriptionItem($subscription, $posProduct);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/auth/me');

        $response->assertStatus(200)
            ->assertJsonPath('data.entitlements.products', []);
    }

    public function test_past_due_subscription_with_grace_period_allows_access(): void
    {
        $organization = Organization::factory()->create();
        $user = $this->createTenantUser($organization);

        $plan = $this->createPlan('starter', ['grace_period_days' => 7]);
        $subscription = $this->createSubscription($organization, $plan, [
            'status' => 'past_due',
            'current_period_ends_at' => now()->addDays(3),
        ]);

        $posProduct = $this->createProductWithKey('pos', $organization);
        $this->createSubscriptionItem($subscription, $posProduct);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/auth/me');

        $response->assertStatus(200)
            ->assertJsonPath('data.entitlements.products.pos', true);
    }

    public function test_past_due_subscription_past_grace_period_denies_access(): void
    {
        $organization = Organization::factory()->create();
        $user = $this->createTenantUser($organization);

        $plan = $this->createPlan('starter', ['grace_period_days' => 3]);
        $subscription = $this->createSubscription($organization, $plan, [
            'status' => 'past_due',
            'current_period_ends_at' => now()->subDays(5),
        ]);

        $posProduct = $this->createProductWithKey('pos', $organization);
        $this->createSubscriptionItem($subscription, $posProduct);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/auth/me');

        $response->assertStatus(200)
            ->assertJsonPath('data.entitlements.products', []);
    }

    public function test_suspended_subscription_denies_access(): void
    {
        $organization = Organization::factory()->create();
        $user = $this->createTenantUser($organization);

        $plan = $this->createPlan('starter');
        $subscription = $this->createSubscription($organization, $plan, [
            'status' => 'suspended',
        ]);

        $posProduct = $this->createProductWithKey('pos', $organization);
        $this->createSubscriptionItem($subscription, $posProduct);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/auth/me');

        $response->assertStatus(200)
            ->assertJsonPath('data.entitlements.products', []);
    }
}
