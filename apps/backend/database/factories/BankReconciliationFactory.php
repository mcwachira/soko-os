<?php

namespace Database\Factories;

use App\Models\BankAccount;
use App\Models\Business;
use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class BankReconciliationFactory extends Factory
{
    protected $model = \App\Models\BankReconciliation::class;

    public function definition(): array
    {
        return [
            'id' => Str::uuid()->toString(),
            'organization_id' => Organization::factory(),
            'business_id' => Business::factory(),
            'bank_account_id' => BankAccount::factory(),
            'statement_date' => fake()->date(),
            'start_date' => fake()->date(),
            'end_date' => fake()->date(),
            'statement_balance_minor' => fake()->numberBetween(10000, 500000),
            'book_balance_minor' => fake()->numberBetween(10000, 500000),
            'difference_minor' => 0,
            'status' => 'in_progress',
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
