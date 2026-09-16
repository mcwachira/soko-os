<?php

namespace Database\Factories;

use App\Models\BankAccount;
use App\Models\Business;
use App\Models\JournalEntry;
use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class BankTransactionFactory extends Factory
{
    protected $model = \App\Models\BankTransaction::class;

    public function definition(): array
    {
        return [
            'id' => Str::uuid()->toString(),
            'organization_id' => Organization::factory(),
            'business_id' => Business::factory(),
            'bank_account_id' => BankAccount::factory(),
            'journal_entry_id' => null,
            'type' => fake()->randomElement(['deposit', 'withdrawal', 'transfer', 'fee', 'interest']),
            'direction' => fake()->randomElement(['in', 'out']),
            'transaction_date' => fake()->date(),
            'reference' => fake()->optional()->bothify('TXN-####'),
            'description' => fake()->optional()->sentence(),
            'counterparty' => fake()->optional()->name(),
            'amount_minor' => fake()->numberBetween(1000, 100000),
            'currency' => 'KES',
            'status' => 'unreconciled',
            'source' => fake()->randomElement(['manual', 'import', 'integration']),
            'external_id' => fake()->optional()->bothify('EXT-####'),
        ];
    }
}
