<?php

namespace Database\Factories;

use App\Models\Account;
use App\Models\Business;
use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ExpenseCategoryFactory extends Factory
{
    protected $model = \App\Models\ExpenseCategory::class;

    public function definition(): array
    {
        return [
            'id' => Str::uuid()->toString(),
            'organization_id' => Organization::factory(),
            'business_id' => Business::factory(),
            'name' => fake()->words(2, true),
            'code' => fake()->optional()->bothify('EXP-##'),
            'account_id' => Account::factory(),
            'is_active' => true,
        ];
    }
}
