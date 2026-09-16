<?php

namespace Database\Factories;

use App\Models\RefundItem;
use App\Models\Refund;
use App\Models\ReturnItem;
use App\Models\SaleItem;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class RefundItemFactory extends Factory
{
    protected $model = RefundItem::class;

    public function definition(): array
    {
        $quantity = fake()->numberBetween(1, 5);
        $unitPrice = fake()->numberBetween(1000, 50000);
        $taxAmount = fake()->numberBetween(0, 10000);
        $total = ($quantity * $unitPrice) + $taxAmount;

        return [
            'id' => Str::uuid()->toString(),
            'refund_id' => Refund::factory(),
            'return_item_id' => ReturnItem::factory(),
            'sale_item_id' => SaleItem::factory(),
            'quantity' => $quantity,
            'unit_price_minor' => $unitPrice,
            'tax_amount_minor' => $taxAmount,
            'total_minor' => $total,
        ];
    }
}