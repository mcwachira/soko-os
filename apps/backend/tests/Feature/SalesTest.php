<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Business;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Organization;
use App\Models\Product;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SalesTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsAdminOf(Organization $organization): User
    {
        $user = User::factory()->create([
            'organization_id' => $organization->id,
            'business_id' => $organization->businesses()->first()->id ?? Business::factory()->create(['organization_id' => $organization->id])->id,
            'role' => 'admin',
            'permissions' => ['*'],
        ]);
        Sanctum::actingAs($user);
        return $user;
    }

    private function seedTenantData(Organization $organization, ?string $userId = null): array
    {
        $business = Business::factory()->create(['organization_id' => $organization->id]);
        $branch = Branch::factory()->create(['organization_id' => $organization->id, 'business_id' => $business->id]);
        $warehouse = Warehouse::factory()->create(['organization_id' => $organization->id, 'business_id' => $business->id, 'branch_id' => $branch->id]);
        $category = Category::factory()->create(['organization_id' => $organization->id, 'business_id' => $business->id]);
        $product = Product::factory()->create([
            'organization_id' => $organization->id,
            'business_id' => $business->id,
            'category_id' => $category->id,
            'selling_price_minor' => 10000,
            'cost_price_minor' => 6000,
            'tax_category_code' => 'B',
        ]);
        $customer = Customer::factory()->create(['organization_id' => $organization->id, 'business_id' => $business->id]);

        \App\Models\InventoryMovement::create([
            'id' => \Illuminate\Support\Str::uuid()->toString(),
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
            'created_by_user_id' => $userId,
        ]);

        \App\Models\ProductStock::updateOrCreate(
            [
                'organization_id' => $organization->id,
                'product_id' => $product->id,
                'warehouse_id' => $warehouse->id,
            ],
            [
                'id' => \Illuminate\Support\Str::uuid()->toString(),
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
        ];
    }

    public function test_can_create_sale_with_items_and_payments(): void
    {
        $organization = Organization::factory()->create();
        $user = $this->actingAsAdminOf($organization);
        $data = $this->seedTenantData($organization, $user->id);

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

        $response = $this->postJson('/api/v1/sales', $payload);

        $response->assertStatus(201)
            ->assertJsonStructure(['data' => [
                'id', 'receipt_number', 'subtotal_minor', 'tax_total_minor',
                'grand_total_minor', 'paid_total_minor', 'items', 'payments',
            ]]);

        $this->assertDatabaseHas('sales', [
            'organization_id' => $organization->id,
            'branch_id' => $data['branch']->id,
            'customer_id' => $data['customer']->id,
            'grand_total_minor' => 20000,
            'paid_total_minor' => 20000,
        ]);

        $this->assertDatabaseHas('sale_items', [
            'product_id' => $data['product']->id,
            'quantity' => 2,
            'unit_price_minor' => 10000,
        ]);

        $this->assertDatabaseHas('payments', [
            'sale_id' => $response->json('data.id'),
            'organization_id' => $organization->id,
            'amount_minor' => 20000,
            'payment_method' => 'cash',
        ]);

        $this->assertDatabaseHas('inventory_movements', [
            'product_id' => $data['product']->id,
            'movement_type' => 'sale',
            'quantity_change' => -2,
        ]);
    }

    public function test_tenant_cannot_access_other_tenant_sale(): void
    {
        $orgA = Organization::factory()->create();
        $orgB = Organization::factory()->create();
        $userA = $this->actingAsAdminOf($orgA);
        $dataA = $this->seedTenantData($orgA, $userA->id);
        $dataB = $this->seedTenantData($orgB, $userA->id);

        $userA = $this->actingAsAdminOf($orgA);

        $saleB = \App\Models\Sale::factory()->create([
            'organization_id' => $orgB->id,
            'business_id' => $dataB['business']->id,
            'branch_id' => $dataB['branch']->id,
            'receipt_number' => 'REC-B-001',
        ]);

        $response = $this->getJson("/api/v1/sales/{$saleB->id}");

        $response->assertStatus(404);
    }

    public function test_sale_creation_requires_valid_branch(): void
    {
        $organization = Organization::factory()->create();
        $this->actingAsAdminOf($organization);

        $payload = [
            'branch_id' => fake()->uuid(),
            'items' => [
                [
                    'product_id' => fake()->uuid(),
                    'sku' => 'SKU-1',
                    'name' => 'Test',
                    'quantity' => 1,
                    'unit_price_minor' => 1000,
                ],
            ],
            'payments' => [
                ['amount_minor' => 1000, 'payment_method' => 'cash'],
            ],
        ];

        $this->postJson('/api/v1/sales', $payload)
            ->assertStatus(422)
            ->assertJson([
                'message' => 'The selected branch does not belong to your organization. (and 1 more error)',
            ]);
    }

    public function test_sale_rejects_payment_mismatch(): void
    {
        $organization = Organization::factory()->create();
        $user = $this->actingAsAdminOf($organization);
        $data = $this->seedTenantData($organization, $user->id);

        $payload = [
            'branch_id' => $data['branch']->id,
            'items' => [
                [
                    'product_id' => $data['product']->id,
                    'sku' => $data['product']->sku,
                    'name' => $data['product']->name,
                    'quantity' => 1,
                    'unit_price_minor' => 10000,
                    'tax_rate_percentage' => 16.0,
                ],
            ],
            'payments' => [
                ['amount_minor' => 5000, 'payment_method' => 'cash'],
            ],
        ];

        $this->postJson('/api/v1/sales', $payload)
            ->assertStatus(422)
            ->assertJsonFragment(['message' => 'Payment total does not match grand total.'])
            ->assertJsonFragment(['grand_total_minor' => 10000])
            ->assertJsonFragment(['paid_total_minor' => 5000]);
    }

    public function test_sale_rejects_inactive_product(): void
    {
        $organization = Organization::factory()->create();
        $user = $this->actingAsAdminOf($organization);
        $data = $this->seedTenantData($organization, $user->id);

        $data['product']->update(['is_active' => false]);

        $payload = [
            'branch_id' => $data['branch']->id,
            'items' => [
                [
                    'product_id' => $data['product']->id,
                    'sku' => $data['product']->sku,
                    'name' => $data['product']->name,
                    'quantity' => 1,
                    'unit_price_minor' => 10000,
                    'tax_rate_percentage' => 16.0,
                ],
            ],
            'payments' => [
                ['amount_minor' => 10000, 'payment_method' => 'cash'],
            ],
        ];

        $this->postJson('/api/v1/sales', $payload)
            ->assertStatus(422)
            ->assertJsonFragment(['message' => "Product '{$data['product']->name}' is inactive and cannot be sold."]);
    }

    public function test_sale_rejects_insufficient_stock(): void
    {
        $organization = Organization::factory()->create();
        $user = $this->actingAsAdminOf($organization);
        $data = $this->seedTenantData($organization, $user->id);

        $payload = [
            'branch_id' => $data['branch']->id,
            'items' => [
                [
                    'product_id' => $data['product']->id,
                    'sku' => $data['product']->sku,
                    'name' => $data['product']->name,
                    'quantity' => 999,
                    'unit_price_minor' => 10000,
                    'tax_rate_percentage' => 16.0,
                ],
            ],
            'payments' => [
                ['amount_minor' => 100000, 'payment_method' => 'cash'],
            ],
        ];

        $this->postJson('/api/v1/sales', $payload)
            ->assertStatus(422)
            ->assertJsonFragment(['message' => "Insufficient stock for '{$data['product']->name}'. Available: 100, requested: 999."]);
    }

    public function test_sale_is_idempotent_with_same_key(): void
    {
        $organization = Organization::factory()->create();
        $user = $this->actingAsAdminOf($organization);
        $data = $this->seedTenantData($organization, $user->id);

        $idempotencyKey = 'test-sale-' . uniqid();

        $payload = [
            'idempotency_key' => $idempotencyKey,
            'branch_id' => $data['branch']->id,
            'items' => [
                [
                    'product_id' => $data['product']->id,
                    'sku' => $data['product']->sku,
                    'name' => $data['product']->name,
                    'quantity' => 1,
                    'unit_price_minor' => 10000,
                    'tax_rate_percentage' => 16.0,
                ],
            ],
            'payments' => [
                ['amount_minor' => 10000, 'payment_method' => 'cash'],
            ],
        ];

        $response1 = $this->postJson('/api/v1/sales', $payload);
        $response1->assertStatus(201);

        $response2 = $this->postJson('/api/v1/sales', $payload);
        $response2->assertStatus(200)
            ->assertJsonFragment(['idempotent' => true])
            ->assertJsonFragment(['id' => $response1->json('data.id')]);

        $this->assertDatabaseCount('sales', 1);
    }
}
