<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Sequence;
use App\Http\Requests\StoreSequenceRequest;
use App\Http\Requests\UpdateSequenceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SequenceController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Sequence::class);

        $sequences = Sequence::where('organization_id', $request->user()->organization_id)
            ->orderBy('name')
            ->paginate($request->integer('per_page', 25));

        return response()->json($sequences);
    }

    public function show(string $id)
    {
        $sequence = Sequence::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('view', $sequence);

        return response()->json(['data' => $sequence]);
    }

    public function store(StoreSequenceRequest $request)
    {
        $this->authorize('create', Sequence::class);

        $user = $request->user();
        $validated = $request->validated();

        $sequence = Sequence::create([
            'id' => Str::uuid()->toString(),
            'organization_id' => $user->organization_id,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'target_entity' => $validated['target_entity'] ?? 'lead',
            'status' => $validated['status'] ?? 'draft',
            'total_steps' => count($validated['steps'] ?? []),
            'steps' => $validated['steps'] ?? [],
            'settings' => $validated['settings'] ?? null,
        ]);

        return response()->json(['data' => $sequence], 201);
    }

    public function update(UpdateSequenceRequest $request, string $id)
    {
        $sequence = Sequence::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $sequence);

        $validated = $request->validated();

        if (isset($validated['steps'])) {
            $validated['total_steps'] = count($validated['steps']);
        }

        $sequence->update($validated);

        return response()->json(['data' => $sequence]);
    }

    public function destroy(string $id)
    {
        $sequence = Sequence::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $sequence);

        $sequence->delete();

        return response()->json(['message' => 'Sequence deleted']);
    }
}
