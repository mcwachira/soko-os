<?php

namespace Database\Factories;

use App\Models\GoodsReceivedNote;
use App\Models\PurchaseOrder;
use App\Models\Supplier;
use App\Models\Business;
use App\Models\Organization;
use App\Models\Branch;
use App\Models\Warehouse;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class GoodsReceivedNoteFactory extends Factory
{
    protected $model = GoodsReceivedNote::class;

    public function definition(): array
    {
        $purchaseOrder = PurchaseOrder::factory()->create();

        return [
            'id' => Str::uuid()->toString(),
            'organization_id' => $purchaseOrder->organization_id,
            'business_id' => $purchaseOrder->business_id,
            'branch_id' => $purchaseOrder->branch_id,
            'warehouse_id' => $purchaseOrder->warehouse_id,
            'purchase_order_id' => $purchaseOrder->id,
            'supplier_id' => $purchaseOrder->supplier_id,
            'grn_number' => 'GRN-' . strtoupper(fake()->unique()->bothify('####-????')),
            'received_by_user_id' => User::factory(),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
