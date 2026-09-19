<?php

namespace App\Http\Controllers\Api\V1\Procurement;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSupplierPaymentRequest;
use App\Http\Requests\UpdateSupplierPaymentRequest;
use App\Models\SupplierPayment;
use Illuminate\Http\Request;

class SupplierPaymentController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', SupplierPayment::class);

        $query = SupplierPayment::where('organization_id', $request->user()->organization_id)
            ->with(['business', 'branch', 'supplier', 'paymentVoucher']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $payments = $query->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 25));

        return response()->json($payments);
    }

    public function show(string $id)
    {
        $payment = SupplierPayment::where('organization_id', request()->user()->organization_id)
            ->with(['business', 'branch', 'supplier', 'paymentVoucher'])
            ->findOrFail($id);

        $this->authorize('view', $payment);

        return response()->json(['data' => $payment]);
    }

    public function store(StoreSupplierPaymentRequest $request)
    {
        $this->authorize('create', SupplierPayment::class);

        $validated = $request->validated();
        $user = $request->user();

        $payment = SupplierPayment::create([
            'organization_id' => $user->organization_id,
            'business_id' => $validated['business_id'] ?? null,
            'branch_id' => $validated['branch_id'] ?? null,
            'payment_voucher_id' => $validated['payment_voucher_id'] ?? null,
            'supplier_id' => $validated['supplier_id'],
            'currency' => $validated['currency'] ?? 'KES',
            'amount_minor' => $validated['amount_minor'],
            'payment_method' => $validated['payment_method'],
            'reference' => $validated['reference'] ?? null,
            'external_transaction_id' => $validated['external_transaction_id'] ?? null,
            'provider_response' => $validated['provider_response'] ?? null,
            'status' => $validated['status'] ?? 'pending',
            'paid_at' => $validated['paid_at'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json(['data' => $payment], 201);
    }

    public function update(UpdateSupplierPaymentRequest $request, string $id)
    {
        $payment = SupplierPayment::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $payment);

        $validated = $request->validated();

        $payment->update($validated);

        return response()->json(['data' => $payment]);
    }

    public function destroy(string $id)
    {
        $payment = SupplierPayment::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $payment);

        $payment->delete();

        return response()->json(['message' => 'Supplier payment deleted']);
    }
}
