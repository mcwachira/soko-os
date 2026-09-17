<?php

namespace App\Services;

use App\Models\InventoryMovement;
use App\Models\Product;
use App\Models\ProductStock;
use App\Models\Warehouse;
use App\Models\Batch;
use App\Models\SerialNumber;
use App\Models\User;
use App\Services\ValuationService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class InventoryService
{
    public static function recordMovement(
        Product $product,
        ?Warehouse $warehouse,
        string $movementType,
        float $quantityChange,
        array $context = []
    ): InventoryMovement {
        if (! $product->track_inventory) {
            return null;
        }

        $organizationId = $product->organization_id;
        $businessId = $product->business_id;
        $branchId = $context['branch_id'] ?? null;

        return DB::transaction(function () use ($product, $warehouse, $movementType, $quantityChange, $context, $organizationId, $businessId, $branchId) {
            $stock = ProductStock::where('organization_id', $organizationId)
                ->where('product_id', $product->id)
                ->when($warehouse, fn ($q) => $q->where('warehouse_id', $warehouse->id))
                ->lockForUpdate()
                ->first();

            $onHand = (float) ($stock->quantity_on_hand ?? 0);
            $reserved = (float) ($stock->quantity_reserved ?? 0);
            $available = (float) ($stock->quantity_available ?? 0);

            $balanceAfter = $onHand + $quantityChange;

            if ($balanceAfter < 0 && ! ($context['allow_negative'] ?? false)) {
                throw new \InvalidArgumentException("Insufficient stock for product {$product->name}. Available: {$onHand}, requested: " . abs($quantityChange));
            }

            $newReserved = $reserved;
            $newAvailable = $available;

            if (in_array($movementType, ['sale', 'reservation'])) {
                $newReserved = $reserved + abs($quantityChange);
                $newAvailable = $available - abs($quantityChange);
            } elseif (in_array($movementType, ['sale_return', 'reservation_release', 'transfer_in', 'purchase_receive', 'adjustment_in'])) {
                $newAvailable = $available + abs($quantityChange);
            }

            if ($stock) {
                $stock->update([
                    'quantity_on_hand' => $balanceAfter,
                    'quantity_reserved' => $newReserved,
                    'quantity_available' => $newAvailable,
                ]);
            } else {
                $stock = ProductStock::create([
                    'id' => Str::uuid()->toString(),
                    'organization_id' => $organizationId,
                    'business_id' => $businessId,
                    'product_id' => $product->id,
                    'warehouse_id' => $warehouse?->id,
                    'quantity_on_hand' => $balanceAfter,
                    'quantity_reserved' => $newReserved,
                    'quantity_available' => $newAvailable,
                ]);
            }

            $movement = InventoryMovement::create([
                'id' => Str::uuid()->toString(),
                'organization_id' => $organizationId,
                'business_id' => $businessId,
                'branch_id' => $branchId,
                'warehouse_id' => $warehouse?->id,
                'product_id' => $product->id,
                'movement_type' => $movementType,
                'quantity_change' => $quantityChange,
                'balance_after' => $balanceAfter,
                'reference_type' => $context['reference_type'] ?? null,
                'reference_id' => $context['reference_id'] ?? null,
                'notes' => $context['notes'] ?? null,
                'created_by_user_id' => $context['user_id'] ?? null,
            ]);

            if (! empty($context['batch_number'])) {
                self::allocateBatch($product, $warehouse, $context['batch_number'], abs($quantityChange), $movementType);
            }

            if (! empty($context['serial_number'])) {
                self::allocateSerial($product, $warehouse, $context['serial_number'], $movementType, $context);
            }

            return $movement;
        });
    }

    public static function allocateBatch(Product $product, ?Warehouse $warehouse, string $batchNumber, float $quantity, string $movementType): void
    {
        $batch = Batch::where('organization_id', $product->organization_id)
            ->where('product_id', $product->id)
            ->when($warehouse, fn ($q) => $q->where('warehouse_id', $warehouse->id))
            ->where('batch_number', $batchNumber)
            ->first();

        if (! $batch) {
            $batch = Batch::create([
                'id' => Str::uuid()->toString(),
                'organization_id' => $product->organization_id,
                'business_id' => $product->business_id,
                'warehouse_id' => $warehouse?->id,
                'product_id' => $product->id,
                'batch_number' => $batchNumber,
                'quantity' => 0,
                'unit_cost_minor' => 0,
                'status' => 'active',
            ]);
        }

        $change = in_array($movementType, ['purchase_receive', 'adjustment_in', 'transfer_in', 'sale_return']) ? $quantity : -$quantity;
        $batch->update([
            'quantity' => DB::raw("GREATEST(quantity + {$change}, 0)"),
        ]);
    }

    public static function allocateSerial(Product $product, ?Warehouse $warehouse, string $serialNumber, string $movementType, array $context = []): void
    {
        $status = match ($movementType) {
            'sale', 'transfer_out', 'adjustment_out' => 'sold',
            'sale_return' => 'returned',
            default => 'in_stock',
        };

        SerialNumber::updateOrCreate(
            [
                'organization_id' => $product->organization_id,
                'product_id' => $product->id,
                'serial_number' => $serialNumber,
            ],
            [
                'business_id' => $product->business_id,
                'warehouse_id' => $warehouse?->id,
                'status' => $status,
                'metadata' => $context['serial_metadata'] ?? null,
            ]
        );
    }

    public static function reserveStock(Product $product, ?Warehouse $warehouse, float $quantity, array $context = []): ProductStock
    {
        $stock = ProductStock::where('organization_id', $product->organization_id)
            ->where('product_id', $product->id)
            ->when($warehouse, fn ($q) => $q->where('warehouse_id', $warehouse->id))
            ->lockForUpdate()
            ->firstOrFail();

        if ($stock->quantity_available < $quantity) {
            throw new \InvalidArgumentException("Insufficient available stock for reservation. Available: {$stock->quantity_available}, requested: {$quantity}");
        }

        $stock->update([
            'quantity_reserved' => $stock->quantity_reserved + $quantity,
            'quantity_available' => $stock->quantity_available - $quantity,
        ]);

        InventoryMovement::create([
            'id' => Str::uuid()->toString(),
            'organization_id' => $product->organization_id,
            'business_id' => $product->business_id,
                'branch_id' => $context['branch_id'] ?? null,
            'warehouse_id' => $warehouse?->id,
            'product_id' => $product->id,
            'movement_type' => 'reservation',
            'quantity_change' => -$quantity,
            'balance_after' => $stock->quantity_on_hand,
            'reference_type' => $context['reference_type'] ?? null,
            'reference_id' => $context['reference_id'] ?? null,
            'notes' => $context['notes'] ?? null,
            'created_by_user_id' => $context['user_id'] ?? null,
        ]);

        return $stock->fresh();
    }

    public static function releaseReservation(Product $product, ?Warehouse $warehouse, float $quantity, array $context = []): ProductStock
    {
        $stock = ProductStock::where('organization_id', $product->organization_id)
            ->where('product_id', $product->id)
            ->when($warehouse, fn ($q) => $q->where('warehouse_id', $warehouse->id))
            ->lockForUpdate()
            ->firstOrFail();

        $stock->update([
            'quantity_reserved' => max(0, $stock->quantity_reserved - $quantity),
            'quantity_available' => $stock->quantity_available + $quantity,
        ]);

        InventoryMovement::create([
            'id' => Str::uuid()->toString(),
            'organization_id' => $product->organization_id,
            'business_id' => $product->business_id,
            'branch_id' => $context['branch_id'] ?? null,
            'warehouse_id' => $warehouse?->id,
            'product_id' => $product->id,
            'movement_type' => 'reservation_release',
            'quantity_change' => $quantity,
            'balance_after' => $stock->quantity_on_hand,
            'reference_type' => $context['reference_type'] ?? null,
            'reference_id' => $context['reference_id'] ?? null,
            'notes' => $context['notes'] ?? null,
            'created_by_user_id' => $context['user_id'] ?? null,
        ]);

        return $stock->fresh();
    }

    public static function getAvailableQuantity(Product $product, ?Warehouse $warehouse = null): float
    {
        $stock = ProductStock::where('organization_id', $product->organization_id)
            ->where('product_id', $product->id)
            ->when($warehouse, fn ($q) => $q->where('warehouse_id', $warehouse->id))
            ->first();

        return (float) ($stock->quantity_available ?? 0);
    }

    public static function getOnHandQuantity(Product $product, ?Warehouse $warehouse = null): float
    {
        $stock = ProductStock::where('organization_id', $product->organization_id)
            ->where('product_id', $product->id)
            ->when($warehouse, fn ($q) => $q->where('warehouse_id', $warehouse->id))
            ->first();

        return (float) ($stock->quantity_on_hand ?? 0);
    }

    public static function calculateCogs(Product $product, ?Warehouse $warehouse, float $quantity, string $method = 'fifo'): int
    {
        return ValuationService::calculateCogs($product, $warehouse, $quantity, $method);
    }
}
