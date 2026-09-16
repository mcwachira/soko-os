<?php

namespace Tests\Feature;

use App\Models\Account;
use App\Models\Business;
use App\Models\Customer;
use App\Models\ExpenseCategory;
use App\Models\Invoice;
use App\Models\JournalEntry;
use App\Models\JournalLine;
use App\Models\Organization;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AccountingTest extends TestCase
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

    public function test_can_create_account(): void
    {
        $organization = Organization::factory()->create();
        $this->actingAsAdminOf($organization);

        $payload = [
            'code' => '1000',
            'name' => 'Cash',
            'type' => 'asset',
            'currency' => 'KES',
        ];

        $response = $this->postJson('/api/v1/accounts', $payload);

        $response->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'code', 'name', 'type', 'currency']]);

        $this->assertDatabaseHas('accounts', [
            'organization_id' => $organization->id,
            'code' => '1000',
            'name' => 'Cash',
            'type' => 'asset',
            'currency' => 'KES',
        ]);
    }

    public function test_can_update_account(): void
    {
        $organization = Organization::factory()->create();
        $data = $this->seedTenantData($organization);
        $this->actingAsAdminOf($organization);

        $payload = [
            'name' => 'Cash on Hand',
        ];

        $response = $this->putJson("/api/v1/accounts/{$data['account']->id}", $payload);

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'Cash on Hand');

        $this->assertDatabaseHas('accounts', [
            'id' => $data['account']->id,
            'name' => 'Cash on Hand',
        ]);
    }

    public function test_can_list_journal_entries(): void
    {
        $organization = Organization::factory()->create();
        $this->actingAsAdminOf($organization);

        JournalEntry::factory()->create([
            'organization_id' => $organization->id,
            'status' => 'draft',
        ]);

        $response = $this->getJson('/api/v1/journal-entries');

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => [['id', 'entry_date', 'status', 'lines']]]);
    }

    public function test_can_create_journal_entry(): void
    {
        $organization = Organization::factory()->create();
        $data = $this->seedTenantData($organization);
        $this->actingAsAdminOf($organization);

        $account2 = Account::factory()->create([
            'organization_id' => $organization->id,
            'business_id' => $data['business']->id,
            'type' => 'liability',
        ]);

        $payload = [
            'entry_date' => now()->toDateString(),
            'notes' => 'Test entry',
            'entry_type' => 'manual',
            'lines' => [
                [
                    'account_id' => $data['account']->id,
                    'description' => 'Debit line',
                    'debit_minor' => 10000,
                    'credit_minor' => 0,
                ],
                [
                    'account_id' => $account2->id,
                    'description' => 'Credit line',
                    'debit_minor' => 0,
                    'credit_minor' => 10000,
                ],
            ],
        ];

        $response = $this->postJson('/api/v1/journal-entries', $payload);

        $response->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'status', 'lines']]);

        $this->assertDatabaseHas('journal_entries', [
            'organization_id' => $organization->id,
            'notes' => 'Test entry',
            'status' => 'draft',
        ]);
    }

    public function test_journal_entry_requires_balanced_lines(): void
    {
        $organization = Organization::factory()->create();
        $data = $this->seedTenantData($organization);
        $this->actingAsAdminOf($organization);

        $account2 = Account::factory()->create([
            'organization_id' => $organization->id,
            'business_id' => $data['business']->id,
            'type' => 'liability',
        ]);

        $payload = [
            'entry_date' => now()->toDateString(),
            'lines' => [
                [
                    'account_id' => $data['account']->id,
                    'debit_minor' => 10000,
                    'credit_minor' => 0,
                ],
                [
                    'account_id' => $account2->id,
                    'debit_minor' => 0,
                    'credit_minor' => 5000,
                ],
            ],
        ];

        $this->postJson('/api/v1/journal-entries', $payload)
            ->assertStatus(500)
            ->assertJsonFragment(['message' => 'Journal entry is not balanced. Total debits: 10000, total credits: 5000']);
    }

    public function test_can_post_journal_entry(): void
    {
        $organization = Organization::factory()->create();
        $data = $this->seedTenantData($organization);
        $this->actingAsAdminOf($organization);

        $account2 = Account::factory()->create([
            'organization_id' => $organization->id,
            'business_id' => $data['business']->id,
            'type' => 'liability',
        ]);

        $entry = JournalEntry::factory()->create([
            'organization_id' => $organization->id,
            'business_id' => $data['business']->id,
            'status' => 'draft',
        ]);

        JournalLine::factory()->create([
            'journal_entry_id' => $entry->id,
            'account_id' => $data['account']->id,
            'debit_minor' => 10000,
            'credit_minor' => 0,
        ]);
        JournalLine::factory()->create([
            'journal_entry_id' => $entry->id,
            'account_id' => $account2->id,
            'debit_minor' => 0,
            'credit_minor' => 10000,
        ]);

        $response = $this->postJson("/api/v1/journal-entries/{$entry->id}/post");

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'posted');

        $this->assertDatabaseHas('journal_entries', [
            'id' => $entry->id,
            'status' => 'posted',
        ]);
    }

    public function test_can_reverse_journal_entry(): void
    {
        $organization = Organization::factory()->create();
        $data = $this->seedTenantData($organization);
        $this->actingAsAdminOf($organization);

        $account2 = Account::factory()->create([
            'organization_id' => $organization->id,
            'business_id' => $data['business']->id,
            'type' => 'liability',
        ]);

        $entry = JournalEntry::factory()->create([
            'organization_id' => $organization->id,
            'business_id' => $data['business']->id,
            'status' => 'posted',
        ]);

        JournalLine::factory()->create([
            'journal_entry_id' => $entry->id,
            'account_id' => $data['account']->id,
            'debit_minor' => 10000,
            'credit_minor' => 0,
        ]);
        JournalLine::factory()->create([
            'journal_entry_id' => $entry->id,
            'account_id' => $account2->id,
            'debit_minor' => 0,
            'credit_minor' => 10000,
        ]);

        $response = $this->postJson("/api/v1/journal-entries/{$entry->id}/reverse");

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'posted')
            ->assertJsonPath('data.entry_type', 'reversal');

        $this->assertDatabaseHas('journal_entries', [
            'reference_type' => 'reversal',
            'reference_id' => $entry->id,
        ]);
    }

    public function test_can_view_ledger(): void
    {
        $organization = Organization::factory()->create();
        $data = $this->seedTenantData($organization);
        $this->actingAsAdminOf($organization);

        $account2 = Account::factory()->create([
            'organization_id' => $organization->id,
            'business_id' => $data['business']->id,
            'type' => 'liability',
        ]);

        $entry = JournalEntry::factory()->create([
            'organization_id' => $organization->id,
            'business_id' => $data['business']->id,
            'status' => 'posted',
        ]);

        JournalLine::factory()->create([
            'journal_entry_id' => $entry->id,
            'account_id' => $data['account']->id,
            'debit_minor' => 10000,
            'credit_minor' => 0,
        ]);
        JournalLine::factory()->create([
            'journal_entry_id' => $entry->id,
            'account_id' => $account2->id,
            'debit_minor' => 0,
            'credit_minor' => 10000,
        ]);

        $response = $this->getJson("/api/v1/ledger?account_id={$data['account']->id}");

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => [['account_code', 'account_name', 'debit_minor', 'credit_minor']]]);
    }

    public function test_tenant_isolation_for_accounts(): void
    {
        $orgA = Organization::factory()->create();
        $orgB = Organization::factory()->create();
        $dataA = $this->seedTenantData($orgA);
        $dataB = $this->seedTenantData($orgB);

        $this->actingAsAdminOf($orgA);

        $response = $this->getJson("/api/v1/accounts/{$dataB['account']->id}");

        $response->assertStatus(404);
    }

    public function test_can_generate_trial_balance(): void
    {
        $organization = Organization::factory()->create();
        $data = $this->seedTenantData($organization);
        $this->actingAsAdminOf($organization);

        $account2 = Account::factory()->create([
            'organization_id' => $organization->id,
            'business_id' => $data['business']->id,
            'type' => 'liability',
        ]);

        $entry = JournalEntry::factory()->create([
            'organization_id' => $organization->id,
            'business_id' => $data['business']->id,
            'status' => 'posted',
        ]);

        JournalLine::factory()->create([
            'journal_entry_id' => $entry->id,
            'account_id' => $data['account']->id,
            'debit_minor' => 10000,
            'credit_minor' => 0,
        ]);
        JournalLine::factory()->create([
            'journal_entry_id' => $entry->id,
            'account_id' => $account2->id,
            'debit_minor' => 0,
            'credit_minor' => 10000,
        ]);

        $response = $this->getJson('/api/v1/reports/trial-balance');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'accounts',
                    'totals' => ['total_debits_minor', 'total_credits_minor', 'is_balanced'],
                ],
            ]);
    }

    public function test_can_generate_profit_loss(): void
    {
        $organization = Organization::factory()->create();
        $data = $this->seedTenantData($organization);
        $this->actingAsAdminOf($organization);

        $revenueAccount = Account::factory()->create([
            'organization_id' => $organization->id,
            'business_id' => $data['business']->id,
            'type' => 'revenue',
        ]);
        $expenseAccount = Account::factory()->create([
            'organization_id' => $organization->id,
            'business_id' => $data['business']->id,
            'type' => 'expense',
        ]);

        $entry = JournalEntry::factory()->create([
            'organization_id' => $organization->id,
            'business_id' => $data['business']->id,
            'status' => 'posted',
        ]);

        JournalLine::factory()->create([
            'journal_entry_id' => $entry->id,
            'account_id' => $revenueAccount->id,
            'debit_minor' => 0,
            'credit_minor' => 50000,
        ]);
        JournalLine::factory()->create([
            'journal_entry_id' => $entry->id,
            'account_id' => $expenseAccount->id,
            'debit_minor' => 30000,
            'credit_minor' => 0,
        ]);

        $response = $this->getJson('/api/v1/reports/profit-loss');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'revenue_total_minor',
                    'expense_total_minor',
                    'net_profit_minor',
                    'accounts',
                ],
            ]);
    }

    public function test_can_generate_balance_sheet(): void
    {
        $organization = Organization::factory()->create();
        $data = $this->seedTenantData($organization);
        $this->actingAsAdminOf($organization);

        $assetAccount = Account::factory()->create([
            'organization_id' => $organization->id,
            'business_id' => $data['business']->id,
            'type' => 'asset',
        ]);
        $liabilityAccount = Account::factory()->create([
            'organization_id' => $organization->id,
            'business_id' => $data['business']->id,
            'type' => 'liability',
        ]);

        $entry = JournalEntry::factory()->create([
            'organization_id' => $organization->id,
            'business_id' => $data['business']->id,
            'status' => 'posted',
        ]);

        JournalLine::factory()->create([
            'journal_entry_id' => $entry->id,
            'account_id' => $assetAccount->id,
            'debit_minor' => 100000,
            'credit_minor' => 0,
        ]);
        JournalLine::factory()->create([
            'journal_entry_id' => $entry->id,
            'account_id' => $liabilityAccount->id,
            'debit_minor' => 0,
            'credit_minor' => 100000,
        ]);

        $response = $this->getJson('/api/v1/reports/balance-sheet');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'assets_minor',
                    'liabilities_minor',
                    'equity_minor',
                    'is_balanced',
                    'accounts',
                ],
            ]);
    }
}
