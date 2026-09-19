<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UnitController extends Controller
{
    public function index(Request $request, User $user)
    {
        $query = Unit::where('organization_id', $user->organization_id);
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        return response()->json($query->get());
    }

    public function store(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'symbol' => 'required|string|max:50',
            'type' => 'required|string|in:base,purchase,warehouse,sales',
            'is_base' => 'boolean',
        ]);

        $unit = Unit::create(array_merge($validated, [
            'organization_id' => $user->organization_id,
        ]));

        return response()->json($unit, 201);
    }

    public function show(Unit $unit, User $user)
    {
        $this->authorize('view', $unit);
        return response()->json($unit);
    }

    public function update(Request $request, Unit $unit, User $user)
    {
        $this->authorize('update', $unit);
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'symbol' => 'sometimes|string|max:50',
            'type' => 'sometimes|string|in:base,purchase,warehouse,sales',
            'is_base' => 'boolean',
        ]);
        $unit->update($validated);
        return response()->json($unit);
    }

    public function destroy(Unit $unit, User $user)
    {
        $this->authorize('delete', $unit);
        $unit->delete();
        return response()->json(null, 204);
    }
}
