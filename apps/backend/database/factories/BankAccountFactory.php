<?php

namespace Database\Factories;

use App\Models\Account;
use App\Models\Business;
use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class BankAccountFactory extends Factory
{
    protected $model = \App\Models\BankAccount::class;

    public function definition(): array
    {
        return [
            'id' => Str::uuid()->toString(),
            'organization_id' => Organization::factory(),
            'business_id' => Business::factory(),
            'account_id' => Account::factory(),
            'name' => fake()->words(2, true),
            'account_number_masked' => fake()->optional()->bothify('****####'),
            'bank_name' => fake()->optional()->randomElement(['KCB', 'Equity', 'Cooperative', 'Barclays', 'NCBA']),
            'currency' => 'KES',
            'is_active' => true,
        ];
    }
}
