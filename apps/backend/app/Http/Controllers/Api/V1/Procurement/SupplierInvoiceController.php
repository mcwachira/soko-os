<?php

namespace App\Http\Controllers\Api\V1\Procurement;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSupplierInvoiceRequest;
use App\Http\Requests\UpdateSupplierInvoiceRequest;
use App\Models\SupplierInvoice;
use Illuminate\Http\Request;

class SupplierInvoiceController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', SupplierInvoice::class);

        $query = SupplierInvoice::where('organization_id', $request->user()->organization_id)
            ->with(['business', 'branch', 'supplier', 'purchaseOrder']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        $invoices = $query->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 25));

        return response()->json($invoices);
    }

    public function show(string $id)
    {
        $invoice = SupplierInvoice::where('organization_id', request()->user()->organization_id)
            ->with(['business', 'branch', 'supplier', 'purchaseOrder', 'lines.product', 'lines.purchaseOrderItem'])
            ->findOrFail($id);

        $this->authorize('view', $invoice);

        return response()->json(['data' => $invoice]);
    }

    public function store(StoreSupplierInvoiceRequest $request)
    {
        $this->authorize('create', SupplierInvoice::class);

        $validated = $request->validated();
        $user = $request->user();

        $invoice = SupplierInvoice::create([
            'organization_id' => $user->organization_id,
            'business_id' => $validated['business_id'] ?? null,
            'branch_id' => $validated['branch_id'] ?? null,
            'supplier_id' => $validated['supplier_id'],
            'purchase_order_id' => $validated['purchase_order_id'] ?? null,
            'invoice_number' => $validated['invoice_number'],
            'invoice_date' => $validated['invoice_date'],
            'due_date' => $validated['due_date'] ?? null,
            'currency' => $validated['currency'] ?? 'KES',
            'subtotal_minor' => $validated['subtotal_minor'] ?? 0,
            'discount_minor' => $validated['discount_minor'] ?? 0,
            'tax_minor' => $validated['tax_minor'] ?? 0,
            'wht_minor' => $validated['wht_minor'] ?? 0,
            'grand_total_minor' => $validated['grand_total_minor'] ?? 0,
            'etims_status' => $validated['etims_status'] ?? null,
            'etims_control_number' => $validated['etims_control_number'] ?? null,
            'etims_verified_at' => $validated['etims_verified_at'] ?? null,
            'etims_payload' => $validated['etims_payload'] ?? null,
            'status' => $validated['status'] ?? 'draft',
            'custom_fields' => $validated['custom_fields'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json(['data' => $invoice->load('lines')], 201);
    }

    public function update(UpdateSupplierInvoiceRequest $request, string $id)
    {
        $invoice = SupplierInvoice::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $invoice);

        $validated = $request->validated();

        $invoice->update($validated);

        return response()->json(['data' => $invoice->load('lines')]);
    }

    public function destroy(string $id)
    {
        $invoice = SupplierInvoice::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $invoice);

        $invoice->delete();

        return response()->json(['message' => 'Supplier invoice deleted']);
    }
}
