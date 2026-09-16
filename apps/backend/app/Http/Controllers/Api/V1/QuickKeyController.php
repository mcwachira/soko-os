<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\QuickKey;
use App\Http\Requests\StoreQuickKeyRequest;
use App\Http\Requests\UpdateQuickKeyRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class QuickKeyController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', QuickKey::class);

        $keys = QuickKey::where('organization_id', $request->user()->organization_id)
            ->when($request->has('branch_id'), fn($q) => $q->where('branch_id', $request->branch_id))
            ->when($request->has('terminal_id'), fn($q) => $q->where('terminal_id', $request->terminal_id))
            ->orderBy('position')
            ->get();

        return response()->json($keys);
    }

    public function store(StoreQuickKeyRequest $request)
    {
        $this->authorize('create', QuickKey::class);

        $validated = $request->validated();
        $user = $request->user();

        $key = QuickKey::create([
            'id' => Str::uuid()->toString(),
            'organization_id' => $user->organization_id,
            'business_id' => $user->business_id,
            'branch_id' => $validated['branch_id'] ?? null,
            'terminal_id' => $validated['terminal_id'] ?? null,
            'name' => $validated['name'],
            'action_type' => $validated['action_type'],
            'action_data' => $validated['action_data'],
            'color' => $validated['color'] ?? '#000000',
            'position' => $validated['position'] ?? 0,
            'is_active' => true,
        ]);

        return response()->json(['data' => $key], 201);
    }

    public function update(UpdateQuickKeyRequest $request, string $id)
    {
        $key = QuickKey::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $key);

        $key->update($request->validated());

        return response()->json(['data' => $key]);
    }

    public function destroy(string $id)
    {
        $key = QuickKey::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $key);

        $key->delete();

        return response()->json(['message' => 'Quick key deleted']);
    }
}
