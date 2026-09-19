<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Bin;
use App\Models\User;
use Illuminate\Http\Request;

class BinController extends Controller
{
    public function index(Request $request, User $user)
    {
        $query = Bin::where('organization_id', $user->organization_id);
        if ($request->filled('warehouse_id')) {
            $query->where('warehouse_id', $request->warehouse_id);
        }
        if ($request->filled('zone_id')) {
            $query->where('zone_id', $request->zone_id);
        }
        return response()->json($query->get());
    }

    public function store(Request $request, User $user)
    {
        $validated = $request->validate([
            'warehouse_id' => 'required|uuid|exists:warehouses,id',
            'zone_id' => 'nullable|uuid|exists:zones,id',
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:100',
            'aisle' => 'nullable|string|max:50',
            'rack' => 'nullable|string|max:50',
            'shelf' => 'nullable|string|max:50',
            'capacity' => 'nullable|numeric',
            'status' => 'string|in:active,inactive,blocked',
            'pick_priority' => 'integer',
            'putaway_priority' => 'integer',
        ]);

        $bin = Bin::create(array_merge($validated, [
            'organization_id' => $user->organization_id,
            'business_id' => $request->business_id ?? $user->business_id,
        ]));

        return response()->json($bin, 201);
    }

    public function show(Bin $bin, User $user)
    {
        $this->authorize('view', $bin);
        return response()->json($bin);
    }

    public function update(Request $request, Bin $bin, User $user)
    {
        $this->authorize('update', $bin);
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'code' => 'nullable|string|max:100',
            'aisle' => 'nullable|string|max:50',
            'rack' => 'nullable|string|max:50',
            'shelf' => 'nullable|string|max:50',
            'capacity' => 'nullable|numeric',
            'status' => 'string|in:active,inactive,blocked',
            'pick_priority' => 'integer',
            'putaway_priority' => 'integer',
        ]);
        $bin->update($validated);
        return response()->json($bin);
    }

    public function destroy(Bin $bin, User $user)
    {
        $this->authorize('delete', $bin);
        $bin->delete();
        return response()->json(null, 204);
    }
}
