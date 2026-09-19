<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Batch;
use App\Models\User;
use Illuminate\Http\Request;

class BatchController extends Controller
{
    public function index(Request $request, User $user)
    {
        $query = Batch::where('organization_id', $user->organization_id);
        if ($request->filled('product_id')) {
            $query->where('product_id', $request->product_id);
        }
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
            'product_id' => 'required|uuid|exists:products,id',
            'warehouse_id' => 'required|uuid|exists:warehouses,id',
            'batch_number' => 'required|string|max:255',
            'manufacture_date' => 'nullable|date',
            'expiry_date' => 'nullable|date',
            'supplier' => 'nullable|string|max:255',
            'quantity' => 'required|numeric',
            'unit_cost_minor' => 'integer',
            'status' => 'string|in:active,expired,recalled,quarantined',
        ]);

        $batch = Batch::create(array_merge($validated, [
            'organization_id' => $user->organization_id,
            'business_id' => $request->business_id ?? $user->business_id,
        ]));

        return response()->json($batch, 201);
    }

    public function show(Batch $batch, User $user)
    {
        $this->authorize('view', $batch);
        return response()->json($batch);
    }

    public function update(Request $request, Batch $batch, User $user)
    {
        $this->authorize('update', $batch);
        $validated = $request->validate([
            'batch_number' => 'sometimes|string|max:255',
            'manufacture_date' => 'nullable|date',
            'expiry_date' => 'nullable|date',
            'supplier' => 'nullable|string|max:255',
            'quantity' => 'sometimes|numeric',
            'unit_cost_minor' => 'integer',
            'status' => 'string|in:active,expired,recalled,quarantined',
        ]);
        $batch->update($validated);
        return response()->json($batch);
    }

    public function destroy(Batch $batch, User $user)
    {
        $this->authorize('delete', $batch);
        $batch->delete();
        return response()->json(null, 204);
    }
}
