<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\LandedCost;
use App\Models\User;
use Illuminate\Http\Request;

class LandedCostController extends Controller
{
    public function index(Request $request, User $user)
    {
        $query = LandedCost::where('organization_id', $user->organization_id);
        if ($request->filled('purchase_order_id')) {
            $query->where('purchase_order_id', $request->purchase_order_id);
        }
        return response()->json($query->get());
    }

    public function store(Request $request, User $user)
    {
        $validated = $request->validate([
            'purchase_order_id' => 'required|uuid|exists:purchase_orders,id',
            'grn_id' => 'required|uuid|exists:goods_received_notes,id',
            'costs' => 'required|array',
            'costs.freight' => 'numeric',
            'costs.insurance' => 'numeric',
            'costs.customs_duty' => 'numeric',
            'costs.handling' => 'numeric',
            'costs.storage' => 'numeric',
            'costs.other' => 'numeric',
            'allocation_method' => 'required|string|in:quantity,value,weight,volume,manual',
        ]);

        $totalCostMinor = 0;
        foreach ($validated['costs'] as $cost) {
            $totalCostMinor += ($cost ?? 0) * 100;
        }

        $landedCost = LandedCost::create([
            'organization_id' => $user->organization_id,
            'business_id' => $request->business_id ?? $user->business_id,
            'purchase_order_id' => $validated['purchase_order_id'],
            'grn_id' => $validated['grn_id'],
            'user_id' => $user->id,
            'landed_cost_number' => LandedCost::generateLandedCostNumber(),
            'costs' => $validated['costs'],
            'total_cost_minor' => $totalCostMinor,
            'allocation_method' => $validated['allocation_method'],
            'status' => 'draft',
        ]);

        return response()->json($landedCost, 201);
    }

    public function show(LandedCost $landedCost, User $user)
    {
        $this->authorize('view', $landedCost);
        return response()->json($landedCost->load('allocations'));
    }

    public function destroy(LandedCost $landedCost, User $user)
    {
        $this->authorize('delete', $landedCost);
        $landedCost->delete();
        return response()->json(null, 204);
    }
}
