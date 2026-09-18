<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Business;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Organization;
use App\Models\Product;
use App\Models\Role;
use App\Models\Sale;
use App\Models\TenantMembership;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsAdminOf(Organization $organization): User
    {
        $user = User::factory()->create([
            'organization_id' => $organization->id,
            'business_id' => Business::factory()->create(['organization_id' => $organization->id])->id,
            'role' => 'admin',
            'permissions' => ['sales.*', 'products.*', 'customers.*', 'inventory.*'],
        ]);
        Sanctum::actingAs($user);
        return $user;
    }

    private function seedTenantData(Organization $organization): array
    {
        $business = Business::factory()->create(['organization_id' => $organization->id]);
        $branch = Branch::factory()->create(['organization_id' => $organization->id, 'business_id' => $business->id]);
        $warehouse = Warehouse::factory()->create(['organization_id' => $organization->id, 'business_id' => $business->id, 'branch_id' => $branch->id]);
        $category = Category::factory()->create(['organization_id' => $organization->id, 'business_id' => $business->id]);
        $product = Product::factory()->create([
            'organization_id' => $organization->id,
            'business_id' => $business->id,
            'category_id' => $category->id,
        ]);
        $customer = Customer::factory()->create(['organization_id' => $organization->id, 'business_id' => $business->id]);

        return [
            'organization' => $organization,
            'business' => $business,
            'branch' => $branch,
            'warehouse' => $warehouse,
            'category' => $category,
            'product' => $product,
            'customer' => $customer,
        ];
    }

    public function test_user_cannot_access_other_organization_products(): void
    {
        $orgA = Organization::factory()->create();
        $orgB = Organization::factory()->create();
        $dataA = $this->seedTenantData($orgA);
        $dataB = $this->seedTenantData($orgB);

        $userA = $this->actingAsAdminOf($orgA);

        $this->getJson("/api/v1/products/{$dataB['product']->id}")
            ->assertStatus(404);
    }

    public function test_user_cannot_access_other_organization_customers(): void
    {
        $orgA = Organization::factory()->create();
        $orgB = Organization::factory()->create();
        $dataA = $this->seedTenantData($orgA);
        $dataB = $this->seedTenantData($orgB);

        $this->actingAsAdminOf($orgA);

        $this->getJson("/api/v1/customers/{$dataB['customer']->id}")
            ->assertStatus(404);
    }

    public function test_user_cannot_access_other_organization_sales(): void
    {
        $orgA = Organization::factory()->create();
        $orgB = Organization::factory()->create();
        $dataA = $this->seedTenantData($orgA);
        $dataB = $this->seedTenantData($orgB);

        $saleB = Sale::factory()->create([
            'organization_id' => $orgB->id,
            'business_id' => $dataB['business']->id,
            'branch_id' => $dataB['branch']->id,
        ]);

        $this->actingAsAdminOf($orgA);

        $this->getJson("/api/v1/sales/{$saleB->id}")
            ->assertStatus(404);
    }

    public function test_user_cannot_access_other_organization_branches(): void
    {
        $orgA = Organization::factory()->create();
        $orgB = Organization::factory()->create();
        $dataA = $this->seedTenantData($orgA);
        $dataB = $this->seedTenantData($orgB);

        $this->actingAsAdminOf($orgA);

        $this->getJson("/api/v1/branches/{$dataB['branch']->id}")
            ->assertStatus(404);
    }

    public function test_user_cannot_access_other_organization_categories(): void
    {
        $orgA = Organization::factory()->create();
        $orgB = Organization::factory()->create();
        $dataA = $this->seedTenantData($orgA);
        $dataB = $this->seedTenantData($orgB);

        $this->actingAsAdminOf($orgA);

        $this->getJson("/api/v1/categories/{$dataB['category']->id}")
            ->assertStatus(404);
    }

    public function test_tenant_a_cannot_switch_to_tenant_b(): void
    {
        $orgA = Organization::factory()->create();
        $orgB = Organization::factory()->create();
        $roleA = Role::create([
            'id' => (string) Str::uuid(),
            'organization_id' => $orgA->id,
            'name' => 'Member',
            'slug' => 'member',
            'description' => 'Member role',
            'permissions' => ['pos.access'],
        ]);
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

        TenantMembership::create([
            'id' => (string) Str::uuid(),
            'organization_id' => $orgA->id,
            'business_id' => $businessA->id,
            'user_id' => $user->id,
            'role_id' => $roleA->id,
            'status' => 'active',
            'joined_at' => now(),
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/auth/switch-tenant', [
            'organization_id' => $orgB->id,
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('errors.organization_id.0', 'You are not a member of this organization.');
    }

    public function test_tenant_user_cannot_access_another_tenants_data_via_admin_endpoints(): void
    {
        $orgA = Organization::factory()->create();
        $orgB = Organization::factory()->create();
        $this->actingAsAdminOf($orgA);

        $response = $this->getJson('/api/v1/admin/tenants');

        $response->assertStatus(403)
            ->assertJson(['message' => 'Forbidden']);
    }

    public function test_invitation_acceptance_creates_membership(): void
    {
        $organization = Organization::factory()->create();
        $inviterRole = Role::create([
            'id' => (string) Str::uuid(),
            'organization_id' => $organization->id,
            'name' => 'Owner',
            'slug' => 'owner',
            'description' => 'Owner role',
            'permissions' => ['*'],
        ]);
        $business = Business::factory()->create(['organization_id' => $organization->id]);

        $inviter = User::factory()->create([
            'organization_id' => $organization->id,
            'business_id' => $business->id,
            'role' => 'owner',
            'permissions' => ['*'],
            'is_active' => true,
        ]);

        TenantMembership::create([
            'id' => (string) Str::uuid(),
            'organization_id' => $organization->id,
            'business_id' => $business->id,
            'user_id' => $inviter->id,
            'role_id' => $inviterRole->id,
            'status' => 'active',
            'joined_at' => now(),
        ]);

        Sanctum::actingAs($inviter);

        $inviteeEmail = 'invitee@example.com';

        $inviteResponse = $this->postJson('/api/v1/invitations', [
            'email' => $inviteeEmail,
        ]);

        $inviteResponse->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'token', 'email', 'status']]);

        $invitation = \App\Models\Invitation::where('email', $inviteeEmail)->first();
        $this->assertNotNull($invitation);

        $this->postJson('/api/v1/invitations/accept', [
            'token' => $invitation->token,
        ])->assertStatus(200)
          ->assertJson(['message' => 'Invitation accepted']);

        $invitation->refresh();
        $this->assertEquals('accepted', $invitation->status);

        $this->assertDatabaseHas('tenant_memberships', [
            'organization_id' => $organization->id,
            'user_id' => User::where('email', $inviteeEmail)->first()->id,
            'status' => 'active',
        ]);
    }

    public function test_tenant_cannot_access_other_tenant_project(): void
    {
        $orgA = Organization::factory()->create();
        $orgB = Organization::factory()->create();

        $userA = $this->actingAsAdminOf($orgA);
        $this->actingAsAdminOf($orgB);

        $project = \App\Models\Project::factory()->create([
            'organization_id' => $orgA->id,
            'business_id' => $userA->business_id,
        ]);

        Sanctum::actingAs($userA);

        $response = $this->getJson("/api/v1/projects/{$project->id}");
        $response->assertStatus(200);

        $userB = User::factory()->create([
            'organization_id' => $orgB->id,
            'business_id' => Business::factory()->create(['organization_id' => $orgB->id])->id,
            'role' => 'admin',
            'permissions' => ['*'],
        ]);
        Sanctum::actingAs($userB);

        $response = $this->getJson("/api/v1/projects/{$project->id}");
        $response->assertStatus(404);
    }
}
