<?php

namespace Tests\Feature;

use App\Models\Business;
use App\Models\Organization;
use App\Models\Plan;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SuperAdminTest extends TestCase
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

    public function test_super_admin_can_list_tenants_via_admin_tenants(): void
    {
        $superAdmin = $this->actingAsSuperAdmin();

        $org = Organization::factory()->create();

        $response = $this->getJson('/api/v1/admin/tenants');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'slug',
                        'status',
                        'subscriptions',
                        'users',
                    ],
                ],
            ])
            ->assertJsonCount(1, 'data');
    }

    public function test_super_admin_can_create_tenant(): void
    {
        $superAdmin = $this->actingAsSuperAdmin();
        $plan = $this->createPlan('starter');

        $response = $this->postJson('/api/v1/admin/tenants', [
            'name' => 'New Tenant',
            'slug' => 'new-tenant',
            'currency' => 'KES',
            'owner_name' => 'Owner Name',
            'owner_email' => 'owner@example.com',
            'owner_password' => 'password123',
            'plan_id' => $plan->id,
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'slug',
                ],
            ])
            ->assertJsonPath('data.name', 'New Tenant')
            ->assertJsonPath('data.slug', 'new-tenant');

        $this->assertDatabaseHas('organizations', [
            'name' => 'New Tenant',
            'slug' => 'new-tenant',
            'currency' => 'KES',
        ]);
    }

    public function test_super_admin_can_suspend_tenant(): void
    {
        $superAdmin = $this->actingAsSuperAdmin();
        $org = Organization::factory()->create();

        $response = $this->postJson("/api/v1/admin/tenants/{$org->id}/suspend");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Tenant suspended']);

        $this->assertDatabaseHas('organizations', [
            'id' => $org->id,
            'status' => 'suspended',
        ]);
    }

    public function test_super_admin_can_activate_tenant(): void
    {
        $superAdmin = $this->actingAsSuperAdmin();
        $org = Organization::factory()->create(['status' => 'suspended']);

        $response = $this->postJson("/api/v1/admin/tenants/{$org->id}/activate");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Tenant activated']);

        $this->assertDatabaseHas('organizations', [
            'id' => $org->id,
            'status' => 'active',
        ]);
    }

    public function test_non_super_admin_cannot_access_admin_routes(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'permissions' => ['sales.view', 'sales.create'],
            'is_active' => true,
        ]);

        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/v1/admin/tenants');

        $response->assertStatus(403)
            ->assertJson(['message' => 'Forbidden']);
    }
}
