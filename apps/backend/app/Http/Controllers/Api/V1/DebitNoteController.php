<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\DebitNote;
use App\Http\Requests\StoreDebitNoteRequest;
use App\Http\Requests\UpdateDebitNoteRequest;
use App\Services\Accounting\JournalService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DebitNoteController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', DebitNote::class);

        $notes = DebitNote::where('organization_id', $request->user()->organization_id)
            ->with(['supplier', 'branch', 'bill'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 25));

        return response()->json($notes);
    }

    public function show(string $id)
    {
        $note = DebitNote::where('organization_id', request()->user()->organization_id)
            ->with(['supplier', 'branch', 'bill', 'items.product'])
            ->findOrFail($id);

        $this->authorize('view', $note);

        return response()->json(['data' => $note]);
    }

    public function store(StoreDebitNoteRequest $request)
    {
        $this->authorize('create', DebitNote::class);

        $user = $request->user();
        $validated = $request->validated();

        return DB::transaction(function () use ($validated, $user) {
            $subtotalMinor = 0;
            $taxTotalMinor = 0;

            $items = [];
            foreach ($validated['items'] as $item) {
                $product = \App\Models\Product::find($item['product_id']);
                $quantity = (float) $item['quantity'];
                $unitCost = (int) $item['unit_cost_minor'];
                $discount = (int) ($item['discount_minor'] ?? 0);
                $taxRate = (float) ($item['tax_rate_percentage'] ?? 0);
                $itemSubtotal = ($quantity * $unitCost) - $discount;
                $taxAmount = $taxRate > 0 ? (int) round(($itemSubtotal * $taxRate) / 100) : 0;
                $itemTotal = $itemSubtotal + $taxAmount;

                $subtotalMinor += $itemSubtotal;
                $taxTotalMinor += $taxAmount;

                $items[] = [
                    'id' => Str::uuid()->toString(),
                    'product_id' => $item['product_id'],
                    'description' => $item['description'],
                    'quantity' => $quantity,
                    'unit_cost_minor' => $unitCost,
                    'discount_minor' => $discount,
                    'tax_rate_percentage' => $taxRate,
                    'tax_amount_minor' => $taxAmount,
                    'subtotal_minor' => $itemSubtotal,
                    'total_minor' => $itemTotal,
                ];
            }

            $grandTotalMinor = $subtotalMinor + $taxTotalMinor;

            $note = DebitNote::create([
                'id' => Str::uuid()->toString(),
                'organization_id' => $user->organization_id,
                'business_id' => $user->business_id,
                'supplier_id' => $validated['supplier_id'] ?? null,
                'branch_id' => $validated['branch_id'] ?? null,
                'bill_id' => $validated['bill_id'] ?? null,
                'debit_note_number' => 'DN-'.strtoupper(Str::random(8)),
                'status' => 'draft',
                'debit_date' => $validated['debit_date'],
                'currency' => $validated['currency'],
                'subtotal_minor' => $subtotalMinor,
                'tax_total_minor' => $taxTotalMinor,
                'total_minor' => $grandTotalMinor,
                'reason' => $validated['reason'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($items as $itemData) {
                $itemData['debit_note_id'] = $note->id;
                \App\Models\DebitNoteItem::create($itemData);
            }

            return response()->json(['data' => $note->load('items.product')], 201);
        });
    }

    public function update(UpdateDebitNoteRequest $request, string $id)
    {
        $note = DebitNote::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $note);

        $validated = $request->validated();

        return DB::transaction(function () use ($validated, $note) {
            $note->update([
                'supplier_id' => $validated['supplier_id'] ?? $note->supplier_id,
                'bill_id' => $validated['bill_id'] ?? $note->bill_id,
                'branch_id' => $validated['branch_id'] ?? $note->branch_id,
                'debit_date' => $validated['debit_date'] ?? $note->debit_date,
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
                    $unitCost = (int) $item['unit_cost_minor'];
                    $discount = (int) ($item['discount_minor'] ?? 0);
                    $taxRate = (float) ($item['tax_rate_percentage'] ?? 0);
                    $itemSubtotal = ($quantity * $unitCost) - $discount;
                    $taxAmount = $taxRate > 0 ? (int) round(($itemSubtotal * $taxRate) / 100) : 0;
                    $itemTotal = $itemSubtotal + $taxAmount;

                    $subtotalMinor += $itemSubtotal;
                    $taxTotalMinor += $taxAmount;

                    \App\Models\DebitNoteItem::create([
                        'id' => Str::uuid()->toString(),
                        'debit_note_id' => $note->id,
                        'product_id' => $item['product_id'],
                        'description' => $item['description'],
                        'quantity' => $quantity,
                        'unit_cost_minor' => $unitCost,
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
        $note = DebitNote::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $note);

        $note->delete();

        return response()->json(['message' => 'Debit note deleted']);
    }

    public function approve(Request $request, string $id, JournalService $journalService)
    {
        $note = DebitNote::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $note);

        if (! in_array($note->status, ['draft', 'pending'])) {
            return response()->json(['message' => 'Debit note is not in a status that can be approved'], 422);
        }

        $note->update([
            'status' => 'approved',
        ]);

        $journalService->postDebitNoteJournal($note->organization_id, $note->business_id, $note);

        return response()->json(['data' => $note->load('items.product')]);
    }
}
