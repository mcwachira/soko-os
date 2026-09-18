<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CaseModel;
use App\Http\Requests\StoreCaseRequest;
use App\Http\Requests\UpdateCaseRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CaseController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', CaseModel::class);

        $query = CaseModel::where('organization_id', $request->user()->organization_id)
            ->with(['account', 'contact', 'deal', 'assignedTo']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->has('assigned_to')) {
            $query->where('assigned_to_user_id', $request->assigned_to);
        }

        $cases = $query->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 25));

        return response()->json($cases);
    }

    public function show(string $id)
    {
        $case = CaseModel::where('organization_id', request()->user()->organization_id)
            ->with(['account', 'contact', 'deal', 'assignedTo'])
            ->findOrFail($id);

        $this->authorize('view', $case);

        return response()->json(['data' => $case]);
    }

    public function store(StoreCaseRequest $request)
    {
        $this->authorize('create', CaseModel::class);

        $user = $request->user();
        $validated = $request->validated();

        $case = CaseModel::create([
            'id' => Str::uuid()->toString(),
            'organization_id' => $user->organization_id,
            'business_id' => $validated['business_id'] ?? $user->business_id,
            'account_id' => $validated['account_id'] ?? null,
            'contact_id' => $validated['contact_id'] ?? null,
            'deal_id' => $validated['deal_id'] ?? null,
            'assigned_to_user_id' => $validated['assigned_to_user_id'] ?? $user->id,
            'case_number' => $this->generateCaseNumber($user->organization_id),
            'subject' => $validated['subject'],
            'description' => $validated['description'] ?? null,
            'priority' => $validated['priority'] ?? 'medium',
            'status' => $validated['status'] ?? 'new',
            'category' => $validated['category'] ?? null,
            'channel' => $validated['channel'] ?? null,
            'custom_fields' => $validated['custom_fields'] ?? null,
            'resolution' => $validated['resolution'] ?? null,
        ]);

        return response()->json(['data' => $case->load('account', 'contact', 'deal', 'assignedTo')], 201);
    }

    public function update(UpdateCaseRequest $request, string $id)
    {
        $case = CaseModel::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $case);

        $validated = $request->validated();

        if (isset($validated['status']) && $validated['status'] === 'resolved' && !$case->resolved_at) {
            $validated['resolved_at'] = now();
        }
        if (isset($validated['status']) && $validated['status'] === 'closed' && !$case->closed_at) {
            $validated['closed_at'] = now();
        }

        $case->update($validated);

        return response()->json(['data' => $case->load('account', 'contact', 'deal', 'assignedTo')]);
    }

    public function destroy(string $id)
    {
        $case = CaseModel::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $case);

        $case->delete();

        return response()->json(['message' => 'Case deleted']);
    }

    private function generateCaseNumber(string $organizationId): string
    {
        $count = CaseModel::where('organization_id', $organizationId)->count();
        return 'CASE-'.strtoupper(substr($organizationId, 0, 8)).'-'.str_pad($count + 1, 6, '0', STR_PAD_LEFT);
    }
}
