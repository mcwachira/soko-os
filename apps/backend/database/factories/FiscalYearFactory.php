<?php

namespace Database\Factories;

use App\Models\FiscalYear;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class FiscalYearFactory extends Factory
{
    protected $model = FiscalYear::class;

    public function definition(): array
    {
        $startDate = fake()->date();
        $endDate = fake()->dateTimeBetween($startDate, '+1 year')->format('Y-m-d');

        return [
            'id' => Str::uuid()->toString(),
            'organization_id' => null,
            'business_id' => null,
            'name' => fake()->unique()->numerify('FY ####'),
            'start_date' => $startDate,
            'end_date' => $endDate,
            'is_current' => fake()->boolean(),
        ];
    }
}
