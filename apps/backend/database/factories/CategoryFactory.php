<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Business;
use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CategoryFactory extends Factory
{
    protected $model = Category::class;

    public function definition(): array
    {
        return [
            'id' => Str::uuid()->toString(),
            'organization_id' => Organization::factory(),
            'business_id' => Business::factory(),
            'name' => fake()->unique()->word(),
            'slug' => Str::slug(fake()->unique()->word()),
            'parent_id' => null,
        ];
    }

    public function child(): static
    {
        return $this->state(fn (array $attributes) => [
            'parent_id' => Category::factory(),
        ]);
    }
}