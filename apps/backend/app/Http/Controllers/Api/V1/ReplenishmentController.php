<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ReplenishmentRule;
use App\Models\ReplenishmentSuggestion;
use Illuminate\Http\Request;

class ReplenishmentController extends Controller
{
    public function rules(Request $request, User $user)
    {
        $query = ReplenishmentRule::where('organization_id', $user->organization_id);
        if ($request->filled('warehouse_id')) {
            $query->where('warehouse_id', $request->warehouse_id);
        }
        return response()->json($query->get());
    }

    public function storeRule(Request $request, User $user)
    {
        $validated = $request->validate([
            'product_id' => 'required|uuid|exists:products,id',
            'warehouse_id' => 'required|uuid|exists:warehouses,id',
            'preferred_supplier_id' => 'nullable|uuid|exists:suppliers,id',
            'reorder_point' => 'required|integer',
            'reorder_quantity' => 'required|integer',
            'minimum_stock' => 'required|integer',
            'maximum_stock' => 'required|integer',
            'safety_stock' => 'required|integer',
            'lead_time_days' => 'required|integer',
        ]);

        $rule = ReplenishmentRule::create(array_merge($validated, [
            'organization_id' => $user->organization_id,
            'business_id' => $request->business_id ?? $user->business_id,
        ]));

        return response()->json($rule, 201);
    }

    public function suggestions(Request $request, User $user)
    {
        $query = ReplenishmentSuggestion::where('organization_id', $user->organization_id);
        if ($request->filled('warehouse_id')) {
            $query->where('warehouse_id', $request->warehouse_id);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        return response()->json($query->get());
    }
}
