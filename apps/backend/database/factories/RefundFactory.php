<?php

namespace Database\Factories;

use App\Models\Refund;
use App\Models\Branch;
use App\Models\Business;
use App\Models\Customer;
use App\Models\Organization;
use App\Models\Payment;
use App\Models\ReturnModel;
use App\Models\Sale;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class RefundFactory extends Factory
{
    protected $model = Refund::class;

    public function definition(): array
    {
        return [
            'id' => Str::uuid()->toString(),
            'organization_id' => Organization::factory(),
            'business_id' => Business::factory(),
            'branch_id' => Branch::factory(),
            'return_id' => ReturnModel::factory(),
            'sale_id' => Sale::factory(),
            'payment_id' => Payment::factory(),
            'customer_id' => Customer::factory(),
            'refund_number' => 'RFN-' . strtoupper(fake()->unique()->bothify('????????')),
            'status' => fake()->randomElement(['pending', 'processing', 'completed', 'failed', 'cancelled']),
            'refund_method' => fake()->randomElement(['cash', 'card', 'mpesa', 'airtel', 'bank', 'store_credit', 'original']),
            'amount_minor' => fake()->numberBetween(1000, 100000),
            'currency' => 'KES',
            'reference' => fake()->optional()->bothify('REF-#######'),
            'external_transaction_id' => fake()->optional()->bothify('EXT-#######'),
            'provider_response' => null,
            'reason' => fake()->optional()->sentence(),
            'processed_by_user_id' => User::factory(),
            'processed_at' => fake()->optional()->dateTimeBetween('-7 days', 'now'),
        ];
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'processed_at' => now(),
        ]);
    }
}