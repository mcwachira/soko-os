<?php

namespace Database\Factories;

use App\Models\DebitNote;
use Illuminate\Database\Eloquent\Factories\Factory;

class DebitNoteFactory extends Factory
{
    protected $model = DebitNote::class;

    public function definition(): array
    {
        return [
            'id' => \Illuminate\Support\Str::uuid()->toString(),
            'organization_id' => null,
            'business_id' => null,
            'branch_id' => null,
            'supplier_id' => null,
            'bill_id' => null,
            'debit_note_number' => fake()->unique()->numerify('DN-#######'),
            'status' => fake()->randomElement(['draft', 'issued', 'void']),
            'debit_date' => fake()->date(),
            'currency' => 'KES',
            'subtotal_minor' => fake()->numberBetween(1000, 50000),
            'tax_total_minor' => fake()->numberBetween(100, 5000),
            'total_minor' => fake()->numberBetween(1100, 55000),
            'reason' => fake()->sentence(),
            'notes' => fake()->optional()->paragraph(),
        ];
    }
}
