<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\Organization;
use App\Models\Business;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProjectFactory extends Factory
{
    protected $model = Project::class;

    public function definition(): array
    {
        return [
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'organization_id' => \App\Models\Organization::factory(),
            'business_id' => \App\Models\Business::factory(),
            'customer_id' => null,
            'name' => fake()->words(3, true),
            'description' => fake()->sentence(),
            'status' => fake()->randomElement(['active', 'completed', 'on_hold', 'cancelled']),
            'start_date' => fake()->date(),
            'end_date' => fake()->optional()->date(),
            'budget_minor' => fake()->numberBetween(100000, 10000000),
            'billed_minor' => 0,
            'cost_minor' => 0,
        ];
    }
}
