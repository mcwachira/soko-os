<?php

namespace Database\Factories;

use App\Models\Payment;
use App\Models\Sale;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    public function definition(): array
    {
        return [
            'id' => Str::uuid()->toString(),
            'sale_id' => Sale::factory(),
            'amount_minor' => fake()->numberBetween(1000, 500000),
            'currency' => 'KES',
            'payment_method' => fake()->randomElement(['cash', 'mpesa', 'airtel', 'card', 'bank', 'credit', 'points']),
            'status' => 'completed',
            'reference' => fake()->optional()->bothify('REF-#######'),
            'external_transaction_id' => fake()->optional()->bothify('EXT-#######'),
            'provider_response' => null,
        ];
    }

    public function cash(int $amountMinor): static
    {
        return $this->state(fn (array $attributes) => [
            'payment_method' => 'cash',
            'amount_minor' => $amountMinor,
        ]);
    }

    public function mpesa(int $amountMinor): static
    {
        return $this->state(fn (array $attributes) => [
            'payment_method' => 'mpesa',
            'amount_minor' => $amountMinor,
            'external_transaction_id' => 'MPESA-' . strtoupper(Str::random(8)),
        ]);
    }
}