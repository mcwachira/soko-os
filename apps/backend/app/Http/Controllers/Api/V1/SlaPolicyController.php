<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\SlaPolicy;
use App\Http\Requests\StoreSlaPolicyRequest;
use App\Http\Requests\UpdateSlaPolicyRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SlaPolicyController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', SlaPolicy::class);

        $policies = SlaPolicy::where('organization_id', $request->user()->organization_id)
            ->with(['business'])
            ->orderBy('name')
            ->paginate($request->integer('per_page', 25));

        return response()->json($policies);
    }

    public function show(string $id)
    {
        $policy = SlaPolicy::where('organization_id', request()->user()->organization_id)
            ->with(['business'])
            ->findOrFail($id);

        $this->authorize('view', $policy);

        return response()->json(['data' => $policy]);
    }

    public function store(StoreSlaPolicyRequest $request)
    {
        $this->authorize('create', SlaPolicy::class);

        $user = $request->user();
        $validated = $request->validated();

        $policy = SlaPolicy::create([
            'id' => Str::uuid()->toString(),
            'organization_id' => $user->organization_id,
            'business_id' => $validated['business_id'] ?? $user->business_id,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'applies_to_entity' => $validated['applies_to_entity'] ?? 'lead',
            'sla_type' => $validated['sla_type'] ?? 'first_response',
            'threshold_minutes' => $validated['threshold_minutes'] ?? null,
            'threshold_hours' => $validated['threshold_hours'] ?? null,
            'threshold_days' => $validated['threshold_days'] ?? null,
            'business_hours' => $validated['business_hours'] ?? null,
            'escalation_rules' => $validated['escalation_rules'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json(['data' => $policy->load('business')], 201);
    }

    public function update(UpdateSlaPolicyRequest $request, string $id)
    {
        $policy = SlaPolicy::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $policy);

        $validated = $request->validated();

        $policy->update($validated);

        return response()->json(['data' => $policy->load('business')]);
    }

    public function destroy(string $id)
    {
        $policy = SlaPolicy::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $policy);

        $policy->delete();

        return response()->json(['message' => 'SLA policy deleted']);
    }
}
