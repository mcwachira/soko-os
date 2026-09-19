<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\DealStage;
use App\Http\Requests\StoreDealStageRequest;
use App\Http\Requests\UpdateDealStageRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DealStageController extends Controller
{
    public function index(Request $request, string $pipelineId)
    {
        $pipeline = \App\Models\Pipeline::where('organization_id', $request->user()->organization_id)
            ->findOrFail($pipelineId);

        $this->authorize('view', $pipeline);

        $stages = $pipeline->stages()
            ->orderBy('position')
            ->get();

        return response()->json(['data' => $stages]);
    }

    public function show(string $pipelineId, string $id)
    {
        $pipeline = \App\Models\Pipeline::where('organization_id', request()->user()->organization_id)
            ->findOrFail($pipelineId);

        $this->authorize('view', $pipeline);

        $stage = $pipeline->stages()->findOrFail($id);

        return response()->json(['data' => $stage]);
    }

    public function store(StoreDealStageRequest $request, string $pipelineId)
    {
        $pipeline = \App\Models\Pipeline::where('organization_id', $request->user()->organization_id)
            ->findOrFail($pipelineId);

        $this->authorize('update', $pipeline);

        $validated = $request->validated();

        $stage = DealStage::create([
            'id' => Str::uuid()->toString(),
            'pipeline_id' => $pipeline->id,
            'name' => $validated['name'],
            'slug' => $validated['slug'] ?? Str::slug($validated['name']),
            'description' => $validated['description'] ?? null,
            'position' => $validated['position'] ?? 0,
            'probability_percentage' => $validated['probability_percentage'] ?? 0,
            'required_fields' => $validated['required_fields'] ?? null,
            'allowed_next_stages' => $validated['allowed_next_stages'] ?? null,
            'rotting_threshold_days' => $validated['rotting_threshold_days'] ?? null,
            'automation' => $validated['automation'] ?? null,
        ]);

        return response()->json(['data' => $stage], 201);
    }

    public function update(UpdateDealStageRequest $request, string $pipelineId, string $id)
    {
        $pipeline = \App\Models\Pipeline::where('organization_id', $request->user()->organization_id)
            ->findOrFail($pipelineId);

        $this->authorize('update', $pipeline);

        $stage = $pipeline->stages()->findOrFail($id);

        $validated = $request->validated();

        $stage->update($validated);

        return response()->json(['data' => $stage]);
    }

    public function destroy(string $pipelineId, string $id)
    {
        $pipeline = \App\Models\Pipeline::where('organization_id', request()->user()->organization_id)
            ->findOrFail($pipelineId);

        $this->authorize('update', $pipeline);

        $stage = $pipeline->stages()->findOrFail($id);

        $stage->delete();

        return response()->json(['message' => 'Stage deleted']);
    }
}
