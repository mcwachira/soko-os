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

class EntitlementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        \Illuminate\Support\Facades\Route::middleware(['auth:sanctum'])
            ->group(function () {
                \Illuminate\Support\Facades\Route::middleware('product:pos')->get('/test-pos', function () {
                    return response()->json(['product' => 'pos', 'allowed' => true]);
                });

                \Illuminate\Support\Facades\Route::middleware('product:books')->get('/test-books', function () {
                    return response()->json(['product' => 'books', 'allowed' => true]);
                });
            });
    }

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

    public function test_tenant_with_pos_subscription_can_access_pos_routes(): void
    {
        $organization = Organization::factory()->create();
        $user = $this->createTenantUser($organization, ['pos.access']);

        $plan = $this->createPlan('starter');
        $subscription = $this->createSubscription($organization, $plan);
        $posProduct = $this->createProductWithKey('pos', $organization);
        $this->createSubscriptionItem($subscription, $posProduct);

        Sanctum::actingAs($user);

        $response = $this->getJson('/test-pos');

        $response->assertStatus(200)
            ->assertJson([
                'product' => 'pos',
                'allowed' => true,
            ]);
    }

    public function test_tenant_without_books_subscription_cannot_access_books_routes(): void
    {
        $organization = Organization::factory()->create();
        $user = $this->createTenantUser($organization, ['books.access']);

        $plan = $this->createPlan('starter');
        $subscription = $this->createSubscription($organization, $plan);

        $posProduct = $this->createProductWithKey('pos', $organization);
        $this->createSubscriptionItem($subscription, $posProduct);

        Sanctum::actingAs($user);

        $response = $this->getJson('/test-books');

        $response->assertStatus(403)
            ->assertJson(['message' => 'Product not available on your subscription']);
    }

    public function test_user_with_books_access_but_no_books_subscription_is_denied(): void
    {
        $organization = Organization::factory()->create();
        $user = $this->createTenantUser($organization, ['books.access']);

        $plan = $this->createPlan('starter');
        $subscription = $this->createSubscription($organization, $plan);

        Sanctum::actingAs($user);

        $response = $this->getJson('/test-books');

        $response->assertStatus(403)
            ->assertJson(['message' => 'Product not available on your subscription']);
    }

    public function test_super_admin_bypasses_entitlement_checks(): void
    {
        $organization = Organization::factory()->create();

        $user = User::factory()->create([
            'organization_id' => $organization->id,
            'role' => 'super-admin',
            'permissions' => ['*'],
            'is_active' => true,
        ]);

        $plan = $this->createPlan('starter');
        $this->createSubscription($organization, $plan);

        Sanctum::actingAs($user);

        $response = $this->getJson('/test-books');

        $response->assertStatus(200)
            ->assertJson([
                'product' => 'books',
                'allowed' => true,
            ]);
    }
}
