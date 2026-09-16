<?php

namespace Database\Factories;

use App\Models\Business;
use App\Models\Customer;
use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class InvoiceFactory extends Factory
{
    protected $model = \App\Models\Invoice::class;

    public function definition(): array
    {
        return [
            'id' => Str::uuid()->toString(),
            'organization_id' => Organization::factory(),
            'business_id' => Business::factory(),
            'customer_id' => Customer::factory(),
            'invoice_number' => fake()->unique()->numerify('INV-####'),
            'status' => 'draft',
            'issue_date' => fake()->date(),
            'due_date' => fake()->optional()->date(),
            'currency' => 'KES',
            'subtotal_minor' => 0,
            'discount_minor' => 0,
            'tax_total_minor' => 0,
            'grand_total_minor' => 0,
            'paid_total_minor' => 0,
            'balance_minor' => 0,
            'notes' => fake()->optional()->sentence(),
            'terms' => fake()->optional()->sentence(),
        ];
    }
}
