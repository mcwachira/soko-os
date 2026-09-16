<?php

namespace Database\Factories;

use App\Models\Branch;
use App\Models\Business;
use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class BranchFactory extends Factory
{
    protected $model = Branch::class;

    public function definition(): array
    {
        return [
            'id' => Str::uuid()->toString(),
            'organization_id' => Organization::factory(),
            'business_id' => Business::factory(),
            'name' => fake()->streetName() . ' Branch',
            'code' => strtoupper(fake()->unique()->bothify('???##')),
            'address' => fake()->address(),
            'phone' => fake()->phoneNumber(),
            'is_active' => true,
        ];
    }
}