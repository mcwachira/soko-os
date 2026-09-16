<?php

namespace Database\Factories;

use App\Models\GoodsReceivedNoteItem;
use App\Models\GoodsReceivedNote;
use App\Models\PurchaseOrderItem;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class GoodsReceivedNoteItemFactory extends Factory
{
    protected $model = GoodsReceivedNoteItem::class;

    public function definition(): array
    {
        $poItem = PurchaseOrderItem::factory()->create();

        return [
            'id' => Str::uuid()->toString(),
            'grn_id' => GoodsReceivedNote::factory(),
            'purchase_order_item_id' => $poItem->id,
            'product_id' => $poItem->product_id,
            'quantity_received' => fake()->numberBetween(1, (int) $poItem->quantity),
            'unit_cost_minor' => $poItem->unit_price_minor,
        ];
    }
}
