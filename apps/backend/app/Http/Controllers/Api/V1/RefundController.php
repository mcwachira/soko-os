<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\StoreRefundRequest;
use App\Jobs\FiscalizeSaleJob;
use App\Models\CashShift;
use App\Models\Customer;
use App\Models\Refund;
use App\Models\RefundItem;
use App\Models\ReturnModel;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class RefundController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Refund::class);

        $refunds = Refund::with(['items.saleItem', 'return', 'sale', 'customer', 'processor'])
            ->where('organization_id', $request->user()->organization_id)
            ->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 25));

        return response()->json($refunds);
    }

    public function show(string $id)
    {
        $refund = Refund::with(['items.saleItem.product', 'return', 'sale', 'customer', 'payment', 'processor', 'branch'])
            ->where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('view', $refund);

        return response()->json(['data' => $refund]);
    }

    public function store(StoreRefundRequest $request)
    {
        $this->authorize('create', Refund::class);

        $validated = $request->validated();
        $user = $request->user();
        $organizationId = $user->organization_id;
        $businessId = $user->business_id ?? $organizationId;

        return DB::transaction(function () use ($validated, $user, $organizationId, $businessId) {
            $sale = Sale::where('id', $validated['sale_id'])
                ->where('organization_id', $organizationId)
                ->with(['items', 'payments', 'customer'])
                ->firstOrFail();

            $refund = Refund::create([
                'id' => Str::uuid()->toString(),
                'organization_id' => $organizationId,
                'business_id' => $businessId,
                'branch_id' => $validated['branch_id'] ?? $sale->branch_id,
                'return_id' => $validated['return_id'] ?? null,
                'sale_id' => $sale->id,
                'payment_id' => $validated['payment_id'] ?? null,
                'customer_id' => $validated['customer_id'] ?? $sale->customer_id,
                'refund_number' => 'RFN-'.strtoupper(Str::random(8)),
                'status' => 'pending',
                'refund_method' => $validated['refund_method'],
                'amount_minor' => $validated['amount_minor'],
                'currency' => $validated['currency'] ?? 'KES',
                'reference' => $validated['reference'] ?? null,
                'reason' => $validated['reason'] ?? null,
            ]);

            if (! empty($validated['items'])) {
                foreach ($validated['items'] as $item) {
                    $saleItem = SaleItem::where('id', $item['sale_item_id'])
                        ->where('sale_id', $sale->id)
                        ->firstOrFail();

                    $itemTotal = (int) ($item['quantity'] * $saleItem->unit_price_minor);
                    $taxAmount = $itemTotal > 0 ? (int) round(($itemTotal * $saleItem->tax_rate_percentage) / 100) : 0;

                    RefundItem::create([
                        'id' => Str::uuid()->toString(),
                        'refund_id' => $refund->id,
                        'sale_item_id' => $saleItem->id,
                        'quantity' => $item['quantity'],
                        'unit_price_minor' => $saleItem->unit_price_minor,
                        'tax_amount_minor' => $taxAmount,
                        'total_minor' => $itemTotal,
                    ]);
                }
            }

            // Process the refund immediately for cash/store_credit
            if (in_array($validated['refund_method'], ['cash', 'store_credit'])) {
                $this->completeRefund($refund, $user);
            }

            Log::info('Refund created', [
                'refund_id' => $refund->id,
                'refund_number' => $refund->refund_number,
                'sale_id' => $sale->id,
                'user_id' => $user->id,
                'amount_minor' => $validated['amount_minor'],
            ]);

            return response()->json(['data' => $refund->load(['items.saleItem', 'sale'])], 201);
        });
    }

    public function complete(string $id, Request $request)
    {
        $refund = Refund::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $refund);

        if ($refund->status !== 'pending') {
            return response()->json([
                'message' => 'Only pending refunds can be completed',
            ], 422);
        }

        return DB::transaction(function () use ($refund, $request) {
            $this->completeRefund($refund, $request->user());

            return response()->json(['data' => $refund->load(['items.saleItem', 'sale'])]);
        });
    }

    private function completeRefund(Refund $refund, $user): void
    {
        $sale = $refund->sale;

        $refund->update([
            'status' => 'completed',
            'processed_by_user_id' => $user->id,
            'processed_at' => now(),
        ]);

        // Update customer balance if credit
        if ($sale->customer_id && $refund->refund_method === 'credit') {
            $customer = Customer::find($sale->customer_id);
            if ($customer) {
                $customer->decrement('current_balance_minor', $refund->amount_minor);
            }
        }

        // Update cash shift if applicable
        if ($refund->refund_method === 'cash') {
            // Find active shift for this branch
            $shift = CashShift::where('branch_id', $refund->branch_id)
                ->where('status', 'open')
                ->latest('opened_at')
                ->first();

            if ($shift) {
                $shift->increment('cash_refunds_minor', $refund->amount_minor);
                $shift->decrement('expected_cash_minor', $refund->amount_minor);
            }
        }

        // Update return refunded total if linked
        if ($refund->return_id) {
            $return = ReturnModel::find($refund->return_id);
            if ($return) {
                $return->increment('refunded_total_minor', $refund->amount_minor);

                // Check if fully refunded
                if ($return->refunded_total_minor >= $return->grand_total_minor) {
                    $return->update(['status' => 'completed']);
                }
            }
        }

        // Queue tax submission update (credit note)
        FiscalizeSaleJob::dispatch($sale->id);

        Log::info('Refund completed', [
            'refund_id' => $refund->id,
            'refund_number' => $refund->refund_number,
            'sale_id' => $sale->id,
        ]);
    }
}
