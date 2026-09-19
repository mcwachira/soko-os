<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Quote;
use App\Http\Requests\StoreQuoteRequest;
use App\Http\Requests\UpdateQuoteRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class QuoteController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Quote::class);

        $quotes = Quote::where('organization_id', $request->user()->organization_id)
            ->with(['customer', 'branch'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 25));

        return response()->json($quotes);
    }

    public function show(string $id)
    {
        $quote = Quote::where('organization_id', request()->user()->organization_id)
            ->with(['customer', 'branch', 'items.product'])
            ->findOrFail($id);

        $this->authorize('view', $quote);

        return response()->json(['data' => $quote]);
    }

    public function store(StoreQuoteRequest $request)
    {
        $this->authorize('create', Quote::class);

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

            $quote = Quote::create([
                'id' => Str::uuid()->toString(),
                'organization_id' => $user->organization_id,
                'business_id' => $user->business_id,
                'customer_id' => $validated['customer_id'] ?? null,
                'branch_id' => $validated['branch_id'] ?? null,
                'quote_number' => 'QUO-'.strtoupper(Str::random(8)),
                'status' => 'draft',
                'quote_date' => $validated['quote_date'],
                'expiry_date' => $validated['expiry_date'] ?? null,
                'currency' => $validated['currency'],
                'subtotal_minor' => $subtotalMinor,
                'discount_minor' => $validated['discount_minor'] ?? 0,
                'tax_total_minor' => $taxTotalMinor,
                'grand_total_minor' => $grandTotalMinor,
                'terms' => $validated['terms'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($items as $itemData) {
                $itemData['quote_id'] = $quote->id;
                \App\Models\QuoteItem::create($itemData);
            }

            return response()->json(['data' => $quote->load('items.product')], 201);
        });
    }

    public function update(UpdateQuoteRequest $request, string $id)
    {
        $quote = Quote::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $quote);

        $validated = $request->validated();

        return DB::transaction(function () use ($validated, $quote) {
            $quote->update([
                'customer_id' => $validated['customer_id'] ?? $quote->customer_id,
                'branch_id' => $validated['branch_id'] ?? $quote->branch_id,
                'quote_date' => $validated['quote_date'] ?? $quote->quote_date,
                'expiry_date' => $validated['expiry_date'] ?? $quote->expiry_date,
                'currency' => $validated['currency'] ?? $quote->currency,
                'discount_minor' => $validated['discount_minor'] ?? $quote->discount_minor,
                'terms' => $validated['terms'] ?? $quote->terms,
                'notes' => $validated['notes'] ?? $quote->notes,
            ]);

            if (isset($validated['items'])) {
                $quote->items()->delete();

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

                    \App\Models\QuoteItem::create([
                        'id' => Str::uuid()->toString(),
                        'quote_id' => $quote->id,
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
                $quote->update([
                    'subtotal_minor' => $subtotalMinor,
                    'tax_total_minor' => $taxTotalMinor,
                    'grand_total_minor' => $grandTotalMinor,
                ]);
            }

            return response()->json(['data' => $quote->load('items.product')]);
        });
    }

    public function destroy(string $id)
    {
        $quote = Quote::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $quote);

        $quote->delete();

        return response()->json(['message' => 'Quote deleted']);
    }
}
