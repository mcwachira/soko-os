<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Workflow;
use App\Http\Requests\StoreWorkflowRequest;
use App\Http\Requests\UpdateWorkflowRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class WorkflowController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Workflow::class);

        $workflows = Workflow::where('organization_id', $request->user()->organization_id)
            ->with(['business'])
            ->orderBy('priority', 'desc')
            ->paginate($request->integer('per_page', 25));

        return response()->json($workflows);
    }

    public function show(string $id)
    {
        $workflow = Workflow::where('organization_id', request()->user()->organization_id)
            ->with(['business'])
            ->findOrFail($id);

        $this->authorize('view', $workflow);

        return response()->json(['data' => $workflow]);
    }

    public function store(StoreWorkflowRequest $request)
    {
        $this->authorize('create', Workflow::class);

        $user = $request->user();
        $validated = $request->validated();

        $workflow = Workflow::create([
            'id' => Str::uuid()->toString(),
            'organization_id' => $user->organization_id,
            'business_id' => $validated['business_id'] ?? $user->business_id,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'trigger_entity' => $validated['trigger_entity'] ?? null,
            'trigger_event' => $validated['trigger_event'] ?? null,
            'trigger_conditions' => $validated['trigger_conditions'] ?? null,
            'actions' => $validated['actions'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'priority' => $validated['priority'] ?? 0,
            'metadata' => $validated['metadata'] ?? null,
        ]);

        return response()->json(['data' => $workflow->load('business')], 201);
    }

    public function update(UpdateWorkflowRequest $request, string $id)
    {
        $workflow = Workflow::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $workflow);

        $validated = $request->validated();

        $workflow->update($validated);

        return response()->json(['data' => $workflow->load('business')]);
    }

    public function destroy(string $id)
    {
        $workflow = Workflow::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $workflow);

        $workflow->delete();

        return response()->json(['message' => 'Workflow deleted']);
    }
}
