<?php

namespace Database\Factories;

use App\Models\PurchaseOrder;
use App\Models\Supplier;
use App\Models\Business;
use App\Models\Organization;
use App\Models\Branch;
use App\Models\Warehouse;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class PurchaseOrderFactory extends Factory
{
    protected $model = PurchaseOrder::class;

    public function definition(): array
    {
        $subtotal = fake()->numberBetween(10000, 500000);
        $tax = (int) round($subtotal * 0.16 / 1.16);
        $grandTotal = $subtotal + $tax;

        return [
            'id' => Str::uuid()->toString(),
            'organization_id' => Organization::factory(),
            'business_id' => Business::factory(),
            'branch_id' => Branch::factory(),
            'warehouse_id' => Warehouse::factory(),
            'supplier_id' => Supplier::factory(),
            'user_id' => User::factory(),
            'po_number' => 'PO-' . strtoupper(fake()->unique()->bothify('####-????')),
            'status' => 'draft',
            'subtotal_minor' => $subtotal,
            'tax_total_minor' => $tax,
            'grand_total_minor' => $grandTotal,
            'expected_date' => fake()->optional()->date(),
            'received_date' => null,
            'notes' => fake()->optional()->sentence(),
        ];
    }

    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'approved',
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'received_date' => now()->toDateString(),
        ]);
    }
}
