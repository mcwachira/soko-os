<?php

namespace Database\Factories;

use App\Models\Invoice;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class InvoiceItemFactory extends Factory
{
    protected $model = \App\Models\InvoiceItem::class;

    public function definition(): array
    {
        return [
            'id' => Str::uuid()->toString(),
            'invoice_id' => Invoice::factory(),
            'product_id' => Product::factory(),
            'description' => fake()->words(3, true),
            'quantity' => fake()->numberBetween(1, 10),
            'unit_price_minor' => fake()->numberBetween(1000, 50000),
            'discount_minor' => 0,
            'tax_rate_percentage' => fake()->randomElement([0, 16]),
            'tax_amount_minor' => 0,
            'subtotal_minor' => 0,
            'total_minor' => 0,
        ];
    }
}
