<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Http\Requests\StoreInvoiceRequest;
use App\Http\Requests\UpdateInvoiceRequest;
use App\Services\Accounting\JournalService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Invoice::class);

        $invoices = Invoice::where('organization_id', $request->user()->organization_id)
            ->with(['customer', 'branch'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 25));

        return response()->json($invoices);
    }

    public function show(string $id)
    {
        $invoice = Invoice::where('organization_id', request()->user()->organization_id)
            ->with(['customer', 'branch', 'items.product'])
            ->findOrFail($id);

        $this->authorize('view', $invoice);

        return response()->json(['data' => $invoice]);
    }

    public function store(StoreInvoiceRequest $request)
    {
        $this->authorize('create', Invoice::class);

        $user = $request->user();
        $validated = $request->validated();

        return DB::transaction(function () use ($validated, $user) {
            $subtotalMinor = 0;
            $taxTotalMinor = 0;

            $items = [];
            foreach ($validated['items'] as $item) {
                $product = \App\Models\Product::find($item['product_id']);
                $quantity = (float) $item['quantity'];
                $unitPrice = (int) $item['unit_price_minor'];
                $discount = (int) ($item['discount_minor'] ?? 0);
                $taxRate = (float) ($item['tax_rate_percentage'] ?? 0);
                $itemSubtotal = ($quantity * $unitPrice) - $discount;
                $taxAmount = $taxRate > 0 ? (int) round(($itemSubtotal * $taxRate) / 100) : 0;
                $itemTotal = $itemSubtotal + $taxAmount;

                $subtotalMinor += $itemSubtotal;
                $taxTotalMinor += $taxAmount;

                $items[] = [
                    'id' => Str::uuid()->toString(),
                    'product_id' => $item['product_id'],
                    'description' => $item['description'],
                    'quantity' => $quantity,
                    'unit_price_minor' => $unitPrice,
                    'discount_minor' => $discount,
                    'tax_rate_percentage' => $taxRate,
                    'tax_amount_minor' => $taxAmount,
                    'subtotal_minor' => $itemSubtotal,
                    'total_minor' => $itemTotal,
                ];
            }

            $grandTotalMinor = $subtotalMinor + $taxTotalMinor;
            $paidTotalMinor = 0;
            $balanceMinor = $grandTotalMinor - $paidTotalMinor;

            $invoice = Invoice::create([
                'id' => Str::uuid()->toString(),
                'organization_id' => $user->organization_id,
                'business_id' => $user->business_id,
                'customer_id' => $validated['customer_id'] ?? null,
                'branch_id' => $validated['branch_id'] ?? null,
                'invoice_number' => 'INV-'.strtoupper(Str::random(8)),
                'status' => 'draft',
                'issue_date' => $validated['issue_date'],
                'due_date' => $validated['due_date'] ?? null,
                'currency' => $validated['currency'],
                'subtotal_minor' => $subtotalMinor,
                'discount_minor' => $validated['discount_minor'] ?? 0,
                'tax_total_minor' => $taxTotalMinor,
                'grand_total_minor' => $grandTotalMinor,
                'paid_total_minor' => $paidTotalMinor,
                'balance_minor' => $balanceMinor,
                'notes' => $validated['notes'] ?? null,
                'terms' => $validated['terms'] ?? null,
            ]);

            foreach ($items as $itemData) {
                $itemData['invoice_id'] = $invoice->id;
                InvoiceItem::create($itemData);
            }

            return response()->json(['data' => $invoice->load('items.product')], 201);
        });
    }

    public function update(UpdateInvoiceRequest $request, string $id)
    {
        $invoice = Invoice::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $invoice);

        $validated = $request->validated();

        return DB::transaction(function () use ($validated, $invoice) {
            $invoice->update([
                'customer_id' => $validated['customer_id'] ?? $invoice->customer_id,
                'branch_id' => $validated['branch_id'] ?? $invoice->branch_id,
                'issue_date' => $validated['issue_date'] ?? $invoice->issue_date,
                'due_date' => $validated['due_date'] ?? $invoice->due_date,
                'currency' => $validated['currency'] ?? $invoice->currency,
                'discount_minor' => $validated['discount_minor'] ?? $invoice->discount_minor,
                'notes' => $validated['notes'] ?? $invoice->notes,
                'terms' => $validated['terms'] ?? $invoice->terms,
            ]);

            if (isset($validated['items'])) {
                $invoice->items()->delete();

                $subtotalMinor = 0;
                $taxTotalMinor = 0;

                foreach ($validated['items'] as $item) {
                    $product = \App\Models\Product::find($item['product_id']);
                    $quantity = (float) $item['quantity'];
                    $unitPrice = (int) $item['unit_price_minor'];
                    $discount = (int) ($item['discount_minor'] ?? 0);
                    $taxRate = (float) ($item['tax_rate_percentage'] ?? 0);
                    $itemSubtotal = ($quantity * $unitPrice) - $discount;
                    $taxAmount = $taxRate > 0 ? (int) round(($itemSubtotal * $taxRate) / 100) : 0;
                    $itemTotal = $itemSubtotal + $taxAmount;

                    $subtotalMinor += $itemSubtotal;
                    $taxTotalMinor += $taxAmount;

                    InvoiceItem::create([
                        'id' => Str::uuid()->toString(),
                        'invoice_id' => $invoice->id,
                        'product_id' => $item['product_id'],
                        'description' => $item['description'],
                        'quantity' => $quantity,
                        'unit_price_minor' => $unitPrice,
                        'discount_minor' => $discount,
                        'tax_rate_percentage' => $taxRate,
                        'tax_amount_minor' => $taxAmount,
                        'subtotal_minor' => $itemSubtotal,
                        'total_minor' => $itemTotal,
                    ]);
                }

                $grandTotalMinor = $subtotalMinor + $taxTotalMinor;
                $balanceMinor = $grandTotalMinor - $invoice->paid_total_minor;

                $invoice->update([
                    'subtotal_minor' => $subtotalMinor,
                    'tax_total_minor' => $taxTotalMinor,
                    'grand_total_minor' => $grandTotalMinor,
                    'balance_minor' => $balanceMinor,
                ]);
            }

            return response()->json(['data' => $invoice->load('items.product')]);
        });
    }

    public function destroy(string $id)
    {
        $invoice = Invoice::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $invoice);

        $invoice->delete();

        return response()->json(['message' => 'Invoice deleted']);
    }

    public function issue(Request $request, string $id, JournalService $journalService)
    {
        $invoice = Invoice::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $invoice);

        if ($invoice->status !== 'draft') {
            return response()->json(['message' => 'Invoice is not in draft status'], 422);
        }

        $invoice->update([
            'status' => 'sent',
            'issue_date' => $invoice->issue_date ?? now()->toDateString(),
        ]);

        $journalService->postInvoiceJournal($invoice->organization_id, $invoice->business_id, $invoice);

        return response()->json(['data' => $invoice->load('items.product')]);
    }
}
