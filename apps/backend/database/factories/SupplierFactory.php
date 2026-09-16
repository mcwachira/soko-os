<?php

namespace Database\Factories;

use App\Models\Supplier;
use App\Models\Business;
use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class SupplierFactory extends Factory
{
    protected $model = Supplier::class;

    public function definition(): array
    {
        return [
            'id' => Str::uuid()->toString(),
            'organization_id' => Organization::factory(),
            'business_id' => Business::factory(),
            'name' => fake()->company(),
            'contact_person' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'tax_pin' => fake()->optional()->bothify('A########?'),
            'address' => fake()->address(),
            'credit_limit_minor' => fake()->numberBetween(0, 10000000),
            'current_balance_minor' => 0,
            'is_active' => true,
        ];
    }
}
