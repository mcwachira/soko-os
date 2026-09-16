<?php

namespace Tests\Feature;

use App\Models\Business;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\Organization;
use App\Models\AccountingPeriod;
use App\Models\FiscalYear;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ExpenseTest extends TestCase
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
        $expenseCategory = ExpenseCategory::factory()->create([
            'organization_id' => $organization->id,
            'business_id' => $business->id,
        ]);

        return [
            'organization' => $organization,
            'business' => $business,
            'expense_category' => $expenseCategory,
        ];
    }

    public function test_can_create_expense(): void
    {
        $organization = Organization::factory()->create();
        $data = $this->seedTenantData($organization);
        $this->actingAsAdminOf($organization);

        $payload = [
            'expense_date' => now()->toDateString(),
            'payee_name' => 'John Doe',
            'description' => 'Office supplies',
            'amount_minor' => 5000,
            'tax_minor' => 750,
            'expense_category_id' => $data['expense_category']->id,
        ];

        $response = $this->postJson('/api/v1/expenses', $payload);

        $response->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'expense_number', 'status', 'amount_minor', 'total_minor']]);

        $this->assertDatabaseHas('expenses', [
            'organization_id' => $organization->id,
            'payee_name' => 'John Doe',
            'total_minor' => 5750,
        ]);
    }

    public function test_can_approve_expense(): void
    {
        $organization = Organization::factory()->create();
        $data = $this->seedTenantData($organization);
        $this->actingAsAdminOf($organization);

        $expense = Expense::factory()->create([
            'organization_id' => $organization->id,
            'business_id' => $data['business']->id,
            'expense_category_id' => $data['expense_category']->id,
            'status' => 'draft',
        ]);

        $payload = [
            'status' => 'approved',
        ];

        $response = $this->putJson("/api/v1/expenses/{$expense->id}", $payload);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'approved');

        $this->assertDatabaseHas('expenses', [
            'id' => $expense->id,
            'status' => 'approved',
        ]);
    }

    public function test_tenant_isolation_for_expenses(): void
    {
        $orgA = Organization::factory()->create();
        $orgB = Organization::factory()->create();
        $dataA = $this->seedTenantData($orgA);
        $dataB = $this->seedTenantData($orgB);

        $expenseB = Expense::factory()->create([
            'organization_id' => $orgB->id,
            'business_id' => $dataB['business']->id,
            'expense_category_id' => $dataB['expense_category']->id,
        ]);

        $this->actingAsAdminOf($orgA);

        $response = $this->getJson("/api/v1/expenses/{$expenseB->id}");

        $response->assertStatus(404);
    }

    public function test_cannot_create_expense_in_closed_period(): void
    {
        $organization = Organization::factory()->create();
        $data = $this->seedTenantData($organization);
        $this->actingAsAdminOf($organization);

        $fy = FiscalYear::factory()->create(['organization_id' => $organization->id]);
        $period = AccountingPeriod::factory()->create([
            'organization_id' => $organization->id,
            'fiscal_year_id' => $fy->id,
            'start_date' => now()->subMonth()->toDateString(),
            'end_date' => now()->addMonth()->toDateString(),
            'status' => 'closed',
        ]);

        $payload = [
            'expense_date' => now()->toDateString(),
            'payee_name' => 'John Doe',
            'description' => 'Office supplies',
            'amount_minor' => 5000,
            'tax_minor' => 750,
            'expense_category_id' => $data['expense_category']->id,
        ];

        $response = $this->postJson('/api/v1/expenses', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['expense_date']);
    }
}
