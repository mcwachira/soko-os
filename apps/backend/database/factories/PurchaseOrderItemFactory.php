<?php

namespace Database\Factories;

use App\Models\PurchaseOrderItem;
use App\Models\PurchaseOrder;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class PurchaseOrderItemFactory extends Factory
{
    protected $model = PurchaseOrderItem::class;

    public function definition(): array
    {
        $quantity = fake()->numberBetween(1, 50);
        $unitPrice = fake()->numberBetween(500, 100000);
        $discount = fake()->numberBetween(0, 10000);
        $rate = fake()->randomElement([0, 8, 16]);
        $itemTotal = ($quantity * $unitPrice) - $discount;
        $taxAmount = $rate > 0 ? (int) round(($itemTotal * $rate) / (100 + $rate)) : 0;

        return [
            'id' => Str::uuid()->toString(),
            'purchase_order_id' => PurchaseOrder::factory(),
            'product_id' => Product::factory(),
            'sku' => strtoupper(fake()->bothify('SKU-####')),
            'name' => fake()->words(3, true),
            'quantity' => $quantity,
            'unit_price_minor' => $unitPrice,
            'discount_minor' => $discount,
            'tax_rate_percentage' => $rate,
            'tax_amount_minor' => $taxAmount,
            'subtotal_minor' => $itemTotal - $taxAmount,
            'total_minor' => $itemTotal,
            'received_quantity' => 0,
        ];
    }

    public function partiallyReceived(): static
    {
        return $this->state(function (array $attributes) {
            $received = (int) floor($attributes['quantity'] / 2);

            return [
                'received_quantity' => $received,
            ];
        });
    }
}
