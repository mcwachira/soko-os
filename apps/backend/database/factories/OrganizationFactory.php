<?php

namespace Database\Factories;

use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class OrganizationFactory extends Factory
{
    protected $model = Organization::class;

    public function definition(): array
    {
        return [
            'id' => Str::uuid()->toString(),
            'name' => fake()->company(),
            'slug' => Str::slug(fake()->unique()->company()),
            'tax_number' => fake()->optional()->bothify('P########?'),
            'country_code' => 'KE',
            'currency' => 'KES',
        ];
    }
}