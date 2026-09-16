<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Warehouse;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class WarehouseController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Warehouse::class);

        $warehouses = Warehouse::where('organization_id', $request->user()->organization_id)
            ->with('branch')
            ->orderBy('name')
            ->paginate($request->integer('per_page', 50));

        return response()->json($warehouses);
    }

    public function show(string $id)
    {
        $warehouse = Warehouse::where('organization_id', request()->user()->organization_id)
            ->with('branch')
            ->findOrFail($id);

        $this->authorize('view', $warehouse);

        return response()->json(['data' => $warehouse]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Warehouse::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50',
            'branch_id' => 'required|uuid|exists:branches,id',
        ]);

        $user = $request->user();

        $warehouse = Warehouse::create([
            'id' => Str::uuid()->toString(),
            'organization_id' => $user->organization_id,
            'business_id' => $user->business_id,
            'branch_id' => $validated['branch_id'],
            'name' => $validated['name'],
            'code' => $validated['code'],
            'is_active' => true,
        ]);

        return response()->json(['data' => $warehouse->load('branch')], 201);
    }

    public function update(Request $request, string $id)
    {
        $warehouse = Warehouse::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $warehouse);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'code' => 'sometimes|string|max:50',
            'branch_id' => ['sometimes', 'uuid', 'exists:branches,id'],
        ]);

        $warehouse->update($validated);

        return response()->json(['data' => $warehouse->load('branch')]);
    }

    public function destroy(string $id)
    {
        $warehouse = Warehouse::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $warehouse);

        $warehouse->delete();

        return response()->json(['message' => 'Warehouse deleted']);
    }
}
