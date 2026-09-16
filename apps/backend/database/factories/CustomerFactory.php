<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\Business;
use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CustomerFactory extends Factory
{
    protected $model = Customer::class;

    public function definition(): array
    {
        return [
            'id' => Str::uuid()->toString(),
            'organization_id' => Organization::factory(),
            'business_id' => Business::factory(),
            'code' => fake()->unique()->bothify('CUST-####'),
            'name' => fake()->name(),
            'phone' => fake()->unique()->phoneNumber(),
            'email' => fake()->optional()->safeEmail(),
            'tax_pin' => fake()->optional()->bothify('A########?'),
            'credit_limit_minor' => fake()->numberBetween(0, 10000000),
            'current_balance_minor' => 0,
            'loyalty_points' => fake()->numberBetween(0, 10000),
            'price_level' => fake()->randomElement(['retail', 'wholesale', 'vip']),
        ];
    }

    public function withCredit(): static
    {
        return $this->state(fn (array $attributes) => [
            'credit_limit_minor' => 1000000,
            'current_balance_minor' => fake()->numberBetween(0, 500000),
        ]);
    }
}