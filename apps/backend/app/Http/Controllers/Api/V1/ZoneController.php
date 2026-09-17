<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Zone;
use App\Models\User;
use Illuminate\Http\Request;

class ZoneController extends Controller
{
    public function index(Request $request, User $user)
    {
        $query = Zone::where('organization_id', $user->organization_id);
        if ($request->filled('warehouse_id')) {
            $query->where('warehouse_id', $request->warehouse_id);
        }
        return response()->json($query->get());
    }

    public function store(Request $request, User $user)
    {
        $validated = $request->validate([
            'warehouse_id' => 'required|uuid|exists:warehouses,id',
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $zone = Zone::create(array_merge($validated, [
            'organization_id' => $user->organization_id,
            'business_id' => $request->business_id ?? $user->business_id,
        ]));

        return response()->json($zone, 201);
    }

    public function show(Zone $zone, User $user)
    {
        $this->authorize('view', $zone);
        return response()->json($zone);
    }

    public function update(Request $request, Zone $zone, User $user)
    {
        $this->authorize('update', $zone);
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'code' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);
        $zone->update($validated);
        return response()->json($zone);
    }

    public function destroy(Zone $zone, User $user)
    {
        $this->authorize('delete', $zone);
        $zone->delete();
        return response()->json(null, 204);
    }
}
