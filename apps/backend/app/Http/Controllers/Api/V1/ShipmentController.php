<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Shipment;
use App\Models\User;
use Illuminate\Http\Request;

class ShipmentController extends Controller
{
    public function index(Request $request, User $user)
    {
        $query = Shipment::where('organization_id', $user->organization_id);
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
            'sale_id' => 'nullable|uuid|exists:sales,id',
            'sales_order_id' => 'nullable|uuid|exists:sales_orders,id',
            'warehouse_id' => 'required|uuid|exists:warehouses,id',
            'carrier' => 'nullable|string|max:255',
            'tracking_number' => 'nullable|string|max:255',
            'shipping_label_url' => 'nullable|url',
            'notes' => 'nullable|string',
        ]);

        $shipment = Shipment::create([
            'organization_id' => $user->organization_id,
            'business_id' => $request->business_id ?? $user->business_id,
            'sale_id' => $validated['sale_id'] ?? null,
            'sales_order_id' => $validated['sales_order_id'] ?? null,
            'warehouse_id' => $validated['warehouse_id'],
            'shipment_number' => Shipment::generateShipmentNumber(),
            'status' => 'pending',
            'carrier' => $validated['carrier'] ?? null,
            'tracking_number' => $validated['tracking_number'] ?? null,
            'shipping_label_url' => $validated['shipping_label_url'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json($shipment, 201);
    }

    public function show(Shipment $shipment, User $user)
    {
        $this->authorize('view', $shipment);
        return response()->json($shipment->load('items'));
    }

    public function update(Request $request, Shipment $shipment, User $user)
    {
        $this->authorize('update', $shipment);
        $validated = $request->validate([
            'status' => 'sometimes|string|in:pending,picked_up,in_transit,out_for_delivery,delivered,failed,returned',
            'tracking_number' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);
        $shipment->update($validated);
        return response()->json($shipment);
    }

    public function destroy(Shipment $shipment, User $user)
    {
        $this->authorize('delete', $shipment);
        $shipment->delete();
        return response()->json(null, 204);
    }
}
