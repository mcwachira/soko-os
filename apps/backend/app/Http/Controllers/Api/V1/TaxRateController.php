<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\TaxRate;
use App\Http\Requests\StoreTaxRateRequest;
use App\Http\Requests\UpdateTaxRateRequest;
use Illuminate\Http\Request;

class TaxRateController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', TaxRate::class);

        $taxRates = TaxRate::where('organization_id', $request->user()->organization_id)
            ->orderBy('name')
            ->paginate($request->integer('per_page', 25));

        return response()->json($taxRates);
    }

    public function show(string $id)
    {
        $taxRate = TaxRate::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('view', $taxRate);

        return response()->json(['data' => $taxRate]);
    }

    public function store(StoreTaxRateRequest $request)
    {
        $this->authorize('create', TaxRate::class);

        $validated = $request->validated();
        $user = $request->user();

        $taxRate = TaxRate::create([
            'id' => \Illuminate\Support\Str::uuid()->toString(),
            'organization_id' => $user->organization_id,
            'business_id' => $user->business_id,
            'name' => $validated['name'],
            'code' => $validated['code'],
            'rate_percentage' => $validated['rate_percentage'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json(['data' => $taxRate], 201);
    }

    public function update(UpdateTaxRateRequest $request, string $id)
    {
        $taxRate = TaxRate::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $taxRate);

        $validated = $request->validated();

        $taxRate->update($validated);

        return response()->json(['data' => $taxRate]);
    }

    public function destroy(string $id)
    {
        $taxRate = TaxRate::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $taxRate);

        $taxRate->delete();

        return response()->json(['message' => 'Tax rate deleted']);
    }
}
