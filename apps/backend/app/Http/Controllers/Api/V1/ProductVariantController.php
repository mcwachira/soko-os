<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Http\Request;

class ProductVariantController extends Controller
{
    public function index(Request $request, User $user)
    {
        $query = ProductVariant::where('organization_id', $user->organization_id);
        if ($request->filled('product_id')) {
            $query->where('product_id', $request->product_id);
        }
        return response()->json($query->get());
    }

    public function store(Request $request, User $user)
    {
        $validated = $request->validate([
            'product_id' => 'required|uuid|exists:products,id',
            'sku' => 'required|string|max:255',
            'barcode' => 'nullable|string|max:255',
            'attributes' => 'array',
            'cost_price_minor' => 'integer',
            'selling_price_minor' => 'integer',
            'is_active' => 'boolean',
        ]);

        $variant = ProductVariant::create(array_merge($validated, [
            'organization_id' => $user->organization_id,
            'business_id' => $request->business_id ?? $user->business_id,
        ]));

        return response()->json($variant, 201);
    }

    public function show(ProductVariant $variant, User $user)
    {
        $this->authorize('view', $variant);
        return response()->json($variant);
    }

    public function update(Request $request, ProductVariant $variant, User $user)
    {
        $this->authorize('update', $variant);
        $validated = $request->validate([
            'sku' => 'sometimes|string|max:255',
            'barcode' => 'nullable|string|max:255',
            'attributes' => 'array',
            'cost_price_minor' => 'integer',
            'selling_price_minor' => 'integer',
            'is_active' => 'boolean',
        ]);
        $variant->update($validated);
        return response()->json($variant);
    }

    public function destroy(ProductVariant $variant, User $user)
    {
        $this->authorize('delete', $variant);
        $variant->delete();
        return response()->json(null, 204);
    }
}
