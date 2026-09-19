<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\SerialNumber;
use App\Models\User;
use Illuminate\Http\Request;

class SerialNumberController extends Controller
{
    public function index(Request $request, User $user)
    {
        $query = SerialNumber::where('organization_id', $user->organization_id);
        if ($request->filled('product_id')) {
            $query->where('product_id', $request->product_id);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        return response()->json($query->get());
    }

    public function store(Request $request, User $user)
    {
        $validated = $request->validate([
            'product_id' => 'required|uuid|exists:products,id',
            'warehouse_id' => 'required|uuid|exists:warehouses,id',
            'serial_number' => 'required|string|max:255',
            'status' => 'string|in:in_stock,reserved,sold,returned,repaired,written_off,disposed',
            'metadata' => 'array',
        ]);

        $serial = SerialNumber::create(array_merge($validated, [
            'organization_id' => $user->organization_id,
            'business_id' => $request->business_id ?? $user->business_id,
        ]));

        return response()->json($serial, 201);
    }

    public function show(SerialNumber $serialNumber, User $user)
    {
        $this->authorize('view', $serialNumber);
        return response()->json($serialNumber);
    }

    public function update(Request $request, SerialNumber $serialNumber, User $user)
    {
        $this->authorize('update', $serialNumber);
        $validated = $request->validate([
            'status' => 'sometimes|string|in:in_stock,reserved,sold,returned,repaired,written_off,disposed',
            'metadata' => 'array',
        ]);
        $serialNumber->update($validated);
        return response()->json($serialNumber);
    }

    public function destroy(SerialNumber $serialNumber, User $user)
    {
        $this->authorize('delete', $serialNumber);
        $serialNumber->delete();
        return response()->json(null, 204);
    }
}
