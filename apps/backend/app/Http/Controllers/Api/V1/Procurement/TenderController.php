<?php

namespace App\Http\Controllers\Api\V1\Procurement;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTenderRequest;
use App\Http\Requests\UpdateTenderRequest;
use App\Models\Tender;
use Illuminate\Http\Request;

class TenderController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Tender::class);

        $query = Tender::where('organization_id', $request->user()->organization_id)
            ->with(['business', 'branch']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $tenders = $query->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 25));

        return response()->json($tenders);
    }

    public function show(string $id)
    {
        $tender = Tender::where('organization_id', request()->user()->organization_id)
            ->with(['business', 'branch', 'documents', 'bids', 'evaluations', 'award'])
            ->findOrFail($id);

        $this->authorize('view', $tender);

        return response()->json(['data' => $tender]);
    }

    public function store(StoreTenderRequest $request)
    {
        $this->authorize('create', Tender::class);

        $validated = $request->validated();
        $user = $request->user();

        $tender = Tender::create([
            'organization_id' => $user->organization_id,
            'business_id' => $validated['business_id'] ?? null,
            'branch_id' => $validated['branch_id'] ?? null,
            'tender_number' => $validated['tender_number'],
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'] ?? 'draft',
            'submission_deadline' => $validated['submission_deadline'] ?? null,
            'opening_date' => $validated['opening_date'] ?? null,
            'evaluation_criteria' => $validated['evaluation_criteria'] ?? null,
            'created_by_user_id' => $user->id,
            'custom_fields' => $validated['custom_fields'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json(['data' => $tender], 201);
    }

    public function update(UpdateTenderRequest $request, string $id)
    {
        $tender = Tender::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $tender);

        $validated = $request->validated();

        $tender->update($validated);

        return response()->json(['data' => $tender]);
    }

    public function destroy(string $id)
    {
        $tender = Tender::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $tender);

        $tender->delete();

        return response()->json(['message' => 'Tender deleted']);
    }
}
