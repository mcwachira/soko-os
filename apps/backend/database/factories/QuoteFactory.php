<?php

namespace Database\Factories;

use App\Models\Quote;
use App\Models\QuoteItem;
use Illuminate\Database\Eloquent\Factories\Factory;

class QuoteFactory extends Factory
{
    protected $model = Quote::class;

    public function definition(): array
    {
        return [
            'id' => \Illuminate\Support\Str::uuid()->toString(),
            'organization_id' => null,
            'business_id' => null,
            'branch_id' => null,
            'customer_id' => null,
            'quote_number' => fake()->unique()->numerify('QUO-#######'),
            'status' => fake()->randomElement(['draft', 'sent', 'accepted', 'rejected', 'expired', 'converted']),
            'quote_date' => fake()->date(),
            'expiry_date' => fake()->dateTimeBetween('+1 week', '+1 month')->format('Y-m-d'),
            'currency' => 'KES',
            'subtotal_minor' => fake()->numberBetween(1000, 50000),
            'discount_minor' => fake()->numberBetween(0, 500),
            'tax_total_minor' => fake()->numberBetween(100, 5000),
            'grand_total_minor' => fake()->numberBetween(1100, 55000),
            'terms' => fake()->optional()->paragraph(),
            'notes' => fake()->optional()->paragraph(),
        ];
    }
}
