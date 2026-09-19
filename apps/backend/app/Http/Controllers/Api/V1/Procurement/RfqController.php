<?php

namespace App\Http\Controllers\Api\V1\Procurement;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRfqRequest;
use App\Http\Requests\UpdateRfqRequest;
use App\Models\Rfq;
use Illuminate\Http\Request;

class RfqController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Rfq::class);

        $query = Rfq::where('organization_id', $request->user()->organization_id)
            ->with(['business', 'branch', 'warehouse']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $rfqs = $query->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 25));

        return response()->json($rfqs);
    }

    public function show(string $id)
    {
        $rfq = Rfq::where('organization_id', request()->user()->organization_id)
            ->with(['business', 'branch', 'warehouse', 'lines', 'suppliers', 'questions', 'responses'])
            ->findOrFail($id);

        $this->authorize('view', $rfq);

        return response()->json(['data' => $rfq]);
    }

    public function store(StoreRfqRequest $request)
    {
        $this->authorize('create', Rfq::class);

        $validated = $request->validated();
        $user = $request->user();

        $rfq = Rfq::create([
            'organization_id' => $user->organization_id,
            'business_id' => $validated['business_id'] ?? null,
            'branch_id' => $validated['branch_id'] ?? null,
            'warehouse_id' => $validated['warehouse_id'] ?? null,
            'rfq_number' => $validated['rfq_number'],
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'] ?? 'draft',
            'submission_deadline' => $validated['submission_deadline'] ?? null,
            'delivery_required_date' => $validated['delivery_required_date'] ?? null,
            'commercial_terms' => $validated['commercial_terms'] ?? null,
            'payment_terms' => $validated['payment_terms'] ?? null,
            'tax_requirements' => $validated['tax_requirements'] ?? null,
            'evaluation_criteria' => $validated['evaluation_criteria'] ?? null,
            'created_by_user_id' => $user->id,
            'custom_fields' => $validated['custom_fields'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json(['data' => $rfq->load('lines')], 201);
    }

    public function update(UpdateRfqRequest $request, string $id)
    {
        $rfq = Rfq::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $rfq);

        $validated = $request->validated();

        $rfq->update($validated);

        return response()->json(['data' => $rfq->load('lines')]);
    }

    public function destroy(string $id)
    {
        $rfq = Rfq::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $rfq);

        $rfq->delete();

        return response()->json(['message' => 'RFQ deleted']);
    }

    public function publish(Request $request, string $id)
    {
        $rfq = Rfq::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('publish', $rfq);

        $rfq->update(['status' => 'published', 'published_at' => now()]);

        return response()->json(['data' => $rfq->load('lines', 'suppliers')]);
    }

    public function close(Request $request, string $id)
    {
        $rfq = Rfq::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('close', $rfq);

        $rfq->update(['status' => 'closed', 'closed_at' => now()]);

        return response()->json(['data' => $rfq->load('lines', 'suppliers')]);
    }
}
