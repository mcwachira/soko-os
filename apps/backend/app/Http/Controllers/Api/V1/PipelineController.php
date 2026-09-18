<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Pipeline;
use App\Http\Requests\StorePipelineRequest;
use App\Http\Requests\UpdatePipelineRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PipelineController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Pipeline::class);

        $pipelines = Pipeline::where('organization_id', $request->user()->organization_id)
            ->with(['business', 'stages'])
            ->orderBy('name')
            ->paginate($request->integer('per_page', 25));

        return response()->json($pipelines);
    }

    public function show(string $id)
    {
        $pipeline = Pipeline::where('organization_id', request()->user()->organization_id)
            ->with(['business', 'stages'])
            ->findOrFail($id);

        $this->authorize('view', $pipeline);

        return response()->json(['data' => $pipeline]);
    }

    public function store(StorePipelineRequest $request)
    {
        $this->authorize('create', Pipeline::class);

        $user = $request->user();
        $validated = $request->validated();

        $pipeline = Pipeline::create([
            'id' => Str::uuid()->toString(),
            'organization_id' => $user->organization_id,
            'business_id' => $validated['business_id'] ?? $user->business_id,
            'name' => $validated['name'],
            'slug' => $validated['slug'] ?? Str::slug($validated['name']),
            'description' => $validated['description'] ?? null,
            'type' => $validated['type'] ?? 'sales',
            'is_active' => $validated['is_active'] ?? true,
            'is_default' => $validated['is_default'] ?? false,
            'settings' => $validated['settings'] ?? null,
        ]);

        return response()->json(['data' => $pipeline->load('stages')], 201);
    }

    public function update(UpdatePipelineRequest $request, string $id)
    {
        $pipeline = Pipeline::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $pipeline);

        $validated = $request->validated();

        $pipeline->update($validated);

        return response()->json(['data' => $pipeline->load('stages')]);
    }

    public function destroy(string $id)
    {
        $pipeline = Pipeline::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $pipeline);

        $pipeline->delete();

        return response()->json(['message' => 'Pipeline deleted']);
    }
}
