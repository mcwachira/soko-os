<?php

namespace App\Http\Controllers\Api\V1\Procurement;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreApprovalRuleRequest;
use App\Http\Requests\UpdateApprovalRuleRequest;
use App\Models\ApprovalRule;
use Illuminate\Http\Request;

class ApprovalRuleController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', ApprovalRule::class);

        $query = ApprovalRule::where('organization_id', $request->user()->organization_id)
            ->with(['branch', 'steps']);

        if ($request->has('entity_type')) {
            $query->where('entity_type', $request->entity_type);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $approvalRules = $query->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 25));

        return response()->json($approvalRules);
    }

    public function show(string $id)
    {
        $approvalRule = ApprovalRule::where('organization_id', request()->user()->organization_id)
            ->with(['branch', 'steps.approver', 'steps.escalationUser'])
            ->findOrFail($id);

        $this->authorize('view', $approvalRule);

        return response()->json(['data' => $approvalRule]);
    }

    public function store(StoreApprovalRuleRequest $request)
    {
        $this->authorize('create', ApprovalRule::class);

        $validated = $request->validated();
        $user = $request->user();

        $approvalRule = ApprovalRule::create([
            'organization_id' => $user->organization_id,
            'entity_type' => $validated['entity_type'],
            'min_amount_minor' => $validated['min_amount_minor'] ?? null,
            'max_amount_minor' => $validated['max_amount_minor'] ?? null,
            'department' => $validated['department'] ?? null,
            'branch_id' => $validated['branch_id'] ?? null,
            'supplier_id' => $validated['supplier_id'] ?? null,
            'category' => $validated['category'] ?? null,
            'cost_center' => $validated['cost_center'] ?? null,
            'project_id' => $validated['project_id'] ?? null,
            'currency' => $validated['currency'] ?? 'KES',
            'purchase_type' => $validated['purchase_type'] ?? null,
            'risk' => $validated['risk'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json(['data' => $approvalRule->load('steps')], 201);
    }

    public function update(UpdateApprovalRuleRequest $request, string $id)
    {
        $approvalRule = ApprovalRule::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $approvalRule);

        $validated = $request->validated();

        $approvalRule->update($validated);

        return response()->json(['data' => $approvalRule->load('steps')]);
    }

    public function destroy(string $id)
    {
        $approvalRule = ApprovalRule::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $approvalRule);

        $approvalRule->delete();

        return response()->json(['message' => 'Approval rule deleted']);
    }
}
