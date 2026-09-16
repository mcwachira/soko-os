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
use App\Models\CashShift;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Payment;
use App\Models\ReturnModel;
use App\Models\Refund;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ReturnsRefundsTest extends TestCase
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

    public function test_can_create_return_and_refund_restores_inventory(): void
    {
        $organization = Organization::factory()->create();
        $data = $this->seedTenantData($organization);
        $user = $this->actingAsAdminOf($organization);

        $sale = Sale::create([
            'id' => fake()->uuid(),
            'organization_id' => $organization->id,
            'business_id' => $data['business']->id,
            'branch_id' => $data['branch']->id,
            'cashier_user_id' => $user->id,
            'receipt_number' => 'REC-RET-001',
            'status' => 'completed',
            'subtotal_minor' => 10000,
            'discount_minor' => 0,
            'tax_total_minor' => 0,
            'grand_total_minor' => 10000,
            'paid_total_minor' => 10000,
            'change_due_minor' => 0,
        ]);

        $saleItem = SaleItem::create([
            'id' => fake()->uuid(),
            'organization_id' => $organization->id,
            'sale_id' => $sale->id,
            'product_id' => $data['product']->id,
            'sku' => $data['product']->sku,
            'name' => $data['product']->name,
            'quantity' => 1,
            'unit_price_minor' => 10000,
            'discount_minor' => 0,
            'tax_rate_percentage' => 0,
            'tax_amount_minor' => 0,
            'subtotal_minor' => 10000,
            'total_minor' => 10000,
        ]);

        Payment::create([
            'id' => fake()->uuid(),
            'organization_id' => $organization->id,
            'sale_id' => $sale->id,
            'amount_minor' => 10000,
            'currency' => 'KES',
            'payment_method' => 'cash',
            'status' => 'completed',
            'reference' => 'CASH-001',
        ]);

        $returnPayload = [
            'sale_id' => $sale->id,
            'return_type' => 'refund',
            'items' => [
                [
                    'sale_item_id' => $saleItem->id,
                    'quantity' => 1,
                    'discount_minor' => 0,
                    'tax_rate_percentage' => 0,
                    'return_reason' => 'changed_mind',
                    'condition' => 'good',
                ],
            ],
            'reason' => 'Return test',
        ];

        $returnResponse = $this->postJson('/api/v1/returns', $returnPayload);
        $returnResponse->assertStatus(201);

        $returnId = $returnResponse->json('data.id');

        $this->assertDatabaseHas('returns', [
            'id' => $returnId,
            'organization_id' => $organization->id,
            'sale_id' => $sale->id,
            'status' => 'pending',
            'grand_total_minor' => 10000,
        ]);

        $this->assertDatabaseHas('inventory_movements', [
            'product_id' => $data['product']->id,
            'movement_type' => 'return',
            'quantity_change' => 1,
        ]);

        $updateResponse = $this->putJson("/api/v1/returns/{$returnId}", ['status' => 'approved']);
        $updateResponse->assertStatus(200);
        $this->assertDatabaseHas('returns', [
            'id' => $returnId,
            'status' => 'approved',
        ]);

        $completeResponse = $this->putJson("/api/v1/returns/{$returnId}", ['status' => 'completed']);
        $completeResponse->assertStatus(200);

        $this->assertDatabaseHas('returns', [
            'id' => $returnId,
            'status' => 'completed',
        ]);

        $this->assertDatabaseHas('refunds', [
            'return_id' => $returnId,
            'sale_id' => $sale->id,
            'amount_minor' => 10000,
            'status' => 'completed',
        ]);
    }

    public function test_return_quantity_cannot_exceed_sale_quantity(): void
    {
        $organization = Organization::factory()->create();
        $data = $this->seedTenantData($organization);
        $user = $this->actingAsAdminOf($organization);

        $sale = Sale::create([
            'id' => fake()->uuid(),
            'organization_id' => $organization->id,
            'business_id' => $data['business']->id,
            'branch_id' => $data['branch']->id,
            'cashier_user_id' => $user->id,
            'receipt_number' => 'REC-RET-002',
            'status' => 'completed',
            'subtotal_minor' => 10000,
            'discount_minor' => 0,
            'tax_total_minor' => 0,
            'grand_total_minor' => 10000,
            'paid_total_minor' => 10000,
            'change_due_minor' => 0,
        ]);

        $saleItem = SaleItem::create([
            'id' => fake()->uuid(),
            'organization_id' => $organization->id,
            'sale_id' => $sale->id,
            'product_id' => $data['product']->id,
            'sku' => $data['product']->sku,
            'name' => $data['product']->name,
            'quantity' => 1,
            'unit_price_minor' => 10000,
            'discount_minor' => 0,
            'tax_rate_percentage' => 0,
            'tax_amount_minor' => 0,
            'subtotal_minor' => 10000,
            'total_minor' => 10000,
        ]);

        $returnPayload = [
            'sale_id' => $sale->id,
            'return_type' => 'refund',
            'items' => [
                [
                    'sale_item_id' => $saleItem->id,
                    'quantity' => 5,
                    'discount_minor' => 0,
                    'tax_rate_percentage' => 0,
                ],
            ],
        ];

        $this->postJson('/api/v1/returns', $returnPayload)
            ->assertStatus(422);
    }

    public function test_tenant_cannot_access_other_tenant_return(): void
    {
        $orgA = Organization::factory()->create();
        $orgB = Organization::factory()->create();
        $dataA = $this->seedTenantData($orgA);
        $dataB = $this->seedTenantData($orgB);

        $userA = $this->actingAsAdminOf($orgA);

        $saleB = Sale::factory()->create([
            'organization_id' => $orgB->id,
            'business_id' => $dataB['business']->id,
            'branch_id' => $dataB['branch']->id,
        ]);

        $returnB = ReturnModel::factory()->create([
            'organization_id' => $orgB->id,
            'sale_id' => $saleB->id,
        ]);

        $this->getJson("/api/v1/returns/{$returnB->id}")
            ->assertStatus(404);
    }
}
