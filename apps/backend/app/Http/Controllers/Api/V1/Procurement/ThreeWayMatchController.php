<?php

namespace App\Http\Controllers\Api\V1\Procurement;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreThreeWayMatchRequest;
use App\Http\Requests\UpdateThreeWayMatchRequest;
use App\Models\ThreeWayMatch;
use Illuminate\Http\Request;

class ThreeWayMatchController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', ThreeWayMatch::class);

        $query = ThreeWayMatch::where('organization_id', $request->user()->organization_id)
            ->with(['business', 'purchaseOrder', 'supplierInvoice']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $matches = $query->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 25));

        return response()->json($matches);
    }

    public function show(string $id)
    {
        $match = ThreeWayMatch::where('organization_id', request()->user()->organization_id)
            ->with(['business', 'purchaseOrder', 'grn', 'supplierInvoice', 'lines'])
            ->findOrFail($id);

        $this->authorize('view', $match);

        return response()->json(['data' => $match]);
    }

    public function store(StoreThreeWayMatchRequest $request)
    {
        $this->authorize('create', ThreeWayMatch::class);

        $validated = $request->validated();
        $user = $request->user();

        $match = ThreeWayMatch::create([
            'organization_id' => $user->organization_id,
            'business_id' => $validated['business_id'] ?? null,
            'purchase_order_id' => $validated['purchase_order_id'],
            'grn_id' => $validated['grn_id'] ?? null,
            'supplier_invoice_id' => $validated['supplier_invoice_id'],
            'status' => $validated['status'] ?? 'pending',
            'mismatches' => $validated['mismatches'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json(['data' => $match->load('lines')], 201);
    }

    public function update(UpdateThreeWayMatchRequest $request, string $id)
    {
        $match = ThreeWayMatch::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $match);

        $validated = $request->validated();

        $match->update($validated);

        return response()->json(['data' => $match->load('lines')]);
    }

    public function destroy(string $id)
    {
        $match = ThreeWayMatch::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $match);

        $match->delete();

        return response()->json(['message' => 'Three-way match deleted']);
    }
}
