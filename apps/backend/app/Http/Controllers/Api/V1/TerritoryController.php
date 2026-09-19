<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Territory;
use App\Http\Requests\StoreTerritoryRequest;
use App\Http\Requests\UpdateTerritoryRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TerritoryController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Territory::class);

        $query = Territory::where('organization_id', $request->user()->organization_id);

        if ($request->has('country_code')) {
            $query->where('country_code', $request->country_code);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $territories = $query->with('parent')
            ->orderBy('name')
            ->paginate($request->integer('per_page', 50));

        return response()->json($territories);
    }

    public function show(string $id)
    {
        $territory = Territory::where('organization_id', request()->user()->organization_id)
            ->with('parent')
            ->findOrFail($id);

        $this->authorize('view', $territory);

        return response()->json(['data' => $territory]);
    }

    public function store(StoreTerritoryRequest $request)
    {
        $this->authorize('create', Territory::class);

        $user = $request->user();
        $validated = $request->validated();

        $territory = Territory::create([
            'id' => Str::uuid()->toString(),
            'organization_id' => $user->organization_id,
            'name' => $validated['name'],
            'code' => $validated['code'] ?? null,
            'type' => $validated['type'] ?? 'region',
            'country_code' => $validated['country_code'] ?? 'KE',
            'parent_territory_id' => $validated['parent_territory_id'] ?? null,
            'metadata' => $validated['metadata'] ?? null,
        ]);

        return response()->json(['data' => $territory->load('parent')], 201);
    }

    public function update(UpdateTerritoryRequest $request, string $id)
    {
        $territory = Territory::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $territory);

        $validated = $request->validated();

        $territory->update($validated);

        return response()->json(['data' => $territory->load('parent')]);
    }

    public function destroy(string $id)
    {
        $territory = Territory::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $territory);

        $territory->delete();

        return response()->json(['message' => 'Territory deleted']);
    }
}
