<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Product;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Product::class);

        $query = Product::where('organization_id', $request->user()->organization_id)
            ->where('is_active', true)
            ->with('category');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                    ->orWhere('sku', 'ilike', "%{$search}%")
                    ->orWhere('barcode', 'ilike', "%{$search}%");
            });
        }

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('barcode')) {
            $query->where('barcode', $request->barcode);
        }

        $products = $query->orderBy('name')
            ->paginate($request->integer('per_page', 50));

        return response()->json($products);
    }

    public function show(string $id)
    {
        $product = Product::where('organization_id', request()->user()->organization_id)
            ->with('category')
            ->findOrFail($id);

        $this->authorize('view', $product);

        return response()->json(['data' => $product]);
    }

    public function store(StoreProductRequest $request)
    {
        $this->authorize('create', Product::class);

        $validated = $request->validated();
        $user = $request->user();

        $product = Product::create([
            'id' => Str::uuid()->toString(),
            'organization_id' => $user->organization_id,
            'business_id' => $user->business_id,
            'category_id' => $validated['category_id'] ?? null,
            'sku' => $validated['sku'],
            'barcode' => $validated['barcode'] ?? null,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'tax_category_code' => $validated['tax_category_code'] ?? 'A',
            'unit' => $validated['unit'] ?? 'pcs',
            'cost_price_minor' => $validated['cost_price_minor'],
            'selling_price_minor' => $validated['selling_price_minor'],
            'reorder_level' => $validated['reorder_level'] ?? 5,
            'track_inventory' => $validated['track_inventory'] ?? true,
            'is_active' => true,
            'version' => 1,
        ]);

        return response()->json(['data' => $product->load('category')], 201);
    }

    public function update(UpdateProductRequest $request, string $id)
    {
        $product = Product::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $product);

        $validated = $request->validated();
        $validated['version'] = $product->version + 1;

        $product->update($validated);

        return response()->json(['data' => $product->load('category')]);
    }

    public function destroy(string $id)
    {
        $product = Product::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $product);

        $product->delete();

        return response()->json(['message' => 'Product deleted']);
    }

    public function search(Request $request)
    {
        $this->authorize('viewAny', Product::class);

        $query = $request->get('q', '');
        $limit = $request->integer('limit', 20);

        if (strlen($query) < 2) {
            return response()->json(['data' => []]);
        }

        $products = Product::where('organization_id', $request->user()->organization_id)
            ->where('is_active', true)
            ->where(function ($q) use ($query) {
                $q->where('name', 'ilike', "%{$query}%")
                    ->orWhere('sku', 'ilike', "%{$query}%")
                    ->orWhere('barcode', 'ilike', "%{$query}%");
            })
            ->limit($limit)
            ->get(['id', 'sku', 'barcode', 'name', 'selling_price_minor', 'tax_category_code', 'unit']);

        return response()->json(['data' => $products]);
    }
}
