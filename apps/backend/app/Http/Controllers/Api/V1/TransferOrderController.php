<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\TransferOrder;
use App\Models\User;
use App\Services\InventoryService;
use Illuminate\Http\Request;

class TransferOrderController extends Controller
{
    public function index(Request $request, User $user)
    {
        $query = TransferOrder::where('organization_id', $user->organization_id);
        if ($request->filled('source_warehouse_id')) {
            $query->where('source_warehouse_id', $request->source_warehouse_id);
        }
        if ($request->filled('destination_warehouse_id')) {
            $query->where('destination_warehouse_id', $request->destination_warehouse_id);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        return response()->json($query->get());
    }

    public function store(Request $request, User $user)
    {
        $validated = $request->validate([
            'branch_id' => 'required|uuid|exists:branches,id',
            'source_warehouse_id' => 'required|uuid|exists:warehouses,id',
            'destination_warehouse_id' => 'required|uuid|exists:warehouses,id',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|uuid|exists:products,id',
            'items.*.quantity_requested' => 'required|numeric',
        ]);

        $transfer = TransferOrder::create([
            'organization_id' => $user->organization_id,
            'business_id' => $request->business_id ?? $user->business_id,
            'branch_id' => $validated['branch_id'],
            'source_warehouse_id' => $validated['source_warehouse_id'],
            'destination_warehouse_id' => $validated['destination_warehouse_id'],
            'user_id' => $user->id,
            'transfer_number' => TransferOrder::generateTransferNumber(),
            'status' => 'draft',
            'notes' => $validated['notes'] ?? null,
        ]);

        foreach ($validated['items'] as $itemData) {
            $transfer->items()->create($itemData);
        }

        return response()->json($transfer->load('items'), 201);
    }

    public function show(TransferOrder $transferOrder, User $user)
    {
        $this->authorize('view', $transferOrder);
        return response()->json($transferOrder->load('items'));
    }

    public function approve(Request $request, TransferOrder $transferOrder, User $user)
    {
        $this->authorize('update', $transferOrder);
        $transferOrder->update(['status' => 'approved']);
        return response()->json($transferOrder);
    }

    public function dispatch(Request $request, TransferOrder $transferOrder, User $user)
    {
        $this->authorize('update', $transferOrder);

        if ($transferOrder->status !== 'approved') {
            return response()->json(['message' => 'Transfer must be approved before dispatch.'], 422);
        }

        $sourceWarehouse = $transferOrder->sourceWarehouse;
        $branchId = $transferOrder->branch_id;

        foreach ($transferOrder->items as $item) {
            $product = \App\Models\Product::find($item->product_id);
            if (! $product || ! $product->track_inventory) {
                continue;
            }

            $qty = (float) $item->quantity_requested;

            $available = InventoryService::getAvailableQuantity($product, $sourceWarehouse);
            if ($available < $qty) {
                return response()->json([
                    'message' => "Insufficient stock for {$product->name}. Available: {$available}, requested: {$qty}.",
                ], 422);
            }

            InventoryService::recordMovement(
                $product,
                $sourceWarehouse,
                'transfer_out',
                -$qty,
                [
                    'branch_id' => $branchId,
                    'reference_type' => 'transfer_order',
                    'reference_id' => $transferOrder->id,
                    'notes' => 'Transfer dispatched to ' . $transferOrder->destinationWarehouse->name,
                    'user_id' => $user->id,
                ]
            );
        }

        $transferOrder->update([
            'status' => 'in_transit',
            'dispatched_at' => now(),
        ]);

        return response()->json($transferOrder);
    }

    public function receive(Request $request, TransferOrder $transferOrder, User $user)
    {
        $this->authorize('update', $transferOrder);

        if ($transferOrder->status !== 'in_transit') {
            return response()->json(['message' => 'Transfer must be in transit before receiving.'], 422);
        }

        $destinationWarehouse = $transferOrder->destinationWarehouse;
        $branchId = $transferOrder->branch_id;

        foreach ($transferOrder->items as $item) {
            $product = \App\Models\Product::find($item->product_id);
            if (! $product || ! $product->track_inventory) {
                continue;
            }

            $qty = (float) $item->quantity_requested;

            InventoryService::recordMovement(
                $product,
                $destinationWarehouse,
                'transfer_in',
                $qty,
                [
                    'branch_id' => $branchId,
                    'reference_type' => 'transfer_order',
                    'reference_id' => $transferOrder->id,
                    'notes' => 'Transfer received from ' . $transferOrder->sourceWarehouse->name,
                    'user_id' => $user->id,
                ]
            );
        }

        $transferOrder->update([
            'status' => 'completed',
            'received_at' => now(),
        ]);

        return response()->json($transferOrder);
    }

    public function destroy(TransferOrder $transferOrder, User $user)
    {
        $this->authorize('delete', $transferOrder);

        if (in_array($transferOrder->status, ['in_transit', 'completed'])) {
            return response()->json(['message' => 'Transfers in progress or completed cannot be deleted.'], 422);
        }

        $transferOrder->delete();

        return response()->json(null, 204);
    }
}
