<?php

namespace Tests\Feature\Procurement;

use App\Models\ApprovalRule;
use App\Models\ApprovalStep;
use App\Models\Branch;
use App\Models\Business;
use App\Models\GoodsReceivedNote;
use App\Models\GoodsReceivedNoteItem;
use App\Models\InventoryMovement;
use App\Models\Organization;
use App\Models\PaymentVoucher;
use App\Models\Product;
use App\Models\ProductStock;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\PurchaseRequisition;
use App\Models\PurchaseRequisitionLine;
use App\Models\Supplier;
use App\Models\SupplierInvoice;
use App\Models\SupplierPayment;
use App\Models\ThreeWayMatch;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProcurementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        \App\Models\PurchaseOrder::resolveRelationUsing('items', function ($po) {
            return $po->hasMany(\App\Models\PurchaseOrderItem::class);
        });

        \App\Models\GoodsReceivedNote::resolveRelationUsing('items', function ($grn) {
            return $grn->hasMany(\App\Models\GoodsReceivedNoteItem::class, 'grn_id');
        });

        \App\Models\PurchaseRequisition::resolveRelationUsing('warehouse', function ($pr) {
            return $pr->belongsTo(\App\Models\Warehouse::class);
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

    private function seedTenantData(Organization $organization, ?string $userId = null): array
    {
        $business = Business::factory()->create(['organization_id' => $organization->id]);
        $branch = Branch::factory()->create(['organization_id' => $organization->id, 'business_id' => $business->id]);
        $warehouse = Warehouse::factory()->create(['organization_id' => $organization->id, 'business_id' => $business->id, 'branch_id' => $branch->id]);
        $product = Product::factory()->create([
            'organization_id' => $organization->id,
            'business_id' => $business->id,
            'track_inventory' => true,
            'selling_price_minor' => 10000,
            'cost_price_minor' => 6000,
        ]);
        $supplier = Supplier::factory()->create(['organization_id' => $organization->id, 'business_id' => $business->id]);

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
            'product' => $product,
            'supplier' => $supplier,
        ];
    }

    public function test_can_create_purchase_requisition(): void
    {
        $organization = Organization::factory()->create();
        $user = $this->actingAsAdminOf($organization);
        $data = $this->seedTenantData($organization, $user->id);

        $payload = [
            'business_id' => $data['business']->id,
            'branch_id' => $data['branch']->id,
            'warehouse_id' => $data['warehouse']->id,
            'priority' => 'medium',
            'required_date' => now()->addWeek()->toDateString(),
            'reason' => 'Test requisition',
            'budget_minor' => 50000,
            'currency' => 'KES',
            'status' => 'draft',
            'notes' => 'Test notes',
            'lines' => [
                [
                    'product_id' => $data['product']->id,
                    'description' => 'Test product',
                    'quantity' => 10,
                    'estimated_unit_price_minor' => 5000,
                ],
            ],
        ];

        $response = $this->postJson('/api/v1/procurement/requisitions', $payload);

        $response->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'status', 'lines']]);

        $this->assertDatabaseHas('purchase_requisitions', [
            'organization_id' => $organization->id,
            'status' => 'draft',
            'reason' => 'Test requisition',
        ]);
    }

    public function test_can_update_purchase_requisition(): void
    {
        $organization = Organization::factory()->create();
        $user = $this->actingAsAdminOf($organization);
        $data = $this->seedTenantData($organization, $user->id);

        $requisition = PurchaseRequisition::create([
            'organization_id' => $organization->id,
            'business_id' => $data['business']->id,
            'requester_user_id' => $user->id,
        ]);

        $payload = [
            'reason' => 'Updated reason',
            'notes' => 'Updated notes',
        ];

        $response = $this->putJson("/api/v1/procurement/requisitions/{$requisition->id}", $payload);

        $response->assertStatus(200)
            ->assertJsonPath('data.reason', 'Updated reason');

        $this->assertDatabaseHas('purchase_requisitions', [
            'id' => $requisition->id,
            'reason' => 'Updated reason',
        ]);
    }

    public function test_can_list_purchase_requisitions(): void
    {
        $organization = Organization::factory()->create();
        $user = $this->actingAsAdminOf($organization);
        $data = $this->seedTenantData($organization, $user->id);

        PurchaseRequisition::create([
            'organization_id' => $organization->id,
            'business_id' => $data['business']->id,
            'requester_user_id' => $user->id,
        ]);

        $response = $this->getJson('/api/v1/procurement/requisitions');

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => [['id', 'status', 'priority']]]);
    }

    public function test_can_delete_purchase_requisition(): void
    {
        $organization = Organization::factory()->create();
        $user = $this->actingAsAdminOf($organization);
        $data = $this->seedTenantData($organization, $user->id);

        $requisition = PurchaseRequisition::create([
            'organization_id' => $organization->id,
            'business_id' => $data['business']->id,
            'status' => 'draft',
            'requester_user_id' => $user->id,
        ]);

        $response = $this->deleteJson("/api/v1/procurement/requisitions/{$requisition->id}");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Purchase requisition deleted']);

        $this->assertDatabaseMissing('purchase_requisitions', ['id' => $requisition->id]);
    }

    public function test_purchase_requisition_approval_workflow(): void
    {
        $organization = Organization::factory()->create();
        $user = $this->actingAsAdminOf($organization);
        $data = $this->seedTenantData($organization, $user->id);

        $requisition = PurchaseRequisition::create([
            'organization_id' => $organization->id,
            'business_id' => $data['business']->id,
            'status' => 'submitted',
            'requester_user_id' => $user->id,
        ]);

        $response = $this->postJson("/api/v1/procurement/requisitions/{$requisition->id}/approve");

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'approved');

        $this->assertDatabaseHas('purchase_requisitions', [
            'id' => $requisition->id,
            'status' => 'approved',
        ]);
    }

    public function test_tenant_cannot_access_other_tenant_requisition(): void
    {
        $orgA = Organization::factory()->create();
        $orgB = Organization::factory()->create();
        $this->actingAsAdminOf($orgA);
        $this->seedTenantData($orgB);

        $requisitionB = PurchaseRequisition::create([
            'organization_id' => $orgB->id,
            'requester_user_id' => User::factory()->create(['organization_id' => $orgB->id])->id,
        ]);

        $this->actingAsAdminOf($orgA);

        $response = $this->getJson("/api/v1/procurement/requisitions/{$requisitionB->id}");

        $response->assertStatus(404);
    }

    public function test_can_create_purchase_order_from_requisition(): void
    {
        $organization = Organization::factory()->create();
        $user = $this->actingAsAdminOf($organization);
        $data = $this->seedTenantData($organization, $user->id);

        $requisition = PurchaseRequisition::create([
            'organization_id' => $organization->id,
            'business_id' => $data['business']->id,
            'branch_id' => $data['branch']->id,
            'warehouse_id' => $data['warehouse']->id,
            'status' => 'approved',
            'requester_user_id' => $user->id,
        ]);

        $payload = [
            'supplier_id' => $data['supplier']->id,
            'branch_id' => $data['branch']->id,
            'warehouse_id' => $data['warehouse']->id,
            'expected_date' => now()->addWeek()->toDateString(),
            'notes' => 'PO from requisition',
            'items' => [
                [
                    'product_id' => $data['product']->id,
                    'quantity' => 5,
                    'unit_price_minor' => 5000,
                    'tax_rate_percentage' => 16.0,
                ],
            ],
        ];

        $response = $this->postJson('/api/v1/purchase-orders', $payload);

        $response->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'po_number', 'status', 'items']]);

        $poId = $response->json('data.id');

        $requisition->update([
            'status' => 'converted',
            'converted_to_po_ids' => [$poId],
        ]);

        $this->assertDatabaseHas('purchase_orders', [
            'id' => $poId,
            'organization_id' => $organization->id,
            'status' => 'draft',
        ]);
    }

    public function test_grn_creation_updates_po_status_and_inventory(): void
    {
        $organization = Organization::factory()->create();
        $user = $this->actingAsAdminOf($organization);
        $data = $this->seedTenantData($organization, $user->id);

        $po = PurchaseOrder::factory()->create([
            'organization_id' => $organization->id,
            'business_id' => $data['business']->id,
            'branch_id' => $data['branch']->id,
            'warehouse_id' => $data['warehouse']->id,
            'supplier_id' => $data['supplier']->id,
            'user_id' => $user->id,
            'status' => 'approved',
        ]);

        $poItem = PurchaseOrderItem::factory()->create([
            'purchase_order_id' => $po->id,
            'product_id' => $data['product']->id,
            'quantity' => 10,
            'unit_price_minor' => 5000,
            'received_quantity' => 0,
        ]);

        $payload = [
            'purchase_order_id' => $po->id,
            'branch_id' => $data['branch']->id,
            'warehouse_id' => $data['warehouse']->id,
            'notes' => 'Test GRN',
            'items' => [
                [
                    'purchase_order_item_id' => $poItem->id,
                    'quantity_received' => 10,
                    'unit_cost_minor' => 5000,
                ],
            ],
        ];

        $response = $this->postJson('/api/v1/grns', $payload);

        $response->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'grn_number', 'items']]);

        $po->refresh();
        $this->assertContains($po->status, ['approved', 'partial_received', 'completed']);

        $this->assertDatabaseHas('inventory_movements', [
            'product_id' => $data['product']->id,
            'movement_type' => 'purchase_receive',
            'quantity_change' => 10,
        ]);

        $stock = ProductStock::where('product_id', $data['product']->id)
            ->where('warehouse_id', $data['warehouse']->id)
            ->first();
        $this->assertEquals(110, $stock->quantity_on_hand);
    }

    public function test_can_create_supplier_invoice(): void
    {
        $organization = Organization::factory()->create();
        $user = $this->actingAsAdminOf($organization);
        $data = $this->seedTenantData($organization, $user->id);

        $po = PurchaseOrder::factory()->create([
            'organization_id' => $organization->id,
            'business_id' => $data['business']->id,
            'branch_id' => $data['branch']->id,
            'supplier_id' => $data['supplier']->id,
        ]);

        $payload = [
            'supplier_id' => $data['supplier']->id,
            'purchase_order_id' => $po->id,
            'invoice_number' => 'SUP-INV-001',
            'invoice_date' => now()->toDateString(),
            'due_date' => now()->addMonth()->toDateString(),
            'currency' => 'KES',
            'subtotal_minor' => 10000,
            'tax_minor' => 1600,
            'wht_minor' => 0,
            'grand_total_minor' => 11600,
            'status' => 'draft',
            'notes' => 'Test supplier invoice',
        ];

        $response = $this->postJson('/api/v1/procurement/invoices', $payload);

        $response->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'invoice_number', 'status', 'grand_total_minor']]);

        $this->assertDatabaseHas('supplier_invoices', [
            'organization_id' => $organization->id,
            'invoice_number' => 'SUP-INV-001',
            'grand_total_minor' => 11600,
        ]);
    }

    public function test_can_create_three_way_match(): void
    {
        $organization = Organization::factory()->create();
        $user = $this->actingAsAdminOf($organization);
        $data = $this->seedTenantData($organization, $user->id);

        $po = PurchaseOrder::create([
            'organization_id' => $organization->id,
            'business_id' => $data['business']->id,
            'branch_id' => $data['branch']->id,
            'warehouse_id' => $data['warehouse']->id,
            'supplier_id' => $data['supplier']->id,
            'user_id' => $user->id,
            'po_number' => 'PO-' . fake()->unique()->bothify('####'),
            'status' => 'approved',
        ]);

        $grn = GoodsReceivedNote::create([
            'organization_id' => $organization->id,
            'business_id' => $data['business']->id,
            'branch_id' => $data['branch']->id,
            'warehouse_id' => $data['warehouse']->id,
            'purchase_order_id' => $po->id,
            'supplier_id' => $data['supplier']->id,
            'grn_number' => 'GRN-' . fake()->unique()->bothify('####'),
            'received_by_user_id' => $user->id,
        ]);

        $invoice = SupplierInvoice::create([
            'organization_id' => $organization->id,
            'business_id' => $data['business']->id,
            'branch_id' => $data['branch']->id,
            'supplier_id' => $data['supplier']->id,
            'purchase_order_id' => $po->id,
            'invoice_number' => 'SUP-INV-' . fake()->unique()->bothify('####'),
            'invoice_date' => now()->toDateString(),
            'due_date' => now()->addMonth()->toDateString(),
            'currency' => 'KES',
            'subtotal_minor' => 10000,
            'tax_minor' => 1600,
            'wht_minor' => 0,
            'grand_total_minor' => 11600,
            'status' => 'draft',
        ]);

        $payload = [
            'purchase_order_id' => $po->id,
            'grn_id' => $grn->id,
            'supplier_invoice_id' => $invoice->id,
            'status' => 'pending',
            'notes' => 'Test three-way match',
        ];

        $response = $this->postJson('/api/v1/procurement/matches', $payload);

        $response->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'status', 'mismatches']]);

        $this->assertDatabaseHas('three_way_matches', [
            'organization_id' => $organization->id,
            'purchase_order_id' => $po->id,
            'grn_id' => $grn->id,
            'supplier_invoice_id' => $invoice->id,
            'status' => 'pending',
        ]);
    }

    public function test_payment_voucher_with_wht_calculation(): void
    {
        $organization = Organization::factory()->create();
        $user = $this->actingAsAdminOf($organization);
        $data = $this->seedTenantData($organization, $user->id);

        $grossAmount = 100000;
        $whtRate = 5.0;
        $whtAmount = (int) round($grossAmount * $whtRate / 100);
        $otherDeductions = 0;
        $netPayable = $grossAmount - $whtAmount - $otherDeductions;

        $payload = [
            'supplier_id' => $data['supplier']->id,
            'voucher_number' => 'PV-001',
            'currency' => 'KES',
            'gross_amount_minor' => $grossAmount,
            'wht_rate_percentage' => $whtRate,
            'wht_amount_minor' => $whtAmount,
            'other_deductions_minor' => $otherDeductions,
            'net_payable_minor' => $netPayable,
            'status' => 'draft',
            'notes' => 'Test payment voucher',
        ];

        $response = $this->postJson('/api/v1/procurement/payment-vouchers', $payload);

        $response->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'voucher_number', 'gross_amount_minor', 'wht_amount_minor', 'net_payable_minor']]);

        $this->assertDatabaseHas('payment_vouchers', [
            'organization_id' => $organization->id,
            'voucher_number' => 'PV-001',
            'gross_amount_minor' => $grossAmount,
            'wht_rate_percentage' => $whtRate,
            'wht_amount_minor' => $whtAmount,
            'net_payable_minor' => $netPayable,
        ]);
    }

    public function test_can_create_supplier_payment(): void
    {
        $organization = Organization::factory()->create();
        $user = $this->actingAsAdminOf($organization);
        $data = $this->seedTenantData($organization, $user->id);

        $voucher = PaymentVoucher::create([
            'organization_id' => $organization->id,
            'business_id' => $data['business']->id,
            'branch_id' => $data['branch']->id,
            'supplier_id' => $data['supplier']->id,
            'voucher_number' => 'PV-' . fake()->unique()->bothify('####'),
            'currency' => 'KES',
            'gross_amount_minor' => 50000,
            'wht_rate_percentage' => 5.0,
            'wht_amount_minor' => 2500,
            'other_deductions_minor' => 0,
            'net_payable_minor' => 47500,
            'status' => 'draft',
        ]);

        $payload = [
            'payment_voucher_id' => $voucher->id,
            'supplier_id' => $data['supplier']->id,
            'currency' => 'KES',
            'amount_minor' => 50000,
            'payment_method' => 'bank_transfer',
            'reference' => 'TXN-001',
            'status' => 'pending',
            'notes' => 'Test supplier payment',
        ];

        $response = $this->postJson('/api/v1/procurement/payments', $payload);

        $response->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'amount_minor', 'payment_method', 'status']]);

        $this->assertDatabaseHas('supplier_payments', [
            'organization_id' => $organization->id,
            'payment_voucher_id' => $voucher->id,
            'amount_minor' => 50000,
            'payment_method' => 'bank_transfer',
        ]);
    }

    public function test_full_procurement_lifecycle(): void
    {
        $organization = Organization::factory()->create();
        $user = $this->actingAsAdminOf($organization);
        $data = $this->seedTenantData($organization, $user->id);

        // Step 1: Create Purchase Requisition
        $reqPayload = [
            'business_id' => $data['business']->id,
            'branch_id' => $data['branch']->id,
            'warehouse_id' => $data['warehouse']->id,
            'priority' => 'high',
            'required_date' => now()->addWeek()->toDateString(),
            'reason' => 'Office supplies',
            'budget_minor' => 100000,
            'currency' => 'KES',
            'status' => 'submitted',
        ];
        $reqResponse = $this->postJson('/api/v1/procurement/requisitions', $reqPayload);
        $reqResponse->assertStatus(201);
        $requisitionId = $reqResponse->json('data.id');

        // Step 2: Approve Requisition
        $approveResponse = $this->postJson("/api/v1/procurement/requisitions/{$requisitionId}/approve");
        $approveResponse->assertStatus(200);
        $this->assertEquals('approved', $approveResponse->json('data.status'));

        // Step 3: Create Purchase Order
        $poPayload = [
            'supplier_id' => $data['supplier']->id,
            'branch_id' => $data['branch']->id,
            'warehouse_id' => $data['warehouse']->id,
            'expected_date' => now()->addWeek()->toDateString(),
            'notes' => 'PO for office supplies',
            'items' => [
                [
                    'product_id' => $data['product']->id,
                    'quantity' => 5,
                    'unit_price_minor' => 10000,
                    'tax_rate_percentage' => 16.0,
                ],
            ],
        ];
        $poResponse = $this->postJson('/api/v1/purchase-orders', $poPayload);
        $poResponse->assertStatus(201);
        $poId = $poResponse->json('data.id');

        // Step 4: Approve PO
        $poApproveResponse = $this->postJson("/api/v1/purchase-orders/{$poId}/approve");
        $poApproveResponse->assertStatus(200);

        // Step 5: Create GRN
        $poItem = PurchaseOrderItem::where('purchase_order_id', $poId)->first();
        $grnPayload = [
            'purchase_order_id' => $poId,
            'branch_id' => $data['branch']->id,
            'warehouse_id' => $data['warehouse']->id,
            'notes' => 'Received goods',
            'items' => [
                [
                    'purchase_order_item_id' => $poItem->id,
                    'quantity_received' => 5,
                    'unit_cost_minor' => 10000,
                ],
            ],
        ];
        $grnResponse = $this->postJson('/api/v1/grns', $grnPayload);
        $grnResponse->assertStatus(201);
        $grnId = $grnResponse->json('data.id');

        // Step 6: Create Supplier Invoice
        $invPayload = [
            'supplier_id' => $data['supplier']->id,
            'purchase_order_id' => $poId,
            'invoice_number' => 'SUP-INV-001',
            'invoice_date' => now()->toDateString(),
            'due_date' => now()->addMonth()->toDateString(),
            'currency' => 'KES',
            'subtotal_minor' => 50000,
            'tax_minor' => 8000,
            'wht_minor' => 0,
            'grand_total_minor' => 58000,
            'status' => 'draft',
        ];
        $invResponse = $this->postJson('/api/v1/procurement/invoices', $invPayload);
        $invResponse->assertStatus(201);
        $invoiceId = $invResponse->json('data.id');

        // Step 7: Create Three-Way Match
        $matchPayload = [
            'purchase_order_id' => $poId,
            'grn_id' => $grnId,
            'supplier_invoice_id' => $invoiceId,
            'status' => 'matched',
            'notes' => 'All matched',
        ];
        $matchResponse = $this->postJson('/api/v1/procurement/matches', $matchPayload);
        $matchResponse->assertStatus(201);
        $this->assertEquals('matched', $matchResponse->json('data.status'));

        // Step 8: Create Payment Voucher
        $pvPayload = [
            'supplier_id' => $data['supplier']->id,
            'voucher_number' => 'PV-001',
            'currency' => 'KES',
            'gross_amount_minor' => 58000,
            'wht_rate_percentage' => 5.0,
            'wht_amount_minor' => 2900,
            'other_deductions_minor' => 0,
            'net_payable_minor' => 55100,
            'status' => 'draft',
            'notes' => 'Payment for SUP-INV-001',
        ];
        $pvResponse = $this->postJson('/api/v1/procurement/payment-vouchers', $pvPayload);
        $pvResponse->assertStatus(201);
        $voucherId = $pvResponse->json('data.id');

        // Step 9: Create Supplier Payment
        $payPayload = [
            'payment_voucher_id' => $voucherId,
            'supplier_id' => $data['supplier']->id,
            'currency' => 'KES',
            'amount_minor' => 55100,
            'payment_method' => 'bank_transfer',
            'reference' => 'TXN-001',
            'status' => 'completed',
            'paid_at' => now()->toDateTimeString(),
        ];
        $payResponse = $this->postJson('/api/v1/procurement/payments', $payPayload);
        $payResponse->assertStatus(201);

        $this->assertDatabaseHas('supplier_payments', [
            'organization_id' => $organization->id,
            'payment_voucher_id' => $voucherId,
            'amount_minor' => 55100,
            'status' => 'completed',
        ]);
    }
}
