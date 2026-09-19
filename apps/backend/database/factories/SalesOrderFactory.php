<?php

namespace Database\Factories;

use App\Models\SalesOrder;
use Illuminate\Database\Eloquent\Factories\Factory;

class SalesOrderFactory extends Factory
{
    protected $model = SalesOrder::class;

    public function definition(): array
    {
        return [
            'id' => \Illuminate\Support\Str::uuid()->toString(),
            'organization_id' => null,
            'business_id' => null,
            'branch_id' => null,
            'customer_id' => null,
            'quote_id' => null,
            'sales_order_number' => fake()->unique()->numerify('SO-#######'),
            'status' => fake()->randomElement(['draft', 'confirmed', 'processing', 'completed', 'cancelled']),
            'order_date' => fake()->date(),
            'expected_delivery_date' => fake()->dateTimeBetween('+1 week', '+1 month')->format('Y-m-d'),
            'currency' => 'KES',
            'subtotal_minor' => fake()->numberBetween(1000, 50000),
            'discount_minor' => fake()->numberBetween(0, 500),
            'tax_total_minor' => fake()->numberBetween(100, 5000),
            'grand_total_minor' => fake()->numberBetween(1100, 55000),
            'notes' => fake()->optional()->paragraph(),
        ];
    }
}
