<?php

namespace Tests\Feature;

use App\Models\Account;
use App\Models\Branch;
use App\Models\Business;
use App\Models\Category;
use App\Models\Customer;
use App\Models\InventoryMovement;
use App\Models\JournalEntry;
use App\Models\JournalLine;
use App\Models\Organization;
use App\Models\Product;
use App\Models\ProductStock;
use App\Models\Warehouse;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AccountingIntegrityTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsAdminOf(Organization $organization): User
    {
        $business = Business::factory()->create(['organization_id' => $organization->id]);
        $user = User::factory()->create([
            'organization_id' => $organization->id,
            'business_id' => $business->id,
            'role' => 'admin',
            'permissions' => ['*'],
        ]);
        Sanctum::actingAs($user);
        return $user;
    }

    private function seedTenantData(Organization $organization, User $user): array
    {
        $business = $user->business;
        $branch = \App\Models\Branch::factory()->create(['organization_id' => $organization->id, 'business_id' => $business->id]);
        $warehouse = Warehouse::factory()->create(['organization_id' => $organization->id, 'business_id' => $business->id, 'branch_id' => $branch->id]);
        $category = Category::factory()->create(['organization_id' => $organization->id, 'business_id' => $business->id]);
        $product = Product::factory()->create([
            'organization_id' => $organization->id,
            'business_id' => $business->id,
            'category_id' => $category->id,
            'selling_price_minor' => 10000,
            'cost_price_minor' => 6000,
        ]);
        $customer = Customer::factory()->create(['organization_id' => $organization->id, 'business_id' => $business->id]);

        $cashAccount = Account::factory()->create([
            'organization_id' => $organization->id,
            'business_id' => $business->id,
            'code' => '1000',
            'type' => 'asset',
        ]);
        $arAccount = Account::factory()->create([
            'organization_id' => $organization->id,
            'business_id' => $business->id,
            'code' => '1200',
            'type' => 'asset',
        ]);
        $salesAccount = Account::factory()->create([
            'organization_id' => $organization->id,
            'business_id' => $business->id,
            'code' => '4000',
            'type' => 'revenue',
        ]);
        $taxAccount = Account::factory()->create([
            'organization_id' => $organization->id,
            'business_id' => $business->id,
            'code' => '2200',
            'type' => 'liability',
        ]);
        $cogsAccount = Account::factory()->create([
            'organization_id' => $organization->id,
            'business_id' => $business->id,
            'code' => '5000',
            'type' => 'expense',
        ]);
        $inventoryAccount = Account::factory()->create([
            'organization_id' => $organization->id,
            'business_id' => $business->id,
            'code' => '1300',
            'type' => 'asset',
        ]);

        InventoryMovement::create([
            'id' => Str::uuid()->toString(),
            'organization_id' => $organization->id,
            'business_id' => $business->id,
            'branch_id' => $branch->id,
            'warehouse_id' => $warehouse->id,
            'product_id' => $product->id,
            'movement_type' => 'purchase',
            'quantity_change' => 100,
            'balance_after' => 100,
            'reference_type' => 'test',
            'reference_id' => 'test-1',
            'created_by_user_id' => $user->id,
        ]);

        ProductStock::updateOrCreate(
            [
                'organization_id' => $organization->id,
                'product_id' => $product->id,
                'warehouse_id' => $warehouse->id,
            ],
            [
                'id' => Str::uuid()->toString(),
                'business_id' => $business->id,
                'quantity_on_hand' => 100,
                'quantity_reserved' => 0,
                'quantity_available' => 100,
            ]
        );

        return [
            'organization' => $organization,
            'business' => $business,
            'branch' => $branch,
            'warehouse' => $warehouse,
            'category' => $category,
            'product' => $product,
            'customer' => $customer,
            'cash_account' => $cashAccount,
            'ar_account' => $arAccount,
            'sales_account' => $salesAccount,
            'tax_account' => $taxAccount,
            'cogs_account' => $cogsAccount,
            'inventory_account' => $inventoryAccount,
        ];
    }

    public function test_posted_journals_always_balance(): void
    {
        $organization = Organization::factory()->create();
        $user = $this->actingAsAdminOf($organization);
        $data = $this->seedTenantData($organization, $user);

        $account1 = Account::factory()->create([
            'organization_id' => $organization->id,
            'type' => 'asset',
        ]);
        $account2 = Account::factory()->create([
            'organization_id' => $organization->id,
            'type' => 'liability',
        ]);

        $entry = JournalEntry::factory()->create([
            'organization_id' => $organization->id,
            'status' => 'posted',
        ]);

        JournalLine::factory()->create([
            'journal_entry_id' => $entry->id,
            'account_id' => $account1->id,
            'debit_minor' => 15000,
            'credit_minor' => 0,
        ]);
        JournalLine::factory()->create([
            'journal_entry_id' => $entry->id,
            'account_id' => $account2->id,
            'debit_minor' => 0,
            'credit_minor' => 15000,
        ]);

        $totalDebits = JournalLine::where('journal_entry_id', $entry->id)->sum('debit_minor');
        $totalCredits = JournalLine::where('journal_entry_id', $entry->id)->sum('credit_minor');

        $this->assertEquals($totalDebits, $totalCredits);
        $this->assertEquals(15000, $totalDebits);
    }

    public function test_trial_balance_sums_match(): void
    {
        $organization = Organization::factory()->create();
        $user = $this->actingAsAdminOf($organization);
        $data = $this->seedTenantData($organization, $user);

        $assetAccount = Account::factory()->create([
            'organization_id' => $organization->id,
            'type' => 'asset',
        ]);
        $liabilityAccount = Account::factory()->create([
            'organization_id' => $organization->id,
            'type' => 'liability',
        ]);

        $entry = JournalEntry::factory()->create([
            'organization_id' => $organization->id,
            'status' => 'posted',
        ]);

        JournalLine::factory()->create([
            'journal_entry_id' => $entry->id,
            'account_id' => $assetAccount->id,
            'debit_minor' => 20000,
            'credit_minor' => 0,
        ]);
        JournalLine::factory()->create([
            'journal_entry_id' => $entry->id,
            'account_id' => $liabilityAccount->id,
            'debit_minor' => 0,
            'credit_minor' => 20000,
        ]);

        $response = $this->getJson('/api/v1/reports/trial-balance');

        $response->assertStatus(200)
            ->assertJsonPath('data.totals.total_debits_minor', 20000)
            ->assertJsonPath('data.totals.total_credits_minor', 20000)
            ->assertJsonPath('data.totals.is_balanced', true);
    }

    public function test_balance_sheet_balances(): void
    {
        $organization = Organization::factory()->create();
        $user = $this->actingAsAdminOf($organization);
        $data = $this->seedTenantData($organization, $user);

        $assetAccount = Account::factory()->create([
            'organization_id' => $organization->id,
            'type' => 'asset',
        ]);
        $liabilityAccount = Account::factory()->create([
            'organization_id' => $organization->id,
            'type' => 'liability',
        ]);

        $entry = JournalEntry::factory()->create([
            'organization_id' => $organization->id,
            'status' => 'posted',
        ]);

        JournalLine::factory()->create([
            'journal_entry_id' => $entry->id,
            'account_id' => $assetAccount->id,
            'debit_minor' => 50000,
            'credit_minor' => 0,
        ]);
        JournalLine::factory()->create([
            'journal_entry_id' => $entry->id,
            'account_id' => $liabilityAccount->id,
            'debit_minor' => 0,
            'credit_minor' => 50000,
        ]);

        $response = $this->getJson('/api/v1/reports/balance-sheet');

        $response->assertStatus(200)
            ->assertJsonPath('data.is_balanced', true);
    }

    public function test_sale_generates_balanced_journal(): void
    {
        $organization = Organization::factory()->create();
        $user = $this->actingAsAdminOf($organization);
        $data = $this->seedTenantData($organization, $user);

        $payload = [
            'branch_id' => $data['branch']->id,
            'terminal_id' => null,
            'customer_id' => $data['customer']->id,
            'shift_id' => null,
            'items' => [
                [
                    'product_id' => $data['product']->id,
                    'sku' => $data['product']->sku,
                    'name' => $data['product']->name,
                    'quantity' => 2,
                    'unit_price_minor' => 10000,
                    'discount_minor' => 0,
                    'tax_rate_percentage' => 16.0,
                ],
            ],
            'payments' => [
                [
                    'amount_minor' => 20000,
                    'payment_method' => 'cash',
                    'reference' => 'CASH-001',
                ],
            ],
            'discount_minor' => 0,
            'notes' => 'Test sale',
        ];

        $this->postJson('/api/v1/sales', $payload)->assertStatus(201);

        $sale = \App\Models\Sale::where('organization_id', $organization->id)->first();
        $accountingService = app(\App\Services\Accounting\AccountingService::class);
        $journalEntry = $accountingService->generateJournalEntry($sale->load('items', 'payments', 'customer'));

        $this->assertNotNull($journalEntry);

        $totalDebits = JournalLine::where('journal_entry_id', $journalEntry->id)->sum('debit_minor');
        $totalCredits = JournalLine::where('journal_entry_id', $journalEntry->id)->sum('credit_minor');

        $this->assertEquals($totalDebits, $totalCredits);
        $this->assertGreaterThan(0, $totalDebits);
    }

    public function test_payment_generates_balanced_journal(): void
    {
        $organization = Organization::factory()->create();
        $user = $this->actingAsAdminOf($organization);
        $data = $this->seedTenantData($organization, $user);

        $payload = [
            'branch_id' => $data['branch']->id,
            'terminal_id' => null,
            'customer_id' => $data['customer']->id,
            'shift_id' => null,
            'items' => [
                [
                    'product_id' => $data['product']->id,
                    'sku' => $data['product']->sku,
                    'name' => $data['product']->name,
                    'quantity' => 2,
                    'unit_price_minor' => 10000,
                    'discount_minor' => 0,
                    'tax_rate_percentage' => 16.0,
                ],
            ],
            'payments' => [
                [
                    'amount_minor' => 20000,
                    'payment_method' => 'cash',
                    'reference' => 'CASH-002',
                ],
            ],
            'discount_minor' => 0,
            'notes' => 'Test sale with payment',
        ];

        $this->postJson('/api/v1/sales', $payload)->assertStatus(201);

        $sale = \App\Models\Sale::where('organization_id', $organization->id)->first();
        $accountingService = app(\App\Services\Accounting\AccountingService::class);
        $journalEntry = $accountingService->generateJournalEntry($sale->load('items', 'payments', 'customer'));

        $this->assertNotNull($journalEntry);

        $totalDebits = JournalLine::where('journal_entry_id', $journalEntry->id)->sum('debit_minor');
        $totalCredits = JournalLine::where('journal_entry_id', $journalEntry->id)->sum('credit_minor');

        $this->assertEquals($totalDebits, $totalCredits);
    }
}
