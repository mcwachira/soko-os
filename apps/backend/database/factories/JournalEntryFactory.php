<?php

namespace Database\Factories;

use App\Models\JournalEntry;
use App\Models\Business;
use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class JournalEntryFactory extends Factory
{
    protected $model = JournalEntry::class;

    public function definition(): array
    {
        return [
            'id' => Str::uuid()->toString(),
            'organization_id' => Organization::factory(),
            'business_id' => Business::factory(),
            'reference_type' => fake()->randomElement(['sale', 'purchase', 'payment', 'shift_close', 'adjustment']),
            'reference_id' => Str::uuid()->toString(),
            'entry_date' => fake()->dateTimeBetween('-30 days', 'now'),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}