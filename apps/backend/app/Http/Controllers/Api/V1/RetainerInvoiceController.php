<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\RetainerInvoice;
use App\Http\Requests\StoreRetainerInvoiceRequest;
use App\Http\Requests\UpdateRetainerInvoiceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class RetainerInvoiceController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', RetainerInvoice::class);

        $retainers = RetainerInvoice::where('organization_id', $request->user()->organization_id)
            ->with(['customer', 'project'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 25));

        return response()->json($retainers);
    }

    public function show(string $id)
    {
        $retainer = RetainerInvoice::where('organization_id', request()->user()->organization_id)
            ->with(['customer', 'project'])
            ->findOrFail($id);

        $this->authorize('view', $retainer);

        return response()->json(['data' => $retainer]);
    }

    public function store(StoreRetainerInvoiceRequest $request)
    {
        $this->authorize('create', RetainerInvoice::class);

        $validated = $request->validated();
        $user = $request->user();

        $retainer = RetainerInvoice::create([
            'id' => Str::uuid()->toString(),
            'organization_id' => $user->organization_id,
            'business_id' => $user->business_id,
            'customer_id' => $validated['customer_id'],
            'project_id' => $validated['project_id'] ?? null,
            'retainer_number' => 'RET-'.strtoupper(Str::random(8)),
            'status' => $validated['status'] ?? 'active',
            'amount_minor' => $validated['amount_minor'],
            'currency' => $validated['currency'],
            'frequency' => $validated['frequency'] ?? 'monthly',
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'] ?? null,
            'remaining_minor' => $validated['amount_minor'],
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json(['data' => $retainer->load('customer', 'project')], 201);
    }

    public function update(UpdateRetainerInvoiceRequest $request, string $id)
    {
        $retainer = RetainerInvoice::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $retainer);

        $retainer->update($request->validated());

        return response()->json(['data' => $retainer->load('customer', 'project')]);
    }

    public function destroy(string $id)
    {
        $retainer = RetainerInvoice::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $retainer);

        $retainer->delete();

        return response()->json(['message' => 'Retainer deleted']);
    }
}
