<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\SalesOrder;
use App\Http\Requests\StoreSalesOrderRequest;
use App\Http\Requests\UpdateSalesOrderRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SalesOrderController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', SalesOrder::class);

        $orders = SalesOrder::where('organization_id', $request->user()->organization_id)
            ->with(['customer', 'branch', 'quote'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 25));

        return response()->json($orders);
    }

    public function show(string $id)
    {
        $order = SalesOrder::where('organization_id', request()->user()->organization_id)
            ->with(['customer', 'branch', 'quote', 'items.product'])
            ->findOrFail($id);

        $this->authorize('view', $order);

        return response()->json(['data' => $order]);
    }

    public function store(StoreSalesOrderRequest $request)
    {
        $this->authorize('create', SalesOrder::class);

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

            $order = SalesOrder::create([
                'id' => Str::uuid()->toString(),
                'organization_id' => $user->organization_id,
                'business_id' => $user->business_id,
                'customer_id' => $validated['customer_id'] ?? null,
                'branch_id' => $validated['branch_id'] ?? null,
                'quote_id' => $validated['quote_id'] ?? null,
                'sales_order_number' => 'SO-'.strtoupper(Str::random(8)),
                'status' => 'draft',
                'order_date' => $validated['order_date'],
                'expected_delivery_date' => $validated['expected_delivery_date'] ?? null,
                'currency' => $validated['currency'],
                'subtotal_minor' => $subtotalMinor,
                'discount_minor' => $validated['discount_minor'] ?? 0,
                'tax_total_minor' => $taxTotalMinor,
                'grand_total_minor' => $grandTotalMinor,
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($items as $itemData) {
                $itemData['sales_order_id'] = $order->id;
                \App\Models\SalesOrderItem::create($itemData);
            }

            return response()->json(['data' => $order->load('items.product')], 201);
        });
    }

    public function update(UpdateSalesOrderRequest $request, string $id)
    {
        $order = SalesOrder::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $order);

        $validated = $request->validated();

        return DB::transaction(function () use ($validated, $order) {
            $order->update([
                'customer_id' => $validated['customer_id'] ?? $order->customer_id,
                'branch_id' => $validated['branch_id'] ?? $order->branch_id,
                'quote_id' => $validated['quote_id'] ?? $order->quote_id,
                'order_date' => $validated['order_date'] ?? $order->order_date,
                'expected_delivery_date' => $validated['expected_delivery_date'] ?? $order->expected_delivery_date,
                'currency' => $validated['currency'] ?? $order->currency,
                'discount_minor' => $validated['discount_minor'] ?? $order->discount_minor,
                'notes' => $validated['notes'] ?? $order->notes,
            ]);

            if (isset($validated['items'])) {
                $order->items()->delete();

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

                    \App\Models\SalesOrderItem::create([
                        'id' => Str::uuid()->toString(),
                        'sales_order_id' => $order->id,
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
                $order->update([
                    'subtotal_minor' => $subtotalMinor,
                    'tax_total_minor' => $taxTotalMinor,
                    'grand_total_minor' => $grandTotalMinor,
                ]);
            }

            return response()->json(['data' => $order->load('items.product')]);
        });
    }

    public function destroy(string $id)
    {
        $order = SalesOrder::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $order);

        $order->delete();

        return response()->json(['message' => 'Sales order deleted']);
    }
}
