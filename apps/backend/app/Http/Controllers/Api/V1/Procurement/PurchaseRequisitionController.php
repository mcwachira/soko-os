<?php

namespace App\Http\Controllers\Api\V1\Procurement;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePurchaseRequisitionRequest;
use App\Http\Requests\UpdatePurchaseRequisitionRequest;
use App\Models\PurchaseRequisition;
use Illuminate\Http\Request;

class PurchaseRequisitionController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', PurchaseRequisition::class);

        $query = PurchaseRequisition::where('organization_id', $request->user()->organization_id)
            ->with(['business', 'branch', 'warehouse']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }

        $purchaseRequisitions = $query->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 25));

        return response()->json($purchaseRequisitions);
    }

    public function show(string $id)
    {
        $purchaseRequisition = PurchaseRequisition::where('organization_id', request()->user()->organization_id)
            ->with(['business', 'branch', 'warehouse', 'lines', 'approvals.approver'])
            ->findOrFail($id);

        $this->authorize('view', $purchaseRequisition);

        return response()->json(['data' => $purchaseRequisition]);
    }

    public function store(StorePurchaseRequisitionRequest $request)
    {
        $this->authorize('create', PurchaseRequisition::class);

        $validated = $request->validated();
        $user = $request->user();

        $purchaseRequisition = PurchaseRequisition::create([
            'organization_id' => $user->organization_id,
            'business_id' => $validated['business_id'] ?? null,
            'branch_id' => $validated['branch_id'] ?? null,
            'warehouse_id' => $validated['warehouse_id'] ?? null,
            'requester_user_id' => $user->id,
            'department' => $validated['department'] ?? null,
            'cost_center' => $validated['cost_center'] ?? null,
            'project_id' => $validated['project_id'] ?? null,
            'priority' => $validated['priority'] ?? 'medium',
            'required_date' => $validated['required_date'] ?? null,
            'reason' => $validated['reason'] ?? null,
            'budget_minor' => $validated['budget_minor'] ?? null,
            'currency' => $validated['currency'] ?? 'KES',
            'status' => $validated['status'] ?? 'draft',
            'custom_fields' => $validated['custom_fields'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json(['data' => $purchaseRequisition->load('lines')], 201);
    }

    public function update(UpdatePurchaseRequisitionRequest $request, string $id)
    {
        $purchaseRequisition = PurchaseRequisition::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $purchaseRequisition);

        $validated = $request->validated();

        $purchaseRequisition->update($validated);

        return response()->json(['data' => $purchaseRequisition->load('lines')]);
    }

    public function destroy(string $id)
    {
        $purchaseRequisition = PurchaseRequisition::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $purchaseRequisition);

        $purchaseRequisition->delete();

        return response()->json(['message' => 'Purchase requisition deleted']);
    }

    public function approve(Request $request, string $id)
    {
        $purchaseRequisition = PurchaseRequisition::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('approve', $purchaseRequisition);

        $purchaseRequisition->update(['status' => 'approved']);

        return response()->json(['data' => $purchaseRequisition->load('lines', 'approvals')]);
    }
}
