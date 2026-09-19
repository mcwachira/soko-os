<?php

namespace App\Http\Controllers\Api\V1\Procurement;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProcurementContractRequest;
use App\Http\Requests\UpdateProcurementContractRequest;
use App\Models\ProcurementContract;
use Illuminate\Http\Request;

class ProcurementContractController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', ProcurementContract::class);

        $query = ProcurementContract::where('organization_id', $request->user()->organization_id)
            ->with(['business', 'supplier']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $contracts = $query->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 25));

        return response()->json($contracts);
    }

    public function show(string $id)
    {
        $contract = ProcurementContract::where('organization_id', request()->user()->organization_id)
            ->with(['business', 'supplier', 'lines', 'renewals'])
            ->findOrFail($id);

        $this->authorize('view', $contract);

        return response()->json(['data' => $contract]);
    }

    public function store(StoreProcurementContractRequest $request)
    {
        $this->authorize('create', ProcurementContract::class);

        $validated = $request->validated();
        $user = $request->user();

        $contract = ProcurementContract::create([
            'organization_id' => $user->organization_id,
            'business_id' => $validated['business_id'] ?? null,
            'supplier_id' => $validated['supplier_id'],
            'contract_number' => $validated['contract_number'],
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'renewal_date' => $validated['renewal_date'] ?? null,
            'contract_value_minor' => $validated['contract_value_minor'] ?? 0,
            'currency' => $validated['currency'] ?? 'KES',
            'terms' => $validated['terms'] ?? null,
            'status' => $validated['status'] ?? 'draft',
            'attachment_url' => $validated['attachment_url'] ?? null,
        ]);

        return response()->json(['data' => $contract->load('lines')], 201);
    }

    public function update(UpdateProcurementContractRequest $request, string $id)
    {
        $contract = ProcurementContract::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $contract);

        $validated = $request->validated();

        $contract->update($validated);

        return response()->json(['data' => $contract->load('lines')]);
    }

    public function destroy(string $id)
    {
        $contract = ProcurementContract::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $contract);

        $contract->delete();

        return response()->json(['message' => 'Procurement contract deleted']);
    }
}
