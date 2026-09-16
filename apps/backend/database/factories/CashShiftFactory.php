<?php

namespace Database\Factories;

use App\Models\CashShift;
use App\Models\Branch;
use App\Models\Business;
use App\Models\Organization;
use App\Models\Terminal;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CashShiftFactory extends Factory
{
    protected $model = CashShift::class;

    public function definition(): array
    {
        $openingFloat = fake()->numberBetween(10000, 100000);
        $cashSales = fake()->numberBetween(0, 500000);
        $cashIn = fake()->numberBetween(0, 50000);
        $cashOut = fake()->numberBetween(0, 30000);
        $cashRefunds = fake()->numberBetween(0, 20000);
        $expected = $openingFloat + $cashSales + $cashIn - $cashOut - $cashRefunds;
        $variance = fake()->numberBetween(-5000, 5000);

        return [
            'id' => Str::uuid()->toString(),
            'organization_id' => Organization::factory(),
            'business_id' => Business::factory(),
            'branch_id' => Branch::factory(),
            'terminal_id' => Terminal::factory(),
            'cashier_user_id' => User::factory(),
            'status' => fake()->randomElement(['open', 'closed']),
            'opened_at' => now()->subHours(fake()->numberBetween(1, 12)),
            'closed_at' => fake()->optional(0.5)->dateTimeBetween('-12 hours', 'now'),
            'opening_float_minor' => $openingFloat,
            'expected_cash_minor' => $expected,
            'actual_cash_minor' => $expected + $variance,
            'variance_minor' => $variance,
            'cash_sales_minor' => $cashSales,
            'cash_in_minor' => $cashIn,
            'cash_out_minor' => $cashOut,
            'cash_refunds_minor' => $cashRefunds,
            'notes' => fake()->optional()->sentence(),
        ];
    }

    public function open(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'open',
            'closed_at' => null,
            'expected_cash_minor' => null,
            'actual_cash_minor' => null,
            'variance_minor' => null,
        ]);
    }

    public function closed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'closed',
        ]);
    }
}