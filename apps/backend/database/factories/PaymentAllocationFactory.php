<?php

namespace Database\Factories;

use App\Models\Payment;
use App\Models\Invoice;
use App\Models\Bill;
use Illuminate\Database\Eloquent\Factories\Factory;

class PaymentAllocationFactory extends Factory
{
    protected $model = \App\Models\PaymentAllocation::class;

    public function definition(): array
    {
        return [
            'id' => \Illuminate\Support\Str::uuid()->toString(),
            'organization_id' => null,
            'payment_id' => Payment::factory(),
            'allocatable_type' => fake()->randomElement([Invoice::class, Bill::class]),
            'allocatable_id' => fake()->uuid(),
            'allocated_minor' => fake()->numberBetween(1000, 50000),
        ];
    }
}
