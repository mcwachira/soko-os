<?php

namespace Database\Factories;

use App\Models\ReturnModel;
use App\Models\Branch;
use App\Models\Business;
use App\Models\Organization;
use App\Models\Sale;
use App\Models\Terminal;
use App\Models\User;
use App\Models\CashShift;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ReturnModelFactory extends Factory
{
    protected $model = ReturnModel::class;

    public function definition(): array
    {
        return [
            'id' => Str::uuid()->toString(),
            'organization_id' => Organization::factory(),
            'business_id' => Business::factory(),
            'branch_id' => Branch::factory(),
            'terminal_id' => Terminal::factory(),
            'sale_id' => Sale::factory(),
            'cashier_user_id' => User::factory(),
            'shift_id' => CashShift::factory(),
            'return_number' => 'RET-' . strtoupper(fake()->unique()->bothify('????-##-????')),
            'status' => fake()->randomElement(['pending', 'approved', 'rejected', 'completed', 'cancelled']),
            'return_type' => fake()->randomElement(['refund', 'exchange', 'store_credit']),
            'subtotal_minor' => fake()->numberBetween(1000, 100000),
            'tax_total_minor' => fake()->numberBetween(0, 20000),
            'grand_total_minor' => fake()->numberBetween(1000, 120000),
            'refunded_total_minor' => 0,
            'reason' => fake()->optional()->sentence(),
            'notes' => fake()->optional()->sentence(),
            'approved_by_user_id' => null,
            'approved_at' => null,
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
        ]);
    }

    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'approved',
            'approved_by_user_id' => User::factory(),
            'approved_at' => now(),
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'approved_by_user_id' => User::factory(),
            'approved_at' => now()->subHour(),
            'refunded_total_minor' => $attributes['grand_total_minor'],
        ]);
    }
}