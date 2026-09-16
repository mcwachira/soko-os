<?php

namespace Database\Factories;

use App\Models\SaleItem;
use App\Models\Product;
use App\Models\Sale;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class SaleItemFactory extends Factory
{
    protected $model = SaleItem::class;

    public function definition(): array
    {
        $quantity = fake()->numberBetween(1, 10);
        $unitPrice = fake()->numberBetween(1000, 50000);
        $discount = fake()->numberBetween(0, 5000);
        $rate = fake()->randomElement([0, 8, 16]);
        $itemTotal = ($quantity * $unitPrice) - $discount;
        $taxAmount = $rate > 0 ? (int) round(($itemTotal * $rate) / (100 + $rate)) : 0;

        return [
            'id' => Str::uuid()->toString(),
            'sale_id' => Sale::factory(),
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
        ];
    }
}