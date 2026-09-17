<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Assembly;
use App\Models\User;
use Illuminate\Http\Request;

class AssemblyController extends Controller
{
    public function index(Request $request, User $user)
    {
        $query = Assembly::where('organization_id', $user->organization_id);
        if ($request->filled('warehouse_id')) {
            $query->where('warehouse_id', $request->warehouse_id);
        }
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        return response()->json($query->get());
    }

    public function store(Request $request, User $user)
    {
        $validated = $request->validate([
            'warehouse_id' => 'required|uuid|exists:warehouses,id',
            'finished_product_id' => 'required|uuid|exists:products,id',
            'type' => 'required|string|in:assembly,disassembly,kit',
            'quantity' => 'required|numeric',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|uuid|exists:products,id',
            'items.*.quantity' => 'required|numeric',
            'items.*.unit_cost_minor' => 'integer',
        ]);

        $assembly = Assembly::create([
            'organization_id' => $user->organization_id,
            'business_id' => $request->business_id ?? $user->business_id,
            'warehouse_id' => $validated['warehouse_id'],
            'finished_product_id' => $validated['finished_product_id'],
            'user_id' => $user->id,
            'assembly_number' => Assembly::generateAssemblyNumber(),
            'type' => $validated['type'],
            'quantity' => $validated['quantity'],
            'status' => 'draft',
            'notes' => $validated['notes'] ?? null,
        ]);

        foreach ($validated['items'] as $itemData) {
            $assembly->items()->create($itemData);
        }

        return response()->json($assembly->load('items'), 201);
    }

    public function show(Assembly $assembly, User $user)
    {
        $this->authorize('view', $assembly);
        return response()->json($assembly->load('items'));
    }

    public function complete(Assembly $assembly, User $user)
    {
        $this->authorize('update', $assembly);
        $assembly->update(['status' => 'completed']);
        return response()->json($assembly);
    }

    public function destroy(Assembly $assembly, User $user)
    {
        $this->authorize('delete', $assembly);
        $assembly->delete();
        return response()->json(null, 204);
    }
}
