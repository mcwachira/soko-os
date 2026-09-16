<?php

namespace Database\Factories;

use App\Models\AccountingPeriod;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class AccountingPeriodFactory extends Factory
{
    protected $model = AccountingPeriod::class;

    public function definition(): array
    {
        $startDate = fake()->date();
        $endDate = fake()->dateTimeBetween($startDate, '+1 month')->format('Y-m-d');

        return [
            'id' => Str::uuid()->toString(),
            'organization_id' => null,
            'business_id' => null,
            'fiscal_year_id' => null,
            'name' => fake()->unique()->numerify('Period ##'),
            'start_date' => $startDate,
            'end_date' => $endDate,
            'status' => fake()->randomElement(['open', 'closed', 'locked']),
        ];
    }
}
