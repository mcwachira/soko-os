<?php

namespace Database\Factories;

use App\Models\DebitNote;
use App\Models\DebitNoteItem;
use Illuminate\Database\Eloquent\Factories\Factory;

class DebitNoteItemFactory extends Factory
{
    protected $model = DebitNoteItem::class;

    public function definition(): array
    {
        return [
            'id' => \Illuminate\Support\Str::uuid()->toString(),
            'debit_note_id' => DebitNote::factory(),
            'product_id' => null,
            'description' => fake()->sentence(),
            'quantity' => fake()->randomFloat(2, 1, 10),
            'unit_cost_minor' => fake()->numberBetween(1000, 10000),
            'discount_minor' => fake()->numberBetween(0, 500),
            'tax_rate_percentage' => fake()->randomElement([0, 16, 8]),
            'tax_amount_minor' => fake()->numberBetween(0, 1000),
            'subtotal_minor' => fake()->numberBetween(1000, 50000),
            'total_minor' => fake()->numberBetween(1100, 55000),
        ];
    }
}
