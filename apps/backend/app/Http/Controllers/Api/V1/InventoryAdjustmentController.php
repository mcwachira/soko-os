<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\InventoryAdjustment;
use App\Models\Product;
use App\Models\User;
use App\Services\InventoryService;
use Illuminate\Http\Request;

class InventoryAdjustmentController extends Controller
{
    public function index(Request $request, User $user)
    {
        $query = InventoryAdjustment::where('organization_id', $user->organization_id);
        if ($request->filled('warehouse_id')) {
            $query->where('warehouse_id', $request->warehouse_id);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        return response()->json($query->get());
    }

    public function store(Request $request, User $user)
    {
        $validated = $request->validate([
            'warehouse_id' => 'required|uuid|exists:warehouses,id',
            'branch_id' => 'nullable|uuid|exists:branches,id',
            'type' => 'required|string|in:positive,negative,damage,loss,expiry,theft,stocktake,found,write_off',
            'reason' => 'required|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|uuid|exists:products,id',
            'items.*.bin_id' => 'nullable|uuid|exists:bins,id',
            'items.*.quantity_change' => 'required|numeric',
            'items.*.notes' => 'nullable|string',
        ]);

        $warehouse = \App\Models\Warehouse::findOrFail($validated['warehouse_id']);
        $branchId = $validated['branch_id'] ?? $user->branch_id;

        $adjustment = InventoryAdjustment::create([
            'organization_id' => $user->organization_id,
            'business_id' => $request->business_id ?? $user->business_id,
            'branch_id' => $branchId,
            'warehouse_id' => $validated['warehouse_id'],
            'user_id' => $user->id,
            'adjustment_number' => InventoryAdjustment::generateAdjustmentNumber(),
            'type' => $validated['type'],
            'reason' => $validated['reason'],
            'status' => 'pending',
        ]);

        foreach ($validated['items'] as $itemData) {
            $product = Product::where('organization_id', $user->organization_id)
                ->findOrFail($itemData['product_id']);

            $quantityBefore = InventoryService::getOnHandQuantity($product, $warehouse);

            $adjustment->items()->create([
                'product_id' => $itemData['product_id'],
                'bin_id' => $itemData['bin_id'] ?? null,
                'quantity_before' => $quantityBefore,
                'quantity_change' => $itemData['quantity_change'],
                'quantity_after' => $quantityBefore + $itemData['quantity_change'],
                'unit_cost_minor' => $product->cost_price_minor,
                'notes' => $itemData['notes'] ?? null,
            ]);
        }

        return response()->json($adjustment->load('items'), 201);
    }

    public function show(InventoryAdjustment $adjustment, User $user)
    {
        $this->authorize('view', $adjustment);
        return response()->json($adjustment->load('items'));
    }

    public function approve(Request $request, InventoryAdjustment $adjustment, User $user)
    {
        $this->authorize('update', $adjustment);

        if ($adjustment->status !== 'pending') {
            return response()->json(['message' => 'Adjustment is not pending approval.'], 422);
        }

        $warehouse = $adjustment->warehouse;
        $branchId = $adjustment->branch_id;

        foreach ($adjustment->items as $item) {
            $product = $item->product;
            $movementType = match ($adjustment->type) {
                'positive', 'found' => 'adjustment_in',
                'negative', 'damage', 'loss', 'expiry', 'theft', 'write_off' => 'adjustment_out',
                'stocktake' => 'stocktake',
                default => 'adjustment_in',
            };

            InventoryService::recordMovement(
                $product,
                $warehouse,
                $movementType,
                (float) $item->quantity_change,
                [
                    'branch_id' => $branchId,
                    'reference_type' => 'inventory_adjustment',
                    'reference_id' => $adjustment->id,
                    'notes' => $adjustment->reason . ' - ' . ($item->notes ?? ''),
                    'user_id' => $user->id,
                ]
            );

            $item->update([
                'quantity_after' => $item->quantity_before + $item->quantity_change,
            ]);
        }

        $adjustment->update([
            'status' => 'posted',
            'approved_by_user_id' => $user->id,
            'approved_at' => now(),
        ]);

        return response()->json($adjustment->load('items'));
    }

    public function destroy(InventoryAdjustment $adjustment, User $user)
    {
        $this->authorize('delete', $adjustment);

        if ($adjustment->status === 'posted') {
            return response()->json(['message' => 'Posted adjustments cannot be deleted.'], 422);
        }

        $adjustment->delete();

        return response()->json(null, 204);
    }
}

