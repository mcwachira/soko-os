<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\LeadScoringRule;
use App\Http\Requests\StoreLeadScoringRuleRequest;
use App\Http\Requests\UpdateLeadScoringRuleRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class LeadScoringRuleController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', LeadScoringRule::class);

        $rules = LeadScoringRule::where('organization_id', $request->user()->organization_id)
            ->orderBy('name')
            ->paginate($request->integer('per_page', 25));

        return response()->json($rules);
    }

    public function show(string $id)
    {
        $rule = LeadScoringRule::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('view', $rule);

        return response()->json(['data' => $rule]);
    }

    public function store(StoreLeadScoringRuleRequest $request)
    {
        $this->authorize('create', LeadScoringRule::class);

        $user = $request->user();
        $validated = $request->validated();

        $rule = LeadScoringRule::create([
            'id' => Str::uuid()->toString(),
            'organization_id' => $user->organization_id,
            'name' => $validated['name'],
            'condition_type' => $validated['condition_type'] ?? 'event',
            'condition_field' => $validated['condition_field'] ?? null,
            'condition_operator' => $validated['condition_operator'] ?? null,
            'condition_value' => $validated['condition_value'] ?? null,
            'score_change' => $validated['score_change'] ?? 0,
            'is_decay' => $validated['is_decay'] ?? false,
            'decay_after_hours' => $validated['decay_after_hours'] ?? null,
            'decay_amount' => $validated['decay_amount'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json(['data' => $rule], 201);
    }

    public function update(UpdateLeadScoringRuleRequest $request, string $id)
    {
        $rule = LeadScoringRule::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $rule);

        $validated = $request->validated();

        $rule->update($validated);

        return response()->json(['data' => $rule]);
    }

    public function destroy(string $id)
    {
        $rule = LeadScoringRule::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $rule);

        $rule->delete();

        return response()->json(['message' => 'Lead scoring rule deleted']);
    }
}
