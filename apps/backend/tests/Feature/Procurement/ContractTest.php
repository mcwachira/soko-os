<?php

namespace Tests\Feature\Procurement;

use App\Models\Branch;
use App\Models\Business;
use App\Models\ContractLine;
use App\Models\ContractRenewal;
use App\Models\Organization;
use App\Models\ProcurementContract;
use App\Models\Supplier;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ContractTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsAdminOf(Organization $organization): User
    {
        $user = User::factory()->create([
            'organization_id' => $organization->id,
            'business_id' => Business::factory()->create(['organization_id' => $organization->id])->id,
            'role' => 'admin',
            'permissions' => ['*'],
        ]);
        Sanctum::actingAs($user);
        return $user;
    }

    private function seedTenantData(Organization $organization): array
    {
        $business = Business::factory()->create(['organization_id' => $organization->id]);
        $branch = Branch::factory()->create(['organization_id' => $organization->id, 'business_id' => $business->id]);
        $warehouse = Warehouse::factory()->create(['organization_id' => $organization->id, 'business_id' => $business->id, 'branch_id' => $branch->id]);
        $supplier = Supplier::factory()->create(['organization_id' => $organization->id, 'business_id' => $business->id]);

        return [
            'organization' => $organization,
            'business' => $business,
            'branch' => $branch,
            'warehouse' => $warehouse,
            'supplier' => $supplier,
        ];
    }

    public function test_can_create_contract(): void
    {
        $organization = Organization::factory()->create();
        $this->actingAsAdminOf($organization);
        $data = $this->seedTenantData($organization);

        $payload = [
            'business_id' => $data['business']->id,
            'supplier_id' => $data['supplier']->id,
            'contract_number' => 'CNT-001',
            'title' => 'Annual Supply Contract',
            'description' => 'Supply of raw materials for one year',
            'start_date' => now()->toDateString(),
            'end_date' => now()->addYear()->toDateString(),
            'renewal_date' => now()->addYear()->toDateString(),
            'contract_value_minor' => 5000000,
            'currency' => 'KES',
            'terms' => 'Net 30 delivery',
            'status' => 'draft',
        ];

        $response = $this->postJson('/api/v1/procurement/contracts', $payload);

        $response->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'contract_number', 'title', 'status']]);

        $this->assertDatabaseHas('procurement_contracts', [
            'organization_id' => $organization->id,
            'contract_number' => 'CNT-001',
            'title' => 'Annual Supply Contract',
            'contract_value_minor' => 5000000,
        ]);
    }

    public function test_can_update_contract(): void
    {
        $organization = Organization::factory()->create();
        $this->actingAsAdminOf($organization);
        $data = $this->seedTenantData($organization);

        $contract = ProcurementContract::create([
            'organization_id' => $organization->id,
            'business_id' => $data['business']->id,
            'supplier_id' => $data['supplier']->id,
            'contract_number' => 'CNT-' . fake()->unique()->bothify('####'),
            'title' => fake()->sentence(),
            'start_date' => now()->toDateString(),
            'end_date' => now()->addYear()->toDateString(),
        ]);

        $payload = [
            'title' => 'Updated Contract Title',
            'terms' => 'Updated terms',
        ];

        $response = $this->putJson("/api/v1/procurement/contracts/{$contract->id}", $payload);

        $response->assertStatus(200)
            ->assertJsonPath('data.title', 'Updated Contract Title');

        $this->assertDatabaseHas('procurement_contracts', [
            'id' => $contract->id,
            'title' => 'Updated Contract Title',
        ]);
    }

    public function test_can_list_contracts(): void
    {
        $organization = Organization::factory()->create();
        $this->actingAsAdminOf($organization);
        $data = $this->seedTenantData($organization);

        ProcurementContract::create([
            'organization_id' => $organization->id,
            'business_id' => $data['business']->id,
            'supplier_id' => $data['supplier']->id,
            'contract_number' => 'CNT-' . fake()->unique()->bothify('####'),
            'title' => fake()->sentence(),
            'start_date' => now()->toDateString(),
            'end_date' => now()->addYear()->toDateString(),
        ]);

        $response = $this->getJson('/api/v1/procurement/contracts');

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => [['id', 'contract_number', 'status']]]);
    }

    public function test_can_delete_contract(): void
    {
        $organization = Organization::factory()->create();
        $this->actingAsAdminOf($organization);
        $data = $this->seedTenantData($organization);

        $contract = ProcurementContract::create([
            'organization_id' => $organization->id,
            'business_id' => $data['business']->id,
            'supplier_id' => $data['supplier']->id,
            'contract_number' => 'CNT-' . fake()->unique()->bothify('####'),
            'title' => fake()->sentence(),
            'start_date' => now()->toDateString(),
            'end_date' => now()->addYear()->toDateString(),
            'status' => 'draft',
        ]);

        $response = $this->deleteJson("/api/v1/procurement/contracts/{$contract->id}");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Procurement contract deleted']);

        $this->assertDatabaseMissing('procurement_contracts', ['id' => $contract->id]);
    }

    public function test_contract_renewal(): void
    {
        $organization = Organization::factory()->create();
        $this->actingAsAdminOf($organization);
        $data = $this->seedTenantData($organization);

        $contract = ProcurementContract::create([
            'organization_id' => $organization->id,
            'business_id' => $data['business']->id,
            'supplier_id' => $data['supplier']->id,
            'contract_number' => 'CNT-' . fake()->unique()->bothify('####'),
            'title' => fake()->sentence(),
            'status' => 'active',
            'start_date' => now()->subYear()->toDateString(),
            'end_date' => now()->toDateString(),
            'renewal_date' => now()->toDateString(),
        ]);

        ContractRenewal::create([
            'id' => \Illuminate\Support\Str::uuid()->toString(),
            'organization_id' => $organization->id,
            'procurement_contract_id' => $contract->id,
            'renewal_date' => now()->addYear()->toDateString(),
            'new_end_date' => now()->addYears(2)->toDateString(),
            'renewed_by_user_id' => \App\Models\User::factory()->create(['organization_id' => $organization->id])->id,
            'notes' => 'Annual renewal',
        ]);

        $contract->update([
            'status' => 'renewed',
            'end_date' => now()->addYears(2)->toDateString(),
        ]);

        $this->assertDatabaseHas('procurement_contracts', [
            'id' => $contract->id,
            'status' => 'renewed',
        ]);

        $this->assertDatabaseHas('contract_renewals', [
            'procurement_contract_id' => $contract->id,
        ]);
    }

    public function test_tenant_cannot_access_other_tenant_contract(): void
    {
        $orgA = Organization::factory()->create();
        $orgB = Organization::factory()->create();
        $this->actingAsAdminOf($orgA);
        $this->seedTenantData($orgB);

        $contractB = ProcurementContract::create([
            'organization_id' => $orgB->id,
            'contract_number' => 'CNT-' . fake()->unique()->bothify('####'),
            'title' => fake()->sentence(),
            'start_date' => now()->toDateString(),
            'end_date' => now()->addYear()->toDateString(),
            'supplier_id' => Supplier::factory()->create(['organization_id' => $orgB->id])->id,
        ]);

        $this->actingAsAdminOf($orgA);

        $response = $this->getJson("/api/v1/procurement/contracts/{$contractB->id}");

        $response->assertStatus(404);
    }
}
