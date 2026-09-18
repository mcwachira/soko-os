<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CreditNote;
use App\Http\Requests\StoreCreditNoteRequest;
use App\Http\Requests\UpdateCreditNoteRequest;
use App\Services\Accounting\JournalService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CreditNoteController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', CreditNote::class);

        $notes = CreditNote::where('organization_id', $request->user()->organization_id)
            ->with(['customer', 'branch', 'invoice'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 25));

        return response()->json($notes);
    }

    public function show(string $id)
    {
        $note = CreditNote::where('organization_id', request()->user()->organization_id)
            ->with(['customer', 'branch', 'invoice', 'items.product'])
            ->findOrFail($id);

        $this->authorize('view', $note);

        return response()->json(['data' => $note]);
    }

    public function store(StoreCreditNoteRequest $request)
    {
        $this->authorize('create', CreditNote::class);

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

            $note = CreditNote::create([
                'id' => Str::uuid()->toString(),
                'organization_id' => $user->organization_id,
                'business_id' => $user->business_id,
                'customer_id' => $validated['customer_id'] ?? null,
                'branch_id' => $validated['branch_id'] ?? null,
                'invoice_id' => $validated['invoice_id'] ?? null,
                'credit_note_number' => 'CN-'.strtoupper(Str::random(8)),
                'status' => 'draft',
                'credit_date' => $validated['credit_date'],
                'currency' => $validated['currency'],
                'subtotal_minor' => $subtotalMinor,
                'tax_total_minor' => $taxTotalMinor,
                'total_minor' => $grandTotalMinor,
                'reason' => $validated['reason'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($items as $itemData) {
                $itemData['credit_note_id'] = $note->id;
                \App\Models\CreditNoteItem::create($itemData);
            }

            return response()->json(['data' => $note->load('items.product')], 201);
        });
    }

    public function update(UpdateCreditNoteRequest $request, string $id)
    {
        $note = CreditNote::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $note);

        $validated = $request->validated();

        return DB::transaction(function () use ($validated, $note) {
            $note->update([
                'customer_id' => $validated['customer_id'] ?? $note->customer_id,
                'invoice_id' => $validated['invoice_id'] ?? $note->invoice_id,
                'branch_id' => $validated['branch_id'] ?? $note->branch_id,
                'credit_date' => $validated['credit_date'] ?? $note->credit_date,
                'currency' => $validated['currency'] ?? $note->currency,
                'reason' => $validated['reason'] ?? $note->reason,
                'notes' => $validated['notes'] ?? $note->notes,
            ]);

            if (isset($validated['items'])) {
                $note->items()->delete();

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

                    \App\Models\CreditNoteItem::create([
                        'id' => Str::uuid()->toString(),
                        'credit_note_id' => $note->id,
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
                $note->update([
                    'subtotal_minor' => $subtotalMinor,
                    'tax_total_minor' => $taxTotalMinor,
                    'total_minor' => $grandTotalMinor,
                ]);
            }

            return response()->json(['data' => $note->load('items.product')]);
        });
    }

    public function destroy(string $id)
    {
        $note = CreditNote::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $note);

        $note->delete();

        return response()->json(['message' => 'Credit note deleted']);
    }

    public function issue(Request $request, string $id, JournalService $journalService)
    {
        $note = CreditNote::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $note);

        if ($note->status !== 'draft') {
            return response()->json(['message' => 'Credit note is not in draft status'], 422);
        }

        $note->update([
            'status' => 'issued',
        ]);

        $journalService->postCreditNoteJournal($note->organization_id, $note->business_id, $note);

        return response()->json(['data' => $note->load('items.product')]);
    }
}
