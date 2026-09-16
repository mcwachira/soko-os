<?php

namespace Database\Factories;

use App\Models\SyncOperation;
use App\Models\Branch;
use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class SyncOperationFactory extends Factory
{
    protected $model = SyncOperation::class;

    public function definition(): array
    {
        return [
            'id' => Str::uuid()->toString(),
            'organization_id' => Organization::factory(),
            'branch_id' => Branch::factory(),
            'device_id' => Str::uuid()->toString(),
            'idempotency_key' => Str::uuid()->toString(),
            'entity_name' => fake()->randomElement(['sales', 'customers', 'inventory_movements', 'cash_shifts', 'products', 'categories']),
            'action' => fake()->randomElement(['create', 'update', 'delete']),
            'local_id' => Str::uuid()->toString(),
            'payload' => [],
            'status' => fake()->randomElement(['accepted', 'rejected', 'conflict']),
            'error_message' => fake()->optional()->sentence(),
        ];
    }

    public function accepted(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'accepted',
        ]);
    }

    public function conflict(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'conflict',
        ]);
    }
}