<?php

namespace Tests\Feature;

use App\Models\Business;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Organization;
use App\Models\Product;
use App\Models\AccountingPeriod;
use App\Models\FiscalYear;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class InvoiceTest extends TestCase
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
        $customer = Customer::factory()->create([
            'organization_id' => $organization->id,
            'business_id' => $business->id,
        ]);
        $product = Product::factory()->create([
            'organization_id' => $organization->id,
            'business_id' => $business->id,
            'selling_price_minor' => 10000,
        ]);

        return [
            'organization' => $organization,
            'business' => $business,
            'customer' => $customer,
            'product' => $product,
        ];
    }

    public function test_can_create_invoice(): void
    {
        $organization = Organization::factory()->create();
        $data = $this->seedTenantData($organization);
        $this->actingAsAdminOf($organization);

        $payload = [
            'customer_id' => $data['customer']->id,
            'issue_date' => now()->toDateString(),
            'currency' => 'KES',
            'items' => [
                [
                    'product_id' => $data['product']->id,
                    'description' => 'Test item',
                    'quantity' => 2,
                    'unit_price_minor' => 10000,
                    'tax_rate_percentage' => 16.0,
                ],
            ],
        ];

        $response = $this->postJson('/api/v1/invoices', $payload);

        $response->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'invoice_number', 'subtotal_minor', 'tax_total_minor', 'grand_total_minor', 'items']]);

        $this->assertDatabaseHas('invoices', [
            'organization_id' => $organization->id,
            'customer_id' => $data['customer']->id,
            'grand_total_minor' => 23200,
        ]);
    }

    public function test_can_update_invoice(): void
    {
        $organization = Organization::factory()->create();
        $data = $this->seedTenantData($organization);
        $this->actingAsAdminOf($organization);

        $invoice = Invoice::factory()->create([
            'organization_id' => $organization->id,
            'business_id' => $data['business']->id,
            'customer_id' => $data['customer']->id,
        ]);

        $payload = [
            'notes' => 'Updated notes',
        ];

        $response = $this->putJson("/api/v1/invoices/{$invoice->id}", $payload);

        $response->assertStatus(200)
            ->assertJsonPath('data.notes', 'Updated notes');

        $this->assertDatabaseHas('invoices', [
            'id' => $invoice->id,
            'notes' => 'Updated notes',
        ]);
    }

    public function test_can_list_invoices(): void
    {
        $organization = Organization::factory()->create();
        $data = $this->seedTenantData($organization);
        $this->actingAsAdminOf($organization);

        Invoice::factory()->create([
            'organization_id' => $organization->id,
            'business_id' => $data['business']->id,
            'customer_id' => $data['customer']->id,
        ]);

        $response = $this->getJson('/api/v1/invoices');

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => [['id', 'invoice_number', 'status', 'grand_total_minor']]]);
    }

    public function test_invoice_calculates_totals(): void
    {
        $organization = Organization::factory()->create();
        $data = $this->seedTenantData($organization);
        $this->actingAsAdminOf($organization);

        $payload = [
            'customer_id' => $data['customer']->id,
            'issue_date' => now()->toDateString(),
            'currency' => 'KES',
            'discount_minor' => 1000,
            'items' => [
                [
                    'product_id' => $data['product']->id,
                    'description' => 'Item A',
                    'quantity' => 2,
                    'unit_price_minor' => 10000,
                    'discount_minor' => 500,
                    'tax_rate_percentage' => 16.0,
                ],
                [
                    'product_id' => $data['product']->id,
                    'description' => 'Item B',
                    'quantity' => 1,
                    'unit_price_minor' => 5000,
                    'tax_rate_percentage' => 16.0,
                ],
            ],
        ];

        $response = $this->postJson('/api/v1/invoices', $payload);

        $response->assertStatus(201);

        $this->assertEquals(24500, $response->json('data.subtotal_minor'));
        $this->assertEquals(3920, $response->json('data.tax_total_minor'));
        $this->assertEquals(28420, $response->json('data.grand_total_minor'));
    }

    public function test_tenant_isolation_for_invoices(): void
    {
        $orgA = Organization::factory()->create();
        $orgB = Organization::factory()->create();
        $dataA = $this->seedTenantData($orgA);
        $dataB = $this->seedTenantData($orgB);

        $invoiceB = Invoice::factory()->create([
            'organization_id' => $orgB->id,
            'business_id' => $dataB['business']->id,
            'customer_id' => $dataB['customer']->id,
        ]);

        $this->actingAsAdminOf($orgA);

        $response = $this->getJson("/api/v1/invoices/{$invoiceB->id}");

        $response->assertStatus(404);
    }

    public function test_cannot_create_invoice_in_closed_period(): void
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
            'customer_id' => $data['customer']->id,
            'issue_date' => now()->toDateString(),
            'currency' => 'KES',
            'items' => [
                [
                    'product_id' => $data['product']->id,
                    'description' => 'Test item',
                    'quantity' => 1,
                    'unit_price_minor' => 10000,
                    'tax_rate_percentage' => 16.0,
                ],
            ],
        ];

        $response = $this->postJson('/api/v1/invoices', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['issue_date']);
    }
}
