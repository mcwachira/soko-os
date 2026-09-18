<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\RecurringBill;
use App\Http\Requests\StoreRecurringBillRequest;
use App\Http\Requests\UpdateRecurringBillRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class RecurringBillController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', RecurringBill::class);

        $recurring = RecurringBill::where('organization_id', $request->user()->organization_id)
            ->with(['supplier'])
            ->orderBy('next_run_date', 'asc')
            ->paginate($request->integer('per_page', 25));

        return response()->json($recurring);
    }

    public function show(string $id)
    {
        $recurring = RecurringBill::where('organization_id', request()->user()->organization_id)
            ->with(['supplier'])
            ->findOrFail($id);

        $this->authorize('view', $recurring);

        return response()->json(['data' => $recurring]);
    }

    public function store(StoreRecurringBillRequest $request)
    {
        $this->authorize('create', RecurringBill::class);

        $validated = $request->validated();
        $user = $request->user();

        $recurring = RecurringBill::create([
            'id' => Str::uuid()->toString(),
            'organization_id' => $user->organization_id,
            'business_id' => $user->business_id,
            'supplier_id' => $validated['supplier_id'] ?? null,
            'frequency' => $validated['frequency'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'] ?? null,
            'next_run_date' => $validated['start_date'],
            'items' => $validated['items'] ?? null,
            'currency' => $validated['currency'],
            'exchange_rate' => $validated['exchange_rate'] ?? 1,
            'notes' => $validated['notes'] ?? null,
            'is_active' => true,
        ]);

        return response()->json(['data' => $recurring->load('supplier')], 201);
    }

    public function update(UpdateRecurringBillRequest $request, string $id)
    {
        $recurring = RecurringBill::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $recurring);

        $recurring->update($request->validated());

        return response()->json(['data' => $recurring->load('supplier')]);
    }

    public function destroy(string $id)
    {
        $recurring = RecurringBill::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $recurring);

        $recurring->delete();

        return response()->json(['message' => 'Recurring bill deleted']);
    }
}
