<?php

namespace Database\Factories;

use App\Models\ReturnItem;
use App\Models\ReturnModel;
use App\Models\SaleItem;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ReturnItemFactory extends Factory
{
    protected $model = ReturnItem::class;

    public function definition(): array
    {
        $quantity = fake()->numberBetween(1, 5);
        $unitPrice = fake()->numberBetween(1000, 50000);
        $discount = fake()->numberBetween(0, 5000);
        $rate = fake()->randomElement([0, 8, 16]);
        $itemTotal = ($quantity * $unitPrice) - $discount;
        $taxAmount = $rate > 0 ? (int) round(($itemTotal * $rate) / (100 + $rate)) : 0;

        return [
            'id' => Str::uuid()->toString(),
            'return_id' => ReturnModel::factory(),
            'sale_item_id' => SaleItem::factory(),
            'product_id' => Product::factory(),
            'sku' => fake()->bothify('SKU-####'),
            'name' => fake()->words(3, true),
            'quantity' => $quantity,
            'unit_price_minor' => $unitPrice,
            'discount_minor' => $discount,
            'tax_rate_percentage' => $rate,
            'tax_amount_minor' => $taxAmount,
            'subtotal_minor' => $itemTotal - $taxAmount,
            'total_minor' => $itemTotal,
            'return_reason' => fake()->randomElement(['defective', 'wrong_item', 'changed_mind', 'damaged', 'expired', 'other']),
            'condition' => fake()->randomElement(['good', 'damaged', 'expired']),
        ];
    }
}