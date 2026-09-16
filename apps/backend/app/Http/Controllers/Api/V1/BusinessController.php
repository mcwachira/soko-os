<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Business;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BusinessController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Business::class);

        $businesses = Business::where('organization_id', $request->user()->organization_id)
            ->orderBy('name')
            ->paginate($request->integer('per_page', 50));

        return response()->json($businesses);
    }

    public function show(string $id)
    {
        $business = Business::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('view', $business);

        return response()->json(['data' => $business]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Business::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'business_type' => 'required|string|max:100',
            'tax_pin' => 'nullable|string|max:50',
            'currency' => 'required|string|size:3',
        ]);

        $user = $request->user();

        $business = Business::create([
            'id' => Str::uuid()->toString(),
            'organization_id' => $user->organization_id,
            'name' => $validated['name'],
            'business_type' => $validated['business_type'],
            'tax_pin' => $validated['tax_pin'],
            'currency' => $validated['currency'],
            'is_active' => true,
        ]);

        return response()->json(['data' => $business], 201);
    }

    public function update(Request $request, string $id)
    {
        $business = Business::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $business);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'business_type' => 'sometimes|string|max:100',
            'tax_pin' => 'nullable|string|max:50',
            'currency' => 'sometimes|string|size:3',
        ]);

        $business->update($validated);

        return response()->json(['data' => $business]);
    }

    public function destroy(string $id)
    {
        $business = Business::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $business);

        $business->delete();

        return response()->json(['message' => 'Business deleted']);
    }
}
