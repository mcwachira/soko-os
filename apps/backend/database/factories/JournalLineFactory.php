<?php

namespace Database\Factories;

use App\Models\JournalLine;
use App\Models\JournalEntry;
use App\Models\Account;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class JournalLineFactory extends Factory
{
    protected $model = JournalLine::class;

    public function definition(): array
    {
        $isDebit = fake()->boolean(50);
        $amount = fake()->numberBetween(1000, 1000000);

        return [
            'id' => Str::uuid()->toString(),
            'journal_entry_id' => JournalEntry::factory(),
            'account_id' => Account::factory(),
            'description' => fake()->optional()->sentence(),
            'debit_minor' => $isDebit ? $amount : 0,
            'credit_minor' => $isDebit ? 0 : $amount,
        ];
    }

    public function debit(int $amount): static
    {
        return $this->state(fn (array $attributes) => [
            'debit_minor' => $amount,
            'credit_minor' => 0,
        ]);
    }

    public function credit(int $amount): static
    {
        return $this->state(fn (array $attributes) => [
            'debit_minor' => 0,
            'credit_minor' => $amount,
        ]);
    }
}