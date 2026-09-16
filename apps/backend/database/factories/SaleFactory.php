<?php

namespace Database\Factories;

use App\Models\Sale;
use App\Models\Branch;
use App\Models\Business;
use App\Models\Customer;
use App\Models\Organization;
use App\Models\Terminal;
use App\Models\User;
use App\Models\CashShift;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class SaleFactory extends Factory
{
    protected $model = Sale::class;

    public function definition(): array
    {
        $subtotal = fake()->numberBetween(10000, 500000);
        $discount = fake()->numberBetween(0, 50000);
        $tax = (int) round(($subtotal - $discount) * 0.16 / 1.16);
        $grandTotal = $subtotal - $discount + $tax;

        return [
            'id' => Str::uuid()->toString(),
            'organization_id' => Organization::factory(),
            'business_id' => Business::factory(),
            'branch_id' => Branch::factory(),
            'terminal_id' => Terminal::factory(),
            'cashier_user_id' => User::factory(),
            'shift_id' => CashShift::factory(),
            'customer_id' => fake()->optional(0.3)->randomElement([Customer::factory(), null]),
            'receipt_number' => 'REC-' . strtoupper(fake()->unique()->bothify('????-##-????')),
            'invoice_number' => fake()->optional(0.2)->bothify('INV-#######'),
            'status' => 'completed',
            'subtotal_minor' => $subtotal - $tax,
            'discount_minor' => $discount,
            'tax_total_minor' => $tax,
            'grand_total_minor' => $grandTotal,
            'paid_total_minor' => $grandTotal,
            'change_due_minor' => 0,
            'tax_submission_status' => 'pending',
            'accounting_sync_status' => 'pending',
            'notes' => fake()->optional()->sentence(),
        ];
    }

    public function credit(): static
    {
        return $this->state(fn (array $attributes) => [
            'customer_id' => Customer::factory()->withCredit(),
            'paid_total_minor' => 0,
            'change_due_minor' => 0,
        ]);
    }

    public function partialPayment(int $paidMinor): static
    {
        return $this->state(fn (array $attributes) => [
            'paid_total_minor' => $paidMinor,
            'change_due_minor' => $paidMinor > $attributes['grand_total_minor'] ? $paidMinor - $attributes['grand_total_minor'] : 0,
        ]);
    }
}