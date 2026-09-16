<?php

namespace Database\Factories;

use App\Models\Business;
use App\Models\ExpenseCategory;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ExpenseFactory extends Factory
{
    protected $model = \App\Models\Expense::class;

    public function definition(): array
    {
        return [
            'id' => Str::uuid()->toString(),
            'organization_id' => Organization::factory(),
            'business_id' => Business::factory(),
            'supplier_id' => null,
            'expense_category_id' => ExpenseCategory::factory(),
            'account_id' => null,
            'bank_account_id' => null,
            'created_by_user_id' => User::factory(),
            'approved_by_user_id' => null,
            'expense_number' => 'EXP-'.strtoupper(\Illuminate\Support\Str::random(8)),
            'status' => 'draft',
            'expense_date' => fake()->date(),
            'payment_date' => fake()->optional()->date(),
            'payment_method' => fake()->optional()->randomElement(['cash', 'bank', 'mpesa', 'card']),
            'reference' => fake()->optional()->bothify('REF-####'),
            'payee_name' => fake()->name(),
            'description' => fake()->optional()->sentence(),
            'notes' => fake()->optional()->sentence(),
            'receipt_path' => fake()->optional()->url(),
            'amount_minor' => fake()->numberBetween(1000, 50000),
            'tax_minor' => 0,
            'total_minor' => 0,
        ];
    }
}
