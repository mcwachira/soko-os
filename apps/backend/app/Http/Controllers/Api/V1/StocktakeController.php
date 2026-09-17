<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Stocktake;
use App\Models\User;
use App\Services\InventoryService;
use Illuminate\Http\Request;

class StocktakeController extends Controller
{
    public function index(Request $request, User $user)
    {
        $query = Stocktake::where('organization_id', $user->organization_id);
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
            'type' => 'required|string|in:full,zone,category,product,cycle',
            'scope' => 'array',
            'freeze_stock' => 'boolean',
            'blind_count' => 'boolean',
        ]);

        $stocktake = Stocktake::create([
            'organization_id' => $user->organization_id,
            'business_id' => $request->business_id ?? $user->business_id,
            'branch_id' => $validated['branch_id'] ?? $user->branch_id,
            'warehouse_id' => $validated['warehouse_id'],
            'user_id' => $user->id,
            'stocktake_number' => Stocktake::generateStocktakeNumber(),
            'type' => $validated['type'],
            'scope' => $validated['scope'] ?? null,
            'freeze_stock' => $validated['freeze_stock'] ?? false,
            'blind_count' => $validated['blind_count'] ?? false,
            'status' => 'draft',
        ]);

        return response()->json($stocktake, 201);
    }

    public function show(Stocktake $stocktake, User $user)
    {
        $this->authorize('view', $stocktake);
        return response()->json($stocktake->load('items'));
    }

    public function approve(Request $request, Stocktake $stocktake, User $user)
    {
        $this->authorize('update', $stocktake);

        if ($stocktake->status !== 'draft' && $stocktake->status !== 'completed') {
            return response()->json(['message' => 'Stocktake is not ready for approval.'], 422);
        }

        $warehouse = $stocktake->warehouse;

        foreach ($stocktake->items as $item) {
            if ($item->counted_quantity === null) {
                continue;
            }

            $variance = (float) $item->counted_quantity - (float) $item->system_quantity;
            if (abs($variance) < 0.0001) {
                continue;
            }

            $product = \App\Models\Product::find($item->product_id);
            if (! $product || ! $product->track_inventory) {
                continue;
            }

            $movementType = $variance > 0 ? 'stocktake' : 'stocktake';
            InventoryService::recordMovement(
                $product,
                $warehouse,
                $movementType,
                (float) $variance,
                [
                    'branch_id' => $stocktake->branch_id,
                    'reference_type' => 'stocktake',
                    'reference_id' => $stocktake->id,
                    'notes' => 'Stocktake variance correction',
                    'user_id' => $user->id,
                ]
            );
        }

        $stocktake->update([
            'status' => 'posted',
            'approved_by_user_id' => $user->id,
            'approved_at' => now(),
        ]);

        return response()->json($stocktake->load('items'));
    }

    public function destroy(Stocktake $stocktake, User $user)
    {
        $this->authorize('delete', $stocktake);

        if ($stocktake->status === 'posted') {
            return response()->json(['message' => 'Posted stocktakes cannot be deleted.'], 422);
        }

        $stocktake->delete();

        return response()->json(null, 204);
    }
}
