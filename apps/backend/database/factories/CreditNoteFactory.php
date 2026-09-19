<?php

namespace Database\Factories;

use App\Models\CreditNote;
use App\Models\CreditNoteItem;
use Illuminate\Database\Eloquent\Factories\Factory;

class CreditNoteFactory extends Factory
{
    protected $model = CreditNote::class;

    public function definition(): array
    {
        return [
            'id' => \Illuminate\Support\Str::uuid()->toString(),
            'organization_id' => null,
            'business_id' => null,
            'branch_id' => null,
            'customer_id' => null,
            'invoice_id' => null,
            'credit_note_number' => fake()->unique()->numerify('CN-#######'),
            'status' => fake()->randomElement(['draft', 'issued', 'void']),
            'credit_date' => fake()->date(),
            'currency' => 'KES',
            'subtotal_minor' => fake()->numberBetween(1000, 50000),
            'tax_total_minor' => fake()->numberBetween(100, 5000),
            'total_minor' => fake()->numberBetween(1100, 55000),
            'reason' => fake()->sentence(),
            'notes' => fake()->optional()->paragraph(),
        ];
    }
}
