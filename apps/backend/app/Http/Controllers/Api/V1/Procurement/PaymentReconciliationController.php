<?php

namespace App\Http\Controllers\Api\V1\Procurement;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePaymentReconciliationRequest;
use App\Http\Requests\UpdatePaymentReconciliationRequest;
use App\Models\PaymentReconciliation;
use Illuminate\Http\Request;

class PaymentReconciliationController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', PaymentReconciliation::class);

        $query = PaymentReconciliation::where('organization_id', $request->user()->organization_id)
            ->with(['supplierPayment']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $reconciliations = $query->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 25));

        return response()->json($reconciliations);
    }

    public function show(string $id)
    {
        $reconciliation = PaymentReconciliation::where('organization_id', request()->user()->organization_id)
            ->with(['supplierPayment', 'reconciledBy'])
            ->findOrFail($id);

        $this->authorize('view', $reconciliation);

        return response()->json(['data' => $reconciliation]);
    }

    public function store(StorePaymentReconciliationRequest $request)
    {
        $this->authorize('create', PaymentReconciliation::class);

        $validated = $request->validated();
        $user = $request->user();

        $reconciliation = PaymentReconciliation::create([
            'organization_id' => $user->organization_id,
            'supplier_payment_id' => $validated['supplier_payment_id'],
            'provider_transaction_id' => $validated['provider_transaction_id'] ?? null,
            'amount_minor' => $validated['amount_minor'],
            'currency' => $validated['currency'] ?? 'KES',
            'reconciled_at' => $validated['reconciled_at'] ?? null,
            'reconciled_by_user_id' => $validated['reconciled_by_user_id'] ?? $user->id,
            'status' => $validated['status'] ?? 'pending',
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json(['data' => $reconciliation], 201);
    }

    public function update(UpdatePaymentReconciliationRequest $request, string $id)
    {
        $reconciliation = PaymentReconciliation::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $reconciliation);

        $validated = $request->validated();

        $reconciliation->update($validated);

        return response()->json(['data' => $reconciliation]);
    }

    public function destroy(string $id)
    {
        $reconciliation = PaymentReconciliation::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $reconciliation);

        $reconciliation->delete();

        return response()->json(['message' => 'Payment reconciliation deleted']);
    }
}
