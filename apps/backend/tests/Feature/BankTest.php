<?php

namespace Tests\Feature;

use App\Models\Account;
use App\Models\BankAccount;
use App\Models\BankReconciliation;
use App\Models\BankTransaction;
use App\Models\Business;
use App\Models\ExpenseCategory;
use App\Models\Expense;
use App\Models\Invoice;
use App\Models\JournalEntry;
use App\Models\Organization;
use App\Models\AccountingPeriod;
use App\Models\FiscalYear;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BankTest extends TestCase
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
        $account = Account::factory()->create([
            'organization_id' => $organization->id,
            'business_id' => $business->id,
            'type' => 'asset',
        ]);

        return [
            'organization' => $organization,
            'business' => $business,
            'account' => $account,
        ];
    }

    public function test_can_create_bank_account(): void
    {
        $organization = Organization::factory()->create();
        $data = $this->seedTenantData($organization);
        $this->actingAsAdminOf($organization);

        $payload = [
            'name' => 'KCB Main',
            'account_number_masked' => '****1234',
            'bank_name' => 'KCB',
            'currency' => 'KES',
            'account_id' => $data['account']->id,
        ];

        $response = $this->postJson('/api/v1/bank-accounts', $payload);

        $response->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'name', 'bank_name', 'currency']]);

        $this->assertDatabaseHas('bank_accounts', [
            'organization_id' => $organization->id,
            'name' => 'KCB Main',
            'bank_name' => 'KCB',
        ]);
    }

    public function test_can_create_bank_transaction(): void
    {
        $organization = Organization::factory()->create();
        $data = $this->seedTenantData($organization);
        $this->actingAsAdminOf($organization);

        $bankAccount = BankAccount::factory()->create([
            'organization_id' => $organization->id,
            'business_id' => $data['business']->id,
            'account_id' => $data['account']->id,
        ]);

        $payload = [
            'bank_account_id' => $bankAccount->id,
            'type' => 'deposit',
            'direction' => 'in',
            'transaction_date' => now()->toDateString(),
            'reference' => 'DEP-001',
            'description' => 'Customer deposit',
            'counterparty' => 'ACME Ltd',
            'amount_minor' => 50000,
            'currency' => 'KES',
            'source' => 'manual',
        ];

        $response = $this->postJson('/api/v1/bank-transactions', $payload);

        $response->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'type', 'direction', 'amount_minor', 'status']]);

        $this->assertDatabaseHas('bank_transactions', [
            'organization_id' => $organization->id,
            'bank_account_id' => $bankAccount->id,
            'amount_minor' => 50000,
        ]);
    }

    public function test_can_create_bank_reconciliation(): void
    {
        $organization = Organization::factory()->create();
        $data = $this->seedTenantData($organization);
        $this->actingAsAdminOf($organization);

        $bankAccount = BankAccount::factory()->create([
            'organization_id' => $organization->id,
            'business_id' => $data['business']->id,
            'account_id' => $data['account']->id,
        ]);

        $payload = [
            'bank_account_id' => $bankAccount->id,
            'statement_date' => now()->toDateString(),
            'start_date' => now()->subDays(30)->toDateString(),
            'end_date' => now()->toDateString(),
            'statement_balance_minor' => 100000,
            'book_balance_minor' => 100000,
            'notes' => 'Monthly reconciliation',
        ];

        $response = $this->postJson('/api/v1/bank-reconciliations', $payload);

        $response->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'statement_balance_minor', 'book_balance_minor', 'difference_minor', 'status']])
            ->assertJsonPath('data.status', 'completed');

        $this->assertDatabaseHas('bank_reconciliations', [
            'organization_id' => $organization->id,
            'bank_account_id' => $bankAccount->id,
            'status' => 'completed',
        ]);
    }

    public function test_tenant_isolation_for_banking(): void
    {
        $orgA = Organization::factory()->create();
        $orgB = Organization::factory()->create();
        $dataA = $this->seedTenantData($orgA);
        $dataB = $this->seedTenantData($orgB);

        $bankAccountB = BankAccount::factory()->create([
            'organization_id' => $orgB->id,
            'business_id' => $dataB['business']->id,
            'account_id' => $dataB['account']->id,
        ]);

        $this->actingAsAdminOf($orgA);

        $response = $this->getJson("/api/v1/bank-accounts/{$bankAccountB->id}");

        $response->assertStatus(404);
    }

    public function test_cannot_create_bank_transaction_in_closed_period(): void
    {
        $organization = Organization::factory()->create();
        $data = $this->seedTenantData($organization);
        $this->actingAsAdminOf($organization);

        $bankAccount = BankAccount::factory()->create([
            'organization_id' => $organization->id,
            'business_id' => $data['business']->id,
            'account_id' => $data['account']->id,
        ]);

        $fy = FiscalYear::factory()->create(['organization_id' => $organization->id]);
        $period = AccountingPeriod::factory()->create([
            'organization_id' => $organization->id,
            'fiscal_year_id' => $fy->id,
            'start_date' => now()->subMonth()->toDateString(),
            'end_date' => now()->addMonth()->toDateString(),
            'status' => 'closed',
        ]);

        $payload = [
            'bank_account_id' => $bankAccount->id,
            'type' => 'deposit',
            'direction' => 'in',
            'transaction_date' => now()->toDateString(),
            'reference' => 'DEP-001',
            'description' => 'Customer deposit',
            'counterparty' => 'ACME Ltd',
            'amount_minor' => 50000,
            'currency' => 'KES',
            'source' => 'manual',
        ];

        $response = $this->postJson('/api/v1/bank-transactions', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['transaction_date']);
    }
}
