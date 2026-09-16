<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSaleRequest;
use App\Jobs\FiscalizeSaleJob;
use App\Models\Branch;
use App\Models\CashShift;
use App\Models\Customer;
use App\Models\InventoryMovement;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductStock;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\SyncOperation;
use App\Models\Warehouse;
use App\Services\Accounting\AccountingService;
use App\Services\OutboxService;
use App\Services\ReceiptService;
use App\Services\Tax\KraEtimsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SaleController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Sale::class);

        $sales = Sale::with(['items', 'payments'])
            ->where('organization_id', $request->user()->organization_id)
            ->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 25));

        return response()->json($sales);
    }

    public function show(string $id)
    {
        $sale = Sale::with(['items', 'payments', 'taxSubmissions'])
            ->where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('view', $sale);

        return response()->json(['data' => $sale]);
    }

    public function store(StoreSaleRequest $request, KraEtimsService $kraService, AccountingService $accountingService)
    {
        $this->authorize('create', Sale::class);

        $validated = $request->validated();
        $user = $request->user();
        $organizationId = $user->organization_id;
        $businessId = $user->business_id ?? $organizationId;

        $idempotencyKey = $validated['idempotency_key'] ?? null;

        if ($idempotencyKey) {
            $existingOperation = SyncOperation::where('idempotency_key', $idempotencyKey)
                ->where('entity_name', 'sales')
                ->where('organization_id', $organizationId)
                ->first();

            if ($existingOperation && $existingOperation->status === 'accepted' && $existingOperation->server_id) {
                $existingSale = Sale::with(['items', 'payments'])->find($existingOperation->server_id);

                return response()->json(['data' => $existingSale, 'idempotent' => true]);
            }

            if ($existingOperation && $existingOperation->status === 'pending') {
                return response()->json(['message' => 'Sale is already being processed with this idempotency key.'], 409);
            }
        }

        return DB::transaction(function () use ($validated, $user, $organizationId, $businessId, $idempotencyKey, $request, $accountingService, $kraService) {
            $paidTotalMinor = 0;
            $taxTotalMinor = 0;
            $subtotalMinor = 0;
            $discountTotalMinor = $validated['discount_minor'] ?? 0;

            foreach ($validated['items'] as $item) {
                $product = Product::where('id', $item['product_id'])
                    ->where('organization_id', $organizationId)
                    ->firstOrFail();

                if (! $product->is_active) {
                    return response()->json([
                        'message' => "Product '{$product->name}' is inactive and cannot be sold.",
                    ], 422);
                }

                $itemTotal = (int) ($item['quantity'] * $item['unit_price_minor']) - ($item['discount_minor'] ?? 0);
                $rate = $item['tax_rate_percentage'] ?? 16.0;
                $taxAmount = $rate > 0 ? (int) round(($itemTotal * $rate) / (100 + $rate)) : 0;

                $taxTotalMinor += $taxAmount;
                $subtotalMinor += ($itemTotal - $taxAmount);

                if ($product->track_inventory) {
                    $warehouse = Warehouse::where('branch_id', $validated['branch_id'])
                        ->where('organization_id', $organizationId)
                        ->where('is_active', true)
                        ->first();

                    $stock = ProductStock::where('product_id', $product->id)
                        ->where('organization_id', $organizationId)
                        ->when($warehouse?->id, fn ($q) => $q->where('warehouse_id', $warehouse->id))
                        ->lockForUpdate()
                        ->first();

                    $available = $stock?->quantity_available ?? 0;
                    if ($available < $item['quantity']) {
                        return response()->json([
                            'message' => "Insufficient stock for '{$product->name}'. Available: ".rtrim(rtrim(number_format($available, 4, '.', ''), '0'), '.').", requested: {$item['quantity']}.",
                        ], 422);
                    }
                }
            }

            $grandTotalMinor = $subtotalMinor + $taxTotalMinor - $discountTotalMinor;
            if ($grandTotalMinor < 0) {
                $grandTotalMinor = 0;
            }

            foreach ($validated['payments'] as $payment) {
                $paidTotalMinor += $payment['amount_minor'];
            }

            if ($paidTotalMinor !== $grandTotalMinor) {
                return response()->json([
                    'message' => 'Payment total does not match grand total.',
                    'grand_total_minor' => $grandTotalMinor,
                    'paid_total_minor' => $paidTotalMinor,
                ], 422);
            }

            $changeDueMinor = $paidTotalMinor > $grandTotalMinor ? $paidTotalMinor - $grandTotalMinor : 0;

            $sale = Sale::create([
                'id' => Str::uuid()->toString(),
                'organization_id' => $organizationId,
                'business_id' => $businessId,
                'branch_id' => $validated['branch_id'],
                'terminal_id' => $validated['terminal_id'] ?? null,
                'cashier_user_id' => $user->id,
                'shift_id' => $validated['shift_id'] ?? null,
                'customer_id' => $validated['customer_id'] ?? null,
                'receipt_number' => $this->generateReceiptNumber($validated['branch_id']),
                'status' => 'completed',
                'subtotal_minor' => $subtotalMinor,
                'discount_minor' => $discountTotalMinor,
                'tax_total_minor' => $taxTotalMinor,
                'grand_total_minor' => $grandTotalMinor,
                'paid_total_minor' => $paidTotalMinor,
                'change_due_minor' => $changeDueMinor,
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($validated['items'] as $item) {
                $product = Product::where('id', $item['product_id'])
                    ->where('organization_id', $organizationId)
                    ->firstOrFail();

                $itemTotal = (int) ($item['quantity'] * $item['unit_price_minor']) - ($item['discount_minor'] ?? 0);
                $rate = $item['tax_rate_percentage'] ?? 16.0;
                $taxAmount = $rate > 0 ? (int) round(($itemTotal * $rate) / (100 + $rate)) : 0;

                SaleItem::create([
                    'id' => Str::uuid()->toString(),
                    'organization_id' => $sale->organization_id,
                    'sale_id' => $sale->id,
                    'product_id' => $item['product_id'],
                    'sku' => $item['sku'],
                    'name' => $item['name'],
                    'quantity' => $item['quantity'],
                    'unit_price_minor' => $item['unit_price_minor'],
                    'discount_minor' => $item['discount_minor'] ?? 0,
                    'tax_rate_percentage' => $rate,
                    'tax_amount_minor' => $taxAmount,
                    'subtotal_minor' => $itemTotal - $taxAmount,
                    'total_minor' => $itemTotal,
                ]);

                $this->createInventoryMovement($sale, $item, $user);
            }

            foreach ($validated['payments'] as $payment) {
                Payment::create([
                    'id' => Str::uuid()->toString(),
                    'organization_id' => $sale->organization_id,
                    'sale_id' => $sale->id,
                    'amount_minor' => $payment['amount_minor'],
                    'currency' => 'KES',
                    'payment_method' => $payment['payment_method'],
                    'status' => 'completed',
                    'reference' => $payment['reference'] ?? null,
                ]);
            }

            if (! empty($validated['shift_id'])) {
                $this->updateCashShift($validated['shift_id'], $validated['payments']);
            }

            if (! empty($validated['customer_id'])) {
                $this->updateCustomerBalance($validated['customer_id'], $validated['payments'], $paidTotalMinor, $grandTotalMinor);
            }

            $this->queueTaxSubmission($sale);

            OutboxService::record('sale.created', [
                'sale_id' => $sale->id,
                'receipt_number' => $sale->receipt_number,
                'grand_total_minor' => $sale->grand_total_minor,
                'payment_methods' => collect($validated['payments'])->pluck('payment_method')->unique()->values()->all(),
            ], $organizationId);

            try {
                $journalEntry = $accountingService->generateJournalEntry($sale->load('items', 'payments', 'customer'));

                if ($journalEntry) {
                    $sale->update(['accounting_sync_status' => 'synced']);
                    $sale->setAccountingInvoiceId($accountingService->getProviderName(), $journalEntry->id);
                }
            } catch (\Throwable $e) {
                Log::warning('Accounting journal entry creation failed', [
                    'sale_id' => $sale->id,
                    'error' => $e->getMessage(),
                ]);
            }

            if ($idempotencyKey) {
                SyncOperation::create([
                    'id' => Str::uuid()->toString(),
                    'organization_id' => $organizationId,
                    'branch_id' => $sale->branch_id,
                    'device_id' => $request->header('X-Device-UUID', 'web'),
                    'idempotency_key' => $idempotencyKey,
                    'entity_name' => 'sales',
                    'action' => 'create',
                    'local_id' => $validated['local_id'] ?? $sale->id,
                    'server_id' => $sale->id,
                    'payload' => $validated,
                    'status' => 'accepted',
                ]);
            }

            return response()->json(['data' => $sale->load(['items', 'payments'])], 201);
        });
    }

    private function generateReceiptNumber(string $branchId): string
    {
        $branch = Branch::find($branchId);
        $branchCode = $branch?->code ?? 'BR';
        $date = now()->format('Ymd');
        $random = strtoupper(Str::random(6));

        return "REC-{$branchCode}-{$date}-{$random}";
    }

    private function createInventoryMovement(Sale $sale, array $item, $user): void
    {
        $product = Product::find($item['product_id']);
        if (! $product || ! $product->track_inventory) {
            return;
        }

        $warehouse = Warehouse::where('branch_id', $sale->branch_id)
            ->where('is_active', true)
            ->first();

        $quantityChange = -abs($item['quantity']); // Negative for sale

        $stock = ProductStock::where('product_id', $item['product_id'])
            ->where('organization_id', $sale->organization_id)
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
            'organization_id' => $sale->organization_id,
            'business_id' => $sale->business_id,
            'branch_id' => $sale->branch_id,
            'warehouse_id' => $warehouse?->id,
            'product_id' => $item['product_id'],
            'movement_type' => 'sale',
            'quantity_change' => $quantityChange,
            'balance_after' => $balanceAfter,
            'reference_type' => 'sale',
            'reference_id' => $sale->id,
            'notes' => "Sale {$sale->receipt_number}",
            'created_by_user_id' => $user->id,
        ]);
    }

    private function getCurrentStock(string $productId, ?string $warehouseId): float
    {
        $query = InventoryMovement::where('product_id', $productId)
            ->where('organization_id', request()->user()->organization_id);

        if ($warehouseId) {
            $query->where('warehouse_id', $warehouseId);
        }

        $lastMovement = $query->latest('created_at')->lockForUpdate()->first();

        return $lastMovement?->balance_after ?? 0;
    }

    private function updateCashShift(string $shiftId, array $payments): void
    {
        $shift = CashShift::find($shiftId);
        if (! $shift) {
            return;
        }

        $cashSales = 0;
        $cashIn = 0;
        $cashOut = 0;
        $cashRefunds = 0;

        foreach ($payments as $payment) {
            if ($payment['payment_method'] === 'cash') {
                $cashSales += $payment['amount_minor'];
            }
        }

        $shift->increment('cash_sales_minor', $cashSales);
        $shift->increment('expected_cash_minor', $cashSales);
    }

    private function updateCustomerBalance(string $customerId, array $payments, int $paidTotalMinor, int $grandTotalMinor): void
    {
        $customer = Customer::find($customerId);
        if (! $customer) {
            return;
        }

        $creditPayments = collect($payments)
            ->where('payment_method', 'credit')
            ->sum('amount_minor');

        if ($creditPayments > 0) {
            $customer->increment('current_balance_minor', $creditPayments);
        }
    }

    private function queueTaxSubmission(Sale $sale): void
    {
        // Dispatch to queue for async processing
        FiscalizeSaleJob::dispatch($sale->id);
    }

    /**
     * GET /api/v1/sales/{id}/receipt
     * Generate receipt for a sale (HTML or ESC/POS)
     */
    public function receipt(string $id, Request $request)
    {
        $this->authorize('view', Sale::findOrFail($id));

        $format = $request->query('format', 'html');

        $sale = Sale::with([
            'items.product',
            'payments',
            'customer',
            'cashier',
            'branch.business',
            'branch',
            'terminal',
            'cashier',
        ])
            ->where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        if ($format === 'escpos') {
            $receipt = ReceiptService::generateEscPos($sale);

            return response($receipt)
                ->header('Content-Type', 'application/octet-stream')
                ->header('Content-Disposition', 'attachment; filename="receipt-'.$sale->receipt_number.'.txt"');
        }

        $html = ReceiptService::generateHtml($sale);

        return response($html)
            ->header('Content-Type', 'text/html');
    }
}
