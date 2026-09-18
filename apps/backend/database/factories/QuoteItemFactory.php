<?php

namespace Database\Factories;

use App\Models\Quote;
use App\Models\QuoteItem;
use Illuminate\Database\Eloquent\Factories\Factory;

class QuoteItemFactory extends Factory
{
    protected $model = QuoteItem::class;

    public function definition(): array
    {
        return [
            'id' => \Illuminate\Support\Str::uuid()->toString(),
            'quote_id' => Quote::factory(),
            'product_id' => null,
            'description' => fake()->sentence(),
            'quantity' => fake()->randomFloat(2, 1, 10),
            'unit_price_minor' => fake()->numberBetween(1000, 10000),
            'discount_minor' => fake()->numberBetween(0, 500),
            'tax_rate_percentage' => fake()->randomElement([0, 16, 8]),
            'tax_amount_minor' => fake()->numberBetween(0, 1000),
            'subtotal_minor' => fake()->numberBetween(1000, 50000),
            'total_minor' => fake()->numberBetween(1100, 55000),
        ];
    }
}
