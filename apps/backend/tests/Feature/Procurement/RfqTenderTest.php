<?php

namespace Tests\Feature\Procurement;

use App\Models\Branch;
use App\Models\Business;
use App\Models\Organization;
use App\Models\Product;
use App\Models\Rfq;
use App\Models\RfqLine;
use App\Models\RfqResponse;
use App\Models\RfqResponseLine;
use App\Models\RfqSupplier;
use App\Models\Supplier;
use App\Models\Tender;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RfqTenderTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        \App\Models\Rfq::resolveRelationUsing('warehouse', function ($rfq) {
            return $rfq->belongsTo(\App\Models\Warehouse::class);
        });
    }

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
        $product = Product::factory()->create(['organization_id' => $organization->id, 'business_id' => $business->id]);
        $supplier = Supplier::factory()->create(['organization_id' => $organization->id, 'business_id' => $business->id]);

        return [
            'organization' => $organization,
            'business' => $business,
            'branch' => $branch,
            'warehouse' => $warehouse,
            'product' => $product,
            'supplier' => $supplier,
        ];
    }

    // RFQ Tests

    public function test_can_create_rfq(): void
    {
        $organization = Organization::factory()->create();
        $user = $this->actingAsAdminOf($organization);
        $data = $this->seedTenantData($organization);

        $payload = [
            'business_id' => $data['business']->id,
            'branch_id' => $data['branch']->id,
            'warehouse_id' => $data['warehouse']->id,
            'rfq_number' => 'RFQ-001',
            'title' => 'Office Supplies RFQ',
            'description' => 'Request for office supplies',
            'status' => 'draft',
            'submission_deadline' => now()->addWeek()->toDateTimeString(),
            'delivery_required_date' => now()->addWeeks(2)->toDateString(),
            'commercial_terms' => 'Net 30',
            'payment_terms' => 'Net 30',
            'tax_requirements' => 'VAT included',
            'evaluation_criteria' => ['price' => 40, 'quality' => 60],
            'custom_fields' => ['department' => 'IT'],
            'notes' => 'Urgent requirement',
            'lines' => [
                [
                    'product_id' => $data['product']->id,
                    'description' => 'Printer Paper',
                    'quantity' => 100,
                    'estimated_unit_price_minor' => 500,
                ],
            ],
        ];

        $response = $this->postJson('/api/v1/procurement/rfqs', $payload);

        $response->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'rfq_number', 'title', 'status', 'lines']]);

        $this->assertDatabaseHas('rfqs', [
            'organization_id' => $organization->id,
            'rfq_number' => 'RFQ-001',
            'title' => 'Office Supplies RFQ',
            'status' => 'draft',
        ]);
    }

    public function test_can_update_rfq(): void
    {
        $organization = Organization::factory()->create();
        $user = $this->actingAsAdminOf($organization);
        $data = $this->seedTenantData($organization);

        $rfq = Rfq::create([
            'organization_id' => $organization->id,
            'business_id' => $data['business']->id,
            'rfq_number' => 'RFQ-' . fake()->unique()->bothify('####'),
            'title' => fake()->sentence(),
            'created_by_user_id' => $user->id,
        ]);

        $payload = [
            'title' => 'Updated RFQ Title',
            'notes' => 'Updated notes',
        ];

        $response = $this->putJson("/api/v1/procurement/rfqs/{$rfq->id}", $payload);

        $response->assertStatus(200)
            ->assertJsonPath('data.title', 'Updated RFQ Title');

        $this->assertDatabaseHas('rfqs', [
            'id' => $rfq->id,
            'title' => 'Updated RFQ Title',
        ]);
    }

    public function test_can_list_rfqs(): void
    {
        $organization = Organization::factory()->create();
        $user = $this->actingAsAdminOf($organization);
        $data = $this->seedTenantData($organization);

        Rfq::create([
            'organization_id' => $organization->id,
            'business_id' => $data['business']->id,
            'rfq_number' => 'RFQ-' . fake()->unique()->bothify('####'),
            'title' => fake()->sentence(),
            'created_by_user_id' => $user->id,
        ]);

        $response = $this->getJson('/api/v1/procurement/rfqs');

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => [['id', 'rfq_number', 'status']]]);
    }

    public function test_can_delete_rfq(): void
    {
        $organization = Organization::factory()->create();
        $user = $this->actingAsAdminOf($organization);
        $data = $this->seedTenantData($organization);

        $rfq = Rfq::create([
            'organization_id' => $organization->id,
            'business_id' => $data['business']->id,
            'rfq_number' => 'RFQ-' . fake()->unique()->bothify('####'),
            'title' => fake()->sentence(),
            'created_by_user_id' => $user->id,
            'status' => 'draft',
        ]);

        $response = $this->deleteJson("/api/v1/procurement/rfqs/{$rfq->id}");

        $response->assertStatus(200)
            ->assertJson(['message' => 'RFQ deleted']);

        $this->assertDatabaseMissing('rfqs', ['id' => $rfq->id]);
    }

    public function test_can_publish_rfq(): void
    {
        $organization = Organization::factory()->create();
        $user = $this->actingAsAdminOf($organization);
        $data = $this->seedTenantData($organization);

        $rfq = Rfq::create([
            'organization_id' => $organization->id,
            'business_id' => $data['business']->id,
            'rfq_number' => 'RFQ-' . fake()->unique()->bothify('####'),
            'title' => fake()->sentence(),
            'created_by_user_id' => $user->id,
            'status' => 'draft',
        ]);

        $response = $this->postJson("/api/v1/procurement/rfqs/{$rfq->id}/publish");

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'published')
            ->assertJsonPath('data.published_at', function ($value) {
                return !is_null($value);
            });
    }

    public function test_can_close_rfq(): void
    {
        $organization = Organization::factory()->create();
        $user = $this->actingAsAdminOf($organization);
        $data = $this->seedTenantData($organization);

        $rfq = Rfq::create([
            'organization_id' => $organization->id,
            'business_id' => $data['business']->id,
            'rfq_number' => 'RFQ-' . fake()->unique()->bothify('####'),
            'title' => fake()->sentence(),
            'created_by_user_id' => $user->id,
            'status' => 'published',
        ]);

        $response = $this->postJson("/api/v1/procurement/rfqs/{$rfq->id}/close");

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'closed')
            ->assertJsonPath('data.closed_at', function ($value) {
                return !is_null($value);
            });
    }

    public function test_tenant_cannot_access_other_tenant_rfq(): void
    {
        $orgA = Organization::factory()->create();
        $orgB = Organization::factory()->create();
        $this->actingAsAdminOf($orgA);
        $this->seedTenantData($orgB);

        $rfqB = Rfq::create([
            'organization_id' => $orgB->id,
            'rfq_number' => 'RFQ-' . fake()->unique()->bothify('####'),
            'title' => fake()->sentence(),
            'created_by_user_id' => User::factory()->create(['organization_id' => $orgB->id])->id,
        ]);

        $this->actingAsAdminOf($orgA);

        $response = $this->getJson("/api/v1/procurement/rfqs/{$rfqB->id}");

        $response->assertStatus(404);
    }

    // Tender Tests

    public function test_can_create_tender(): void
    {
        $organization = Organization::factory()->create();
        $this->actingAsAdminOf($organization);
        $data = $this->seedTenantData($organization);

        $payload = [
            'business_id' => $data['business']->id,
            'branch_id' => $data['branch']->id,
            'tender_number' => 'TEN-001',
            'title' => 'IT Equipment Tender',
            'description' => 'Supply of IT equipment',
            'status' => 'draft',
            'submission_deadline' => now()->addWeeks(2)->toDateTimeString(),
            'opening_date' => now()->addWeeks(3)->toDateTimeString(),
            'evaluation_criteria' => ['price' => 50, 'technical' => 50],
            'notes' => 'Open tender',
        ];

        $response = $this->postJson('/api/v1/procurement/tenders', $payload);

        $response->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'tender_number', 'title', 'status']]);

        $this->assertDatabaseHas('tenders', [
            'organization_id' => $organization->id,
            'tender_number' => 'TEN-001',
            'title' => 'IT Equipment Tender',
        ]);
    }

    public function test_can_update_tender(): void
    {
        $organization = Organization::factory()->create();
        $user = $this->actingAsAdminOf($organization);
        $data = $this->seedTenantData($organization);

        $tender = Tender::create([
            'organization_id' => $organization->id,
            'business_id' => $data['business']->id,
            'tender_number' => 'TEN-' . fake()->unique()->bothify('####'),
            'title' => fake()->sentence(),
            'created_by_user_id' => $user->id,
        ]);

        $payload = [
            'title' => 'Updated Tender Title',
            'notes' => 'Updated notes',
        ];

        $response = $this->putJson("/api/v1/procurement/tenders/{$tender->id}", $payload);

        $response->assertStatus(200)
            ->assertJsonPath('data.title', 'Updated Tender Title');
    }

    public function test_can_list_tenders(): void
    {
        $organization = Organization::factory()->create();
        $user = $this->actingAsAdminOf($organization);
        $data = $this->seedTenantData($organization);

        Tender::create([
            'organization_id' => $organization->id,
            'business_id' => $data['business']->id,
            'tender_number' => 'TEN-' . fake()->unique()->bothify('####'),
            'title' => fake()->sentence(),
            'created_by_user_id' => $user->id,
        ]);

        $response = $this->getJson('/api/v1/procurement/tenders');

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => [['id', 'tender_number', 'status']]]);
    }

    public function test_can_delete_tender(): void
    {
        $organization = Organization::factory()->create();
        $user = $this->actingAsAdminOf($organization);
        $data = $this->seedTenantData($organization);

        $tender = Tender::create([
            'organization_id' => $organization->id,
            'business_id' => $data['business']->id,
            'tender_number' => 'TEN-' . fake()->unique()->bothify('####'),
            'title' => fake()->sentence(),
            'created_by_user_id' => $user->id,
            'status' => 'draft',
        ]);

        $response = $this->deleteJson("/api/v1/procurement/tenders/{$tender->id}");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Tender deleted']);

        $this->assertDatabaseMissing('tenders', ['id' => $tender->id]);
    }

    public function test_supplier_can_respond_to_rfq(): void
    {
        $organization = Organization::factory()->create();
        $user = $this->actingAsAdminOf($organization);
        $data = $this->seedTenantData($organization);

        $rfq = Rfq::create([
            'organization_id' => $organization->id,
            'business_id' => $data['business']->id,
            'branch_id' => $data['branch']->id,
            'warehouse_id' => $data['warehouse']->id,
            'rfq_number' => 'RFQ-' . fake()->unique()->bothify('####'),
            'title' => fake()->sentence(),
            'status' => 'published',
            'created_by_user_id' => $user->id,
        ]);

        RfqLine::create([
            'organization_id' => $organization->id,
            'rfq_id' => $rfq->id,
            'product_id' => $data['product']->id,
            'quantity' => 100,
        ]);

        RfqSupplier::create([
            'id' => \Illuminate\Support\Str::uuid()->toString(),
            'organization_id' => $organization->id,
            'rfq_id' => $rfq->id,
            'supplier_id' => $data['supplier']->id,
            'invited_at' => now(),
            'responded_at' => null,
        ]);

        $response = RfqResponse::create([
            'id' => \Illuminate\Support\Str::uuid()->toString(),
            'organization_id' => $organization->id,
            'rfq_id' => $rfq->id,
            'supplier_id' => $data['supplier']->id,
            'status' => 'submitted',
            'is_final' => true,
        ]);

        $rfqLine = RfqLine::where('rfq_id', $rfq->id)->first();

        RfqResponseLine::create([
            'id' => \Illuminate\Support\Str::uuid()->toString(),
            'organization_id' => $organization->id,
            'rfq_response_id' => $response->id,
            'rfq_line_id' => $rfqLine->id,
            'unit_price_minor' => 450,
            'notes' => 'Best price',
        ]);

        $this->assertDatabaseHas('rfq_responses', [
            'id' => $response->id,
            'rfq_id' => $rfq->id,
            'supplier_id' => $data['supplier']->id,
            'status' => 'submitted',
        ]);

        $this->assertDatabaseHas('rfq_response_lines', [
            'rfq_response_id' => $response->id,
            'rfq_line_id' => $rfqLine->id,
            'unit_price_minor' => 450,
        ]);
    }
}
