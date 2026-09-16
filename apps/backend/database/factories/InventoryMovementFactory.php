<?php

namespace Database\Factories;

use App\Models\InventoryMovement;
use App\Models\Product;
use App\Models\Branch;
use App\Models\Business;
use App\Models\Organization;
use App\Models\Warehouse;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class InventoryMovementFactory extends Factory
{
    protected $model = InventoryMovement::class;

    public function definition(): array
    {
        $movementType = fake()->randomElement(['purchase', 'sale', 'return', 'damage', 'transfer', 'adjustment']);
        $quantityChange = $movementType === 'sale' ? -fake()->numberBetween(1, 100) : fake()->numberBetween(1, 100);

        return [
            'id' => Str::uuid()->toString(),
            'organization_id' => Organization::factory(),
            'business_id' => Business::factory(),
            'branch_id' => Branch::factory(),
            'warehouse_id' => Warehouse::factory(),
            'product_id' => Product::factory(),
            'movement_type' => $movementType,
            'quantity_change' => $quantityChange,
            'balance_after' => fake()->numberBetween(0, 10000),
            'reference_type' => fake()->randomElement(['sale', 'purchase', 'return', 'adjustment']),
            'reference_id' => Str::uuid()->toString(),
            'notes' => fake()->optional()->sentence(),
            'created_by_user_id' => User::factory(),
        ];
    }

    public function sale(int $quantity = 1): static
    {
        return $this->state(fn (array $attributes) => [
            'movement_type' => 'sale',
            'quantity_change' => -abs($quantity),
        ]);
    }

    public function purchase(int $quantity = 1): static
    {
        return $this->state(fn (array $attributes) => [
            'movement_type' => 'purchase',
            'quantity_change' => abs($quantity),
        ]);
    }
}