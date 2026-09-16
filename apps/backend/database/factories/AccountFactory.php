<?php

namespace Database\Factories;

use App\Models\Account;
use App\Models\Business;
use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class AccountFactory extends Factory
{
    protected $model = Account::class;

    public function definition(): array
    {
        return [
            'id' => Str::uuid()->toString(),
            'organization_id' => Organization::factory(),
            'business_id' => Business::factory(),
            'code' => fake()->unique()->numerify('####'),
            'name' => fake()->words(3, true),
            'type' => fake()->randomElement(['asset', 'liability', 'equity', 'revenue', 'expense']),
            'currency' => 'KES',
            'is_active' => true,
        ];
    }

    public function asset(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'asset',
        ]);
    }

    public function liability(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'liability',
        ]);
    }

    public function equity(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'equity',
        ]);
    }

    public function revenue(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'revenue',
        ]);
    }

    public function expense(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'expense',
        ]);
    }
}