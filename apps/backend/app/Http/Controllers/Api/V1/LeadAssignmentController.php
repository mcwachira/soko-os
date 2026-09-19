<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\LeadAssignment;
use App\Http\Requests\StoreLeadAssignmentRequest;
use App\Http\Requests\UpdateLeadAssignmentRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class LeadAssignmentController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', LeadAssignment::class);

        $assignments = LeadAssignment::where('organization_id', $request->user()->organization_id)
            ->orderBy('rule_name')
            ->paginate($request->integer('per_page', 25));

        return response()->json($assignments);
    }

    public function show(string $id)
    {
        $assignment = LeadAssignment::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('view', $assignment);

        return response()->json(['data' => $assignment]);
    }

    public function store(StoreLeadAssignmentRequest $request)
    {
        $this->authorize('create', LeadAssignment::class);

        $user = $request->user();
        $validated = $request->validated();

        $assignment = LeadAssignment::create([
            'id' => Str::uuid()->toString(),
            'organization_id' => $user->organization_id,
            'rule_name' => $validated['rule_name'],
            'assignment_type' => $validated['assignment_type'] ?? 'round_robin',
            'criteria' => $validated['criteria'] ?? null,
            'assignees' => $validated['assignees'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json(['data' => $assignment], 201);
    }

    public function update(UpdateLeadAssignmentRequest $request, string $id)
    {
        $assignment = LeadAssignment::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $assignment);

        $validated = $request->validated();

        $assignment->update($validated);

        return response()->json(['data' => $assignment]);
    }

    public function destroy(string $id)
    {
        $assignment = LeadAssignment::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $assignment);

        $assignment->delete();

        return response()->json(['message' => 'Lead assignment rule deleted']);
    }
}
