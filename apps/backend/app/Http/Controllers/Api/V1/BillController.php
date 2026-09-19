<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\BillItem;
use App\Http\Requests\StoreBillRequest;
use App\Http\Requests\UpdateBillRequest;
use App\Services\Accounting\JournalService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BillController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Bill::class);

        $query = Bill::where('organization_id', $request->user()->organization_id)
            ->with(['supplier', 'branch']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $bills = $query->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 25));

        return response()->json($bills);
    }

    public function show(string $id)
    {
        $bill = Bill::where('organization_id', request()->user()->organization_id)
            ->with(['supplier', 'branch', 'items.product'])
            ->findOrFail($id);

        $this->authorize('view', $bill);

        return response()->json(['data' => $bill]);
    }

    public function store(StoreBillRequest $request)
    {
        $this->authorize('create', Bill::class);

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
            $paidTotalMinor = 0;
            $balanceMinor = $grandTotalMinor - $paidTotalMinor;

            $bill = Bill::create([
                'id' => Str::uuid()->toString(),
                'organization_id' => $user->organization_id,
                'business_id' => $user->business_id,
                'supplier_id' => $validated['supplier_id'] ?? null,
                'branch_id' => $validated['branch_id'] ?? null,
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
            ]);

            foreach ($items as $itemData) {
                $itemData['bill_id'] = $bill->id;
                BillItem::create($itemData);
            }

            return response()->json(['data' => $bill->load('items.product')], 201);
        });
    }

    public function update(UpdateBillRequest $request, string $id)
    {
        $bill = Bill::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $bill);

        $validated = $request->validated();

        return DB::transaction(function () use ($validated, $bill) {
            $bill->update([
                'supplier_id' => $validated['supplier_id'] ?? $bill->supplier_id,
                'branch_id' => $validated['branch_id'] ?? $bill->branch_id,
                'issue_date' => $validated['issue_date'] ?? $bill->issue_date,
                'due_date' => $validated['due_date'] ?? $bill->due_date,
                'currency' => $validated['currency'] ?? $bill->currency,
                'discount_minor' => $validated['discount_minor'] ?? $bill->discount_minor,
                'notes' => $validated['notes'] ?? $bill->notes,
            ]);

            if (isset($validated['items'])) {
                $bill->items()->delete();

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

                    BillItem::create([
                        'id' => Str::uuid()->toString(),
                        'bill_id' => $bill->id,
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
                $balanceMinor = $grandTotalMinor - $bill->paid_total_minor;

                $bill->update([
                    'subtotal_minor' => $subtotalMinor,
                    'tax_total_minor' => $taxTotalMinor,
                    'grand_total_minor' => $grandTotalMinor,
                    'balance_minor' => $balanceMinor,
                ]);
            }

            return response()->json(['data' => $bill->load('items.product')]);
        });
    }

    public function destroy(string $id)
    {
        $bill = Bill::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $bill);

        $bill->delete();

        return response()->json(['message' => 'Bill deleted']);
    }

    public function approve(Request $request, string $id, JournalService $journalService)
    {
        $bill = Bill::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $bill);

        if (! in_array($bill->status, ['draft', 'pending'])) {
            return response()->json(['message' => 'Bill is not in a status that can be approved'], 422);
        }

        $bill->update([
            'status' => 'approved',
        ]);

        $journalService->postBillJournal($bill->organization_id, $bill->business_id, $bill);

        return response()->json(['data' => $bill->load('items.product')]);
    }
}
