<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Category;
use App\Models\Business;
use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        return [
            'id' => Str::uuid()->toString(),
            'organization_id' => Organization::factory(),
            'business_id' => Business::factory(),
            'category_id' => Category::factory(),
            'key' => fake()->unique()->slug(2),
            'sku' => strtoupper(fake()->unique()->bothify('SKU-####')),
            'barcode' => fake()->optional()->ean13(),
            'name' => fake()->words(3, true),
            'description' => fake()->optional()->sentence(),
            'tax_category_code' => fake()->randomElement(['A', 'B', 'C', 'D', 'E']),
            'unit' => fake()->randomElement(['pcs', 'kg', 'ltr', 'mtr']),
            'cost_price_minor' => fake()->numberBetween(1000, 50000),
            'selling_price_minor' => fake()->numberBetween(1500, 100000),
            'reorder_level' => fake()->numberBetween(5, 50),
            'track_inventory' => true,
            'is_active' => true,
            'version' => 1,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    public function noInventory(): static
    {
        return $this->state(fn (array $attributes) => [
            'track_inventory' => false,
        ]);
    }
}