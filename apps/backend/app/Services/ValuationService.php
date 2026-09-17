<?php

namespace App\Services;

use App\Models\InventoryLayer;
use App\Models\Product;
use App\Models\Warehouse;
use App\Models\Batch;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ValuationService
{
    public static function createLayer(
        Product $product,
        ?Warehouse $warehouse,
        string $layerType,
        float $quantity,
        int $unitCostMinor,
        array $context = []
    ): InventoryLayer {
        return DB::transaction(function () use ($product, $warehouse, $layerType, $quantity, $unitCostMinor, $context) {
            $layer = InventoryLayer::create([
                'id' => Str::uuid()->toString(),
                'organization_id' => $product->organization_id,
                'business_id' => $product->business_id,
                'warehouse_id' => $warehouse?->id,
                'product_id' => $product->id,
                'layer_type' => $layerType,
                'quantity' => $quantity,
                'remaining_quantity' => $quantity,
                'unit_cost_minor' => $unitCostMinor,
                'total_cost_minor' => (int) round($quantity * $unitCostMinor),
                'reference_id' => $context['reference_id'] ?? null,
                'reference_type' => $context['reference_type'] ?? null,
                'notes' => $context['notes'] ?? null,
            ]);

            return $layer;
        });
    }

    public static function calculateCogs(Product $product, ?Warehouse $warehouse, float $quantity, string $method = 'fifo'): int
    {
        if ($method === 'weighted_average') {
            return self::calculateWeightedAverageCogs($product, $warehouse, $quantity);
        }

        return self::calculateFifoCogs($product, $warehouse, $quantity);
    }

    private static function calculateFifoCogs(Product $product, ?Warehouse $warehouse, float $quantity): int
    {
        $remaining = $quantity;
        $totalCogs = 0;

        $layers = InventoryLayer::where('organization_id', $product->organization_id)
            ->where('product_id', $product->id)
            ->when($warehouse, fn ($q) => $q->where('warehouse_id', $warehouse->id))
            ->where('remaining_quantity', '>', 0)
            ->orderBy('created_at', 'asc')
            ->lockForUpdate()
            ->get();

        foreach ($layers as $layer) {
            if ($remaining <= 0) {
                break;
            }

            $consume = min($remaining, (float) $layer->remaining_quantity);
            $totalCogs += (int) round($consume * $layer->unit_cost_minor);
            $remaining -= $consume;

            $layer->update([
                'remaining_quantity' => DB::raw("GREATEST(remaining_quantity - {$consume}, 0)"),
            ]);
        }

        return $totalCogs;
    }

    private static function calculateWeightedAverageCogs(Product $product, ?Warehouse $warehouse, float $quantity): int
    {
        $totalValue = 0;
        $totalQty = 0;

        $layers = InventoryLayer::where('organization_id', $product->organization_id)
            ->where('product_id', $product->id)
            ->when($warehouse, fn ($q) => $q->where('warehouse_id', $warehouse->id))
            ->where('remaining_quantity', '>', 0)
            ->get();

        foreach ($layers as $layer) {
            $totalValue += (float) $layer->remaining_quantity * $layer->unit_cost_minor;
            $totalQty += (float) $layer->remaining_quantity;
        }

        if ($totalQty <= 0) {
            return 0;
        }

        $avgCost = $totalValue / $totalQty;

        DB::transaction(function () use ($product, $warehouse, $quantity, $avgCost) {
            $remaining = $quantity;
            $layers = InventoryLayer::where('organization_id', $product->organization_id)
                ->where('product_id', $product->id)
                ->when($warehouse, fn ($q) => $q->where('warehouse_id', $warehouse->id))
                ->where('remaining_quantity', '>', 0)
                ->orderBy('created_at', 'asc')
                ->lockForUpdate()
                ->get();

            foreach ($layers as $layer) {
                if ($remaining <= 0) {
                    break;
                }

                $consume = min($remaining, (float) $layer->remaining_quantity);
                $remaining -= $consume;

                $layer->update([
                    'remaining_quantity' => DB::raw("GREATEST(remaining_quantity - {$consume}, 0)"),
                ]);
            }
        });

        return (int) round($quantity * $avgCost);
    }

    public static function getInventoryValue(Product $product, ?Warehouse $warehouse = null): int
    {
        $layers = InventoryLayer::where('organization_id', $product->organization_id)
            ->where('product_id', $product->id)
            ->when($warehouse, fn ($q) => $q->where('warehouse_id', $warehouse->id))
            ->get();

        $totalValue = 0;

        foreach ($layers as $layer) {
            $totalValue += (float) $layer->remaining_quantity * $layer->unit_cost_minor;
        }

        return (int) round($totalValue);
    }
}
