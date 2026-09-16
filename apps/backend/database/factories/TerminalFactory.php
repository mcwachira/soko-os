<?php

namespace Database\Factories;

use App\Models\Terminal;
use App\Models\Branch;
use App\Models\Business;
use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class TerminalFactory extends Factory
{
    protected $model = Terminal::class;

    public function definition(): array
    {
        return [
            'id' => Str::uuid()->toString(),
            'organization_id' => Organization::factory(),
            'business_id' => Business::factory(),
            'branch_id' => Branch::factory(),
            'name' => 'Terminal ' . fake()->randomNumber(1),
            'terminal_code' => strtoupper(fake()->unique()->bothify('T##')),
            'is_active' => true,
        ];
    }
}