<?php

namespace Database\Factories;

use App\Models\OutboxEvent;
use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class OutboxEventFactory extends Factory
{
    protected $model = OutboxEvent::class;

    public function definition(): array
    {
        return [
            'id' => Str::uuid()->toString(),
            'organization_id' => Organization::factory(),
            'event_name' => fake()->randomElement(['sale.created', 'payment.completed', 'return.completed', 'customer.created', 'product.updated', 'inventory.adjusted', 'shift.closed']),
            'payload' => [],
            'status' => fake()->randomElement(['pending', 'processing', 'published', 'failed']),
            'retry_count' => fake()->numberBetween(0, 3),
            'error_message' => fake()->optional()->sentence(),
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
        ]);
    }

    public function failed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'failed',
            'retry_count' => fake()->numberBetween(1, 5),
            'error_message' => 'Failed to process',
        ]);
    }
}