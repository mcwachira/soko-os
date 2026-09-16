<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\PriceList;
use App\Models\User;
use Illuminate\Http\Request;

class PriceListController extends Controller
{
    public function index(Request $request, User $user)
    {
        $query = PriceList::where('organization_id', $user->organization_id);
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        return response()->json($query->get());
    }

    public function store(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:retail,wholesale,vip,customer_specific,vendor',
            'currency' => 'string|size:3',
            'is_active' => 'boolean',
        ]);

        $priceList = PriceList::create(array_merge($validated, [
            'organization_id' => $user->organization_id,
            'business_id' => $request->business_id ?? $user->business_id,
        ]));

        return response()->json($priceList, 201);
    }

    public function show(PriceList $priceList, User $user)
    {
        $this->authorize('view', $priceList);
        return response()->json($priceList->load('items'));
    }

    public function update(Request $request, PriceList $priceList, User $user)
    {
        $this->authorize('update', $priceList);
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'type' => 'sometimes|string|in:retail,wholesale,vip,customer_specific,vendor',
            'currency' => 'sometimes|string|size:3',
            'is_active' => 'boolean',
        ]);
        $priceList->update($validated);
        return response()->json($priceList);
    }

    public function destroy(PriceList $priceList, User $user)
    {
        $this->authorize('delete', $priceList);
        $priceList->delete();
        return response()->json(null, 204);
    }
}
