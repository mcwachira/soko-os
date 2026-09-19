<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReturnRequest;
use App\Http\Requests\UpdateReturnRequest;
use App\Jobs\FiscalizeSaleJob;
use App\Models\Branch;
use App\Models\CashShift;
use App\Models\Customer;
use App\Models\InventoryMovement;
use App\Models\Product;
use App\Models\ProductStock;
use App\Models\Refund;
use App\Models\ReturnItem;
use App\Models\ReturnModel;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ReturnController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', ReturnModel::class);

        $returns = ReturnModel::with(['items', 'sale.customer', 'cashier'])
            ->where('organization_id', $request->user()->organization_id)
            ->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 25));

        return response()->json($returns);
    }

    public function show(string $id)
    {
        $return = ReturnModel::with(['items.product', 'sale.items', 'sale.payments', 'cashier', 'approver', 'branch'])
            ->where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('view', $return);

        return response()->json(['data' => $return]);
    }

    public function store(StoreReturnRequest $request)
    {
        $this->authorize('create', ReturnModel::class);

        $validated = $request->validated();
        $user = $request->user();
        $organizationId = $user->organization_id;
        $businessId = $user->business_id ?? $organizationId;

        return DB::transaction(function () use ($validated, $user, $organizationId, $businessId) {
            $sale = Sale::where('id', $validated['sale_id'])
                ->where('organization_id', $organizationId)
                ->with(['items', 'payments', 'customer'])
                ->firstOrFail();

            // Calculate totals from items
            $grandTotalMinor = 0;
            $taxTotalMinor = 0;
            $subtotalMinor = 0;

            foreach ($validated['items'] as $item) {
                $saleItem = SaleItem::where('id', $item['sale_item_id'])
                    ->where('sale_id', $sale->id)
                    ->firstOrFail();

                // Calculate already returned quantity for this sale item
                $alreadyReturned = ReturnItem::where('sale_item_id', $saleItem->id)
                    ->whereHas('return', function ($q) {
                        $q->where('status', '!=', 'cancelled');
                    })
                    ->sum('quantity');

                $availableQuantity = $saleItem->quantity - $alreadyReturned;

                // Validate quantity does not exceed available (original - already returned)
                if ($item['quantity'] > $availableQuantity) {
                    return response()->json([
                        'message' => 'Return quantity exceeds available quantity for item: '.$saleItem->name.' (Original: '.$saleItem->quantity.', Already returned: '.$alreadyReturned.', Available: '.$availableQuantity.')',
                    ], 422);
                }

                $itemTotal = (int) ($item['quantity'] * $saleItem->unit_price_minor) - ($item['discount_minor'] ?? 0);
                $rate = $item['tax_rate_percentage'] ?? $saleItem->tax_rate_percentage ?? 16.0;
                $taxAmount = $rate > 0 ? (int) round(($itemTotal * $rate) / (100 + $rate)) : 0;

                $grandTotalMinor += $itemTotal;
                $taxTotalMinor += $taxAmount;
                $subtotalMinor += ($itemTotal - $taxAmount);
            }

            $return = ReturnModel::create([
                'id' => Str::uuid()->toString(),
                'organization_id' => $organizationId,
                'business_id' => $businessId,
                'branch_id' => $sale->branch_id,
                'terminal_id' => $validated['terminal_id'] ?? $sale->terminal_id,
                'sale_id' => $sale->id,
                'cashier_user_id' => $user->id,
                'shift_id' => $validated['shift_id'] ?? $sale->shift_id,
                'return_number' => $this->generateReturnNumber($sale->branch_id),
                'status' => 'pending',
                'return_type' => $validated['return_type'],
                'subtotal_minor' => $subtotalMinor,
                'tax_total_minor' => $taxTotalMinor,
                'grand_total_minor' => $grandTotalMinor,
                'reason' => $validated['reason'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($validated['items'] as $item) {
                $saleItem = SaleItem::where('id', $item['sale_item_id'])
                    ->where('sale_id', $sale->id)
                    ->firstOrFail();

                $itemTotal = (int) ($item['quantity'] * $saleItem->unit_price_minor) - ($item['discount_minor'] ?? 0);
                $rate = $item['tax_rate_percentage'] ?? $saleItem->tax_rate_percentage ?? 16.0;
                $taxAmount = $rate > 0 ? (int) round(($itemTotal * $rate) / (100 + $rate)) : 0;

                ReturnItem::create([
                    'id' => Str::uuid()->toString(),
                    'return_id' => $return->id,
                    'sale_item_id' => $saleItem->id,
                    'product_id' => $saleItem->product_id,
                    'sku' => $saleItem->sku,
                    'name' => $saleItem->name,
                    'quantity' => $item['quantity'],
                    'unit_price_minor' => $saleItem->unit_price_minor,
                    'discount_minor' => $item['discount_minor'] ?? 0,
                    'tax_rate_percentage' => $rate,
                    'tax_amount_minor' => $taxAmount,
                    'subtotal_minor' => $itemTotal - $taxAmount,
                    'total_minor' => $itemTotal,
                    'return_reason' => $item['return_reason'] ?? null,
                    'condition' => $item['condition'] ?? 'good',
                ]);

                // Create inventory movement for stock increment (return adds stock back)
                $this->createInventoryMovement($return, $saleItem, $item, $user);
            }

            Log::info('Return created', [
                'return_id' => $return->id,
                'return_number' => $return->return_number,
                'sale_id' => $sale->id,
                'user_id' => $user->id,
                'grand_total_minor' => $grandTotalMinor,
            ]);

            return response()->json(['data' => $return->load(['items.product', 'sale'])], 201);
        });
    }

    public function update(UpdateReturnRequest $request, string $id)
    {
        $return = ReturnModel::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $return);

        $validated = $request->validated();
        $user = $request->user();

        // Only allow status transitions
        if (isset($validated['status'])) {
            $oldStatus = $return->status;
            $newStatus = $validated['status'];

            // Validate status transition
            if (! $this->isValidStatusTransition($oldStatus, $newStatus)) {
                return response()->json([
                    'message' => "Invalid status transition from $oldStatus to $newStatus",
                ], 422);
            }

            // If approving, record approver and time
            if ($newStatus === 'approved' && $oldStatus === 'pending') {
                $validated['approved_by_user_id'] = $user->id;
                $validated['approved_at'] = now();
            }

            // If completing, process refunds
            if ($newStatus === 'completed' && $oldStatus === 'approved') {
                $this->processRefunds($return, $user);
            }
        }

        $return->update($validated);

        return response()->json(['data' => $return->load(['items.product', 'sale', 'refunds'])]);
    }

    public function destroy(string $id)
    {
        $return = ReturnModel::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $return);

        // Only allow cancellation of pending returns
        if (! in_array($return->status, ['pending', 'rejected'])) {
            return response()->json([
                'message' => 'Only pending or rejected returns can be cancelled',
            ], 422);
        }

        $return->delete();

        return response()->json(['message' => 'Return cancelled']);
    }

    private function generateReturnNumber(string $branchId): string
    {
        $branch = Branch::find($branchId);
        $branchCode = $branch?->code ?? 'BR';
        $date = now()->format('Ymd');
        $random = strtoupper(Str::random(6));

        return 'RET-'.$branchCode.'-'.$date.'-'.$random;
    }

    private function createInventoryMovement(ReturnModel $return, SaleItem $saleItem, array $item, $user): void
    {
        $product = Product::find($saleItem->product_id);
        if (! $product || ! $product->track_inventory) {
            return;
        }

        $warehouse = Warehouse::where('branch_id', $return->branch_id)
            ->where('is_active', true)
            ->first();

        // Positive quantity for return (stock coming back)
        $quantityChange = abs($item['quantity']);

        $stock = ProductStock::where('product_id', $saleItem->product_id)
            ->where('organization_id', $return->organization_id)
            ->when($warehouse?->id, fn ($q) => $q->where('warehouse_id', $warehouse->id))
            ->lockForUpdate()
            ->first();

        $balanceAfter = ($stock?->quantity_on_hand ?? 0) + $quantityChange;

        if ($stock) {
            $stock->update([
                'quantity_on_hand' => $balanceAfter,
                'quantity_available' => ($stock->quantity_available ?? 0) + $quantityChange,
            ]);
        }

        InventoryMovement::create([
            'id' => Str::uuid()->toString(),
            'organization_id' => $return->organization_id,
            'business_id' => $return->business_id,
            'branch_id' => $return->branch_id,
            'warehouse_id' => $warehouse?->id,
            'product_id' => $saleItem->product_id,
            'movement_type' => 'return',
            'quantity_change' => $quantityChange,
            'balance_after' => $balanceAfter,
            'reference_type' => 'return',
            'reference_id' => $return->id,
            'notes' => 'Return '.$return->return_number.' - '.$item['return_reason'],
            'created_by_user_id' => $user->id,
        ]);
    }

    private function getCurrentStock(string $productId, ?string $warehouseId): float
    {
        $stock = ProductStock::where('product_id', $productId)
            ->when($warehouseId, fn ($q) => $q->where('warehouse_id', $warehouseId))
            ->first();

        return $stock?->quantity_on_hand ?? 0;
    }

    private function isValidStatusTransition(string $from, string $to): bool
    {
        $transitions = [
            'pending' => ['approved', 'rejected', 'cancelled'],
            'approved' => ['completed', 'cancelled'],
            'rejected' => ['cancelled'],
            'completed' => [],
            'cancelled' => [],
        ];

        return in_array($to, $transitions[$from] ?? []);
    }

    private function processRefunds(ReturnModel $return, $user): void
    {
        $sale = $return->sale;

        // Get original payment methods
        $originalPayments = $sale->payments->groupBy('payment_method');

        foreach ($originalPayments as $method => $payments) {
            $totalPaid = $payments->sum('amount_minor');

            // Calculate proportional refund amount
            $refundAmount = (int) round(($totalPaid / $sale->paid_total_minor) * $return->grand_total_minor);

            if ($refundAmount <= 0) {
                continue;
            }

            // Determine refund method (prefer original method, fallback to cash)
            $refundMethod = $method;
            if (! in_array($method, ['cash', 'card', 'store_credit'])) {
                $refundMethod = 'cash';
            }

            Refund::create([
                'id' => Str::uuid()->toString(),
                'organization_id' => $return->organization_id,
                'business_id' => $return->business_id,
                'branch_id' => $return->branch_id,
                'return_id' => $return->id,
                'sale_id' => $sale->id,
                'payment_id' => $payments->first()->id,
                'customer_id' => $sale->customer_id,
                'refund_number' => 'RFN-'.strtoupper(Str::random(8)),
                'status' => 'completed',
                'refund_method' => $refundMethod,
                'amount_minor' => $refundAmount,
                'currency' => 'KES',
                'reference' => 'Return '.$return->return_number,
                'processed_by_user_id' => $user->id,
                'processed_at' => now(),
            ]);

            // Update return refunded total
            $return->increment('refunded_total_minor', $refundAmount);

            // Update customer balance if credit sale
            if ($sale->customer_id && $method === 'credit') {
                $customer = Customer::find($sale->customer_id);
                if ($customer) {
                    $customer->decrement('current_balance_minor', $refundAmount);
                }
            }

            // Update cash shift if applicable
            if ($return->shift_id && $refundMethod === 'cash') {
                $shift = CashShift::find($return->shift_id);
                if ($shift) {
                    $shift->increment('cash_refunds_minor', $refundAmount);
                    $shift->decrement('expected_cash_minor', $refundAmount);
                }
            }
        }

        // Queue tax submission update (credit note)
        FiscalizeSaleJob::dispatch($sale->id);
    }
}
