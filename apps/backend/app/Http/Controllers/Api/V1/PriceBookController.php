<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\PriceBook;
use App\Http\Requests\StorePriceBookRequest;
use App\Http\Requests\UpdatePriceBookRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PriceBookController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', PriceBook::class);

        $priceBooks = PriceBook::where('organization_id', $request->user()->organization_id)
            ->with(['business'])
            ->orderBy('name')
            ->paginate($request->integer('per_page', 25));

        return response()->json($priceBooks);
    }

    public function show(string $id)
    {
        $priceBook = PriceBook::where('organization_id', request()->user()->organization_id)
            ->with(['business', 'items.product'])
            ->findOrFail($id);

        $this->authorize('view', $priceBook);

        return response()->json(['data' => $priceBook]);
    }

    public function store(StorePriceBookRequest $request)
    {
        $this->authorize('create', PriceBook::class);

        $user = $request->user();
        $validated = $request->validated();

        $priceBook = PriceBook::create([
            'id' => Str::uuid()->toString(),
            'organization_id' => $user->organization_id,
            'business_id' => $validated['business_id'] ?? $user->business_id,
            'name' => $validated['name'],
            'type' => $validated['type'] ?? 'retail',
            'currency' => $validated['currency'] ?? 'KES',
            'is_active' => $validated['is_active'] ?? true,
            'is_default' => $validated['is_default'] ?? false,
        ]);

        return response()->json(['data' => $priceBook->load('business')], 201);
    }

    public function update(UpdatePriceBookRequest $request, string $id)
    {
        $priceBook = PriceBook::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $priceBook);

        $validated = $request->validated();

        $priceBook->update($validated);

        return response()->json(['data' => $priceBook->load('business')]);
    }

    public function destroy(string $id)
    {
        $priceBook = PriceBook::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $priceBook);

        $priceBook->delete();

        return response()->json(['message' => 'Price book deleted']);
    }
}
