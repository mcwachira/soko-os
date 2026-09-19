<?php

namespace App\Http\Controllers\Api\V1\Procurement;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePaymentVoucherRequest;
use App\Http\Requests\UpdatePaymentVoucherRequest;
use App\Models\PaymentVoucher;
use Illuminate\Http\Request;

class PaymentVoucherController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', PaymentVoucher::class);

        $query = PaymentVoucher::where('organization_id', $request->user()->organization_id)
            ->with(['business', 'branch', 'supplier']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $paymentVouchers = $query->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 25));

        return response()->json($paymentVouchers);
    }

    public function show(string $id)
    {
        $paymentVoucher = PaymentVoucher::where('organization_id', request()->user()->organization_id)
            ->with(['business', 'branch', 'supplier', 'approvedBy', 'lines.supplierInvoice', 'approvals.approver'])
            ->findOrFail($id);

        $this->authorize('view', $paymentVoucher);

        return response()->json(['data' => $paymentVoucher]);
    }

    public function store(StorePaymentVoucherRequest $request)
    {
        $this->authorize('create', PaymentVoucher::class);

        $validated = $request->validated();
        $user = $request->user();

        $paymentVoucher = PaymentVoucher::create([
            'organization_id' => $user->organization_id,
            'business_id' => $validated['business_id'] ?? null,
            'branch_id' => $validated['branch_id'] ?? null,
            'voucher_number' => $validated['voucher_number'],
            'supplier_id' => $validated['supplier_id'],
            'currency' => $validated['currency'] ?? 'KES',
            'gross_amount_minor' => $validated['gross_amount_minor'],
            'wht_rate_percentage' => $validated['wht_rate_percentage'] ?? null,
            'wht_amount_minor' => $validated['wht_amount_minor'] ?? 0,
            'other_deductions_minor' => $validated['other_deductions_minor'] ?? 0,
            'net_payable_minor' => $validated['net_payable_minor'],
            'status' => $validated['status'] ?? 'draft',
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json(['data' => $paymentVoucher->load('lines')], 201);
    }

    public function update(UpdatePaymentVoucherRequest $request, string $id)
    {
        $paymentVoucher = PaymentVoucher::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $paymentVoucher);

        $validated = $request->validated();

        $paymentVoucher->update($validated);

        return response()->json(['data' => $paymentVoucher->load('lines')]);
    }

    public function destroy(string $id)
    {
        $paymentVoucher = PaymentVoucher::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $paymentVoucher);

        $paymentVoucher->delete();

        return response()->json(['message' => 'Payment voucher deleted']);
    }
}
