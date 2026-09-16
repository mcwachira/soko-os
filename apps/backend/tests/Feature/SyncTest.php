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
use App\Models\Device;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SyncTest extends TestCase
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
        ]);

        return [
            'organization' => $organization,
            'business' => $business,
            'branch' => $branch,
            'warehouse' => $warehouse,
            'category' => $category,
            'product' => $product,
        ];
    }

    public function test_sync_push_creates_sale_and_returns_server_id(): void
    {
        $organization = Organization::factory()->create();
        $data = $this->seedTenantData($organization);
        $user = $this->actingAsAdminOf($organization);

        $payload = [
            'device_id' => fake()->uuid(),
            'branch_id' => $data['branch']->id,
            'operations' => [
                [
                        'operation_id' => 'local-1',
                        'entity_name' => 'sales',
                        'action' => 'create',
                        'local_id' => 'local-sale-1',
                        'idempotency_key' => 'device-1:sales:local-sale-1:v1',
                        'created_at' => now()->toIso8601String(),
                        'data' => [
                            'receipt_number' => 'REC-SYNC-001',
                            'status' => 'completed',
                            'subtotal_minor' => 10000,
                            'discount_minor' => 0,
                            'tax_total_minor' => 0,
                            'grand_total_minor' => 10000,
                            'paid_total_minor' => 10000,
                            'change_due_minor' => 0,
                            'created_at' => now()->toIso8601String(),
                        'items' => [
                            [
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
                            ],
                        ],
                        'payments' => [
                            [
                                'amount_minor' => 10000,
                                'payment_method' => 'cash',
                                'status' => 'completed',
                            ],
                        ],
                    ],
                ],
            ],
        ];

        $response = $this->postJson('/api/v1/sync/push', $payload);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'cursor', 'accepted', 'rejected', 'conflicts',
            ])
            ->assertJsonCount(1, 'accepted')
            ->assertJsonCount(0, 'rejected')
            ->assertJsonCount(0, 'conflicts');

        $serverId = $response->json('accepted.0.server_id');
        $this->assertDatabaseHas('sales', [
            'id' => $serverId,
            'organization_id' => $organization->id,
            'branch_id' => $data['branch']->id,
        ]);
    }

    public function test_sync_push_is_idempotent(): void
    {
        $organization = Organization::factory()->create();
        $data = $this->seedTenantData($organization);
        $user = $this->actingAsAdminOf($organization);

        $idempotencyKey = 'device-1:sales:local-sale-2:v1';

        $payload = [
            'device_id' => fake()->uuid(),
            'branch_id' => $data['branch']->id,
            'operations' => [
                [
                        'operation_id' => 'local-2',
                        'entity_name' => 'sales',
                        'action' => 'create',
                        'local_id' => 'local-sale-2',
                        'idempotency_key' => $idempotencyKey,
                        'created_at' => now()->toIso8601String(),
                        'data' => [
                            'receipt_number' => 'REC-SYNC-002',
                            'status' => 'completed',
                            'subtotal_minor' => 5000,
                            'discount_minor' => 0,
                            'tax_total_minor' => 0,
                            'grand_total_minor' => 5000,
                            'paid_total_minor' => 5000,
                            'change_due_minor' => 0,
                            'created_at' => now()->toIso8601String(),
                        'items' => [],
                        'payments' => [],
                    ],
                ],
            ],
        ];

        $first = $this->postJson('/api/v1/sync/push', $payload);
        $first->assertStatus(200);
        $firstServerId = $first->json('accepted.0.server_id');

        $second = $this->postJson('/api/v1/sync/push', $payload);
        $second->assertStatus(200);
        $secondServerId = $second->json('accepted.0.server_id');

        $this->assertEquals($firstServerId, $secondServerId, 'Idempotency key should return same server_id');
        $this->assertEquals(1, \App\Models\Sale::where('receipt_number', 'REC-SYNC-002')->count());
    }

    public function test_sync_pull_returns_delta_changes(): void
    {
        $organization = Organization::factory()->create();
        $data = $this->seedTenantData($organization);
        $user = $this->actingAsAdminOf($organization);

        $pullPayload = [
            'device_id' => fake()->uuid(),
            'branch_id' => $data['branch']->id,
            'since_cursor' => '0',
            'limit' => 500,
            'entities' => ['products', 'categories'],
        ];

        $response = $this->postJson('/api/v1/sync/pull', $pullPayload);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'next_cursor', 'has_more', 'changes',
            ])
            ->assertJsonCount(1, 'changes.products')
            ->assertJsonCount(1, 'changes.categories');
    }
}
