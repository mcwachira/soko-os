<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\RecurringInvoice;
use App\Http\Requests\StoreRecurringInvoiceRequest;
use App\Http\Requests\UpdateRecurringInvoiceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class RecurringInvoiceController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', RecurringInvoice::class);

        $recurring = RecurringInvoice::where('organization_id', $request->user()->organization_id)
            ->with(['customer'])
            ->orderBy('next_run_date', 'asc')
            ->paginate($request->integer('per_page', 25));

        return response()->json($recurring);
    }

    public function show(string $id)
    {
        $recurring = RecurringInvoice::where('organization_id', request()->user()->organization_id)
            ->with(['customer'])
            ->findOrFail($id);

        $this->authorize('view', $recurring);

        return response()->json(['data' => $recurring]);
    }

    public function store(StoreRecurringInvoiceRequest $request)
    {
        $this->authorize('create', RecurringInvoice::class);

        $validated = $request->validated();
        $user = $request->user();

        $recurring = RecurringInvoice::create([
            'id' => Str::uuid()->toString(),
            'organization_id' => $user->organization_id,
            'business_id' => $user->business_id,
            'customer_id' => $validated['customer_id'],
            'frequency' => $validated['frequency'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'] ?? null,
            'next_run_date' => $validated['start_date'],
            'items' => $validated['items'] ?? null,
            'currency' => $validated['currency'],
            'exchange_rate' => $validated['exchange_rate'] ?? 1,
            'notes' => $validated['notes'] ?? null,
            'terms' => $validated['terms'] ?? null,
            'is_active' => true,
        ]);

        return response()->json(['data' => $recurring->load('customer')], 201);
    }

    public function update(UpdateRecurringInvoiceRequest $request, string $id)
    {
        $recurring = RecurringInvoice::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $recurring);

        $recurring->update($request->validated());

        return response()->json(['data' => $recurring->load('customer')]);
    }

    public function destroy(string $id)
    {
        $recurring = RecurringInvoice::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $recurring);

        $recurring->delete();

        return response()->json(['message' => 'Recurring invoice deleted']);
    }
}
