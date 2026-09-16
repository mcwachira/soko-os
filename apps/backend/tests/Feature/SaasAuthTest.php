<?php

namespace Tests\Feature;

use App\Models\Business;
use App\Models\Organization;
use App\Models\Role;
use App\Models\TenantMembership;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SaasAuthTest extends TestCase
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

    public function test_login_returns_entitlements_and_memberships(): void
    {
        $organization = Organization::factory()->create();
        $role = $this->createRole('member', 'Member', $organization, ['pos.access']);
        $business = Business::factory()->create(['organization_id' => $organization->id]);

        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
            'organization_id' => $organization->id,
            'business_id' => $business->id,
            'role' => 'member',
            'permissions' => ['pos.access'],
            'is_active' => true,
        ]);

        $this->createMembership($user, $organization, $role);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'test@example.com',
            'password' => 'password',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'token',
                    'user' => [
                        'id',
                        'name',
                        'email',
                        'role',
                        'organization_id',
                        'business_id',
                        'is_super_admin',
                        'memberships' => [
                            '*' => [
                                'organization_id',
                                'organization_name',
                                'role_id',
                                'role_slug',
                                'status',
                            ],
                        ],
                    ],
                ],
                'message',
            ])
            ->assertJsonPath('data.user.memberships.0.organization_id', $organization->id)
            ->assertJsonPath('data.user.memberships.0.role_slug', 'member')
            ->assertJsonPath('data.user.memberships.0.status', 'active');
    }

    public function test_me_returns_subscription_and_entitlements(): void
    {
        $organization = Organization::factory()->create();
        $role = $this->createRole('member', 'Member', $organization);
        $business = Business::factory()->create(['organization_id' => $organization->id]);

        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
            'organization_id' => $organization->id,
            'business_id' => $business->id,
            'role' => 'member',
            'permissions' => ['pos.access'],
            'is_active' => true,
        ]);

        $this->createMembership($user, $organization, $role);

        $plan = $this->createPlan('starter');
        $subscription = $this->createSubscription($organization, $plan);
        $posProduct = $this->createProductWithKey('pos', $organization);
        $this->createSubscriptionItem($subscription, $posProduct);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/auth/me');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'email',
                    'organization_id',
                    'business_id',
                    'is_super_admin',
                    'organization' => [
                        'id',
                        'name',
                        'slug',
                    ],
                    'subscription' => [
                        'id',
                        'status',
                        'plan_name',
                        'current_period_ends_at',
                    ],
                    'entitlements' => [
                        'products' => [
                            'pos',
                        ],
                    ],
                    'memberships' => [
                        '*' => [
                            'organization_id',
                            'organization_name',
                            'role_id',
                            'role_slug',
                            'status',
                        ],
                    ],
                ],
            ])
            ->assertJsonPath('data.subscription.id', $subscription->id)
            ->assertJsonPath('data.subscription.status', 'active')
            ->assertJsonPath('data.subscription.plan_name', 'Starter Plan')
            ->assertJsonPath('data.entitlements.products.pos', true);
    }

    public function test_switch_tenant_changes_context(): void
    {
        $orgA = Organization::factory()->create();
        $orgB = Organization::factory()->create();
        $roleA = $this->createRole('member', 'Member', $orgA);
        $roleB = $this->createRole('member', 'Member', $orgB);
        $businessA = Business::factory()->create(['organization_id' => $orgA->id]);
        $businessB = Business::factory()->create(['organization_id' => $orgB->id]);

        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
            'organization_id' => $orgA->id,
            'business_id' => $businessA->id,
            'role' => 'member',
            'permissions' => ['pos.access'],
            'is_active' => true,
        ]);

        $this->createMembership($user, $orgA, $roleA);
        $this->createMembership($user, $orgB, $roleB);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/auth/switch-tenant', [
            'organization_id' => $orgB->id,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.user.organization_id', $orgB->id)
            ->assertJsonPath('data.user.organization.name', $orgB->name)
            ->assertJsonPath('message', 'Tenant switched successfully');

        $user->refresh();
        $this->assertEquals($orgB->id, $user->organization_id);
    }

    public function test_switch_tenant_fails_for_non_member(): void
    {
        $orgA = Organization::factory()->create();
        $orgB = Organization::factory()->create();
        $roleA = $this->createRole('member', 'Member', $orgA);
        $businessA = Business::factory()->create(['organization_id' => $orgA->id]);

        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
            'organization_id' => $orgA->id,
            'business_id' => $businessA->id,
            'role' => 'member',
            'permissions' => ['pos.access'],
            'is_active' => true,
        ]);

        $this->createMembership($user, $orgA, $roleA);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/auth/switch-tenant', [
            'organization_id' => $orgB->id,
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('message', 'You are not a member of this organization.');
    }

    public function test_logout_revokes_token(): void
    {
        $organization = Organization::factory()->create();
        $business = Business::factory()->create(['organization_id' => $organization->id]);

        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
            'organization_id' => $organization->id,
            'business_id' => $business->id,
            'role' => 'admin',
            'permissions' => ['*'],
            'is_active' => true,
        ]);

        $tokenResult = $user->createToken('test');
        $token = $tokenResult->plainTextToken;

        $this->assertEquals(1, $user->tokens()->count());

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/auth/logout');

        $response->assertStatus(200)
            ->assertJson(['message' => 'Logged out successfully']);

        $this->assertEquals(0, $user->tokens()->count());
        $this->assertDatabaseMissing('personal_access_tokens', ['tokenable_id' => $user->id]);
    }
}
