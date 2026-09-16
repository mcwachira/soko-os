<?php

namespace Database\Factories;

use App\Models\Business;
use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class BusinessFactory extends Factory
{
    protected $model = Business::class;

    public function definition(): array
    {
        return [
            'id' => Str::uuid()->toString(),
            'organization_id' => Organization::factory(),
            'name' => fake()->company(),
            'business_type' => fake()->randomElement(['retail', 'wholesale', 'restaurant']),
            'tax_pin' => fake()->optional()->bothify('P########?'),
            'currency' => 'KES',
            'is_active' => true,
        ];
    }
}