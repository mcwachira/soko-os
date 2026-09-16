<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\ResolveConflictRequest;
use App\Http\Requests\SyncPullRequest;
use App\Http\Requests\SyncPushRequest;
use App\Jobs\FiscalizeSaleJob;
use App\Models\Branch;
use App\Models\CashShift;
use App\Models\Category;
use App\Models\Customer;
use App\Models\InventoryMovement;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\SyncOperation;
use App\Services\Tax\KraEtimsService;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SyncController extends Controller
{
    /**
     * POST /api/v1/sync/push
     * Accepts batched offline operations with idempotency and conflict detection.
     */
    public function push(SyncPushRequest $request, KraEtimsService $kraService)
    {
        $this->authorize('create', SyncOperation::class);

        $validated = $request->validated();
        $user = $request->user();
        $organizationId = $user->organization_id;
        $businessId = $user->business_id ?? $organizationId;

        $accepted = [];
        $rejected = [];
        $conflicts = [];

        foreach ($validated['operations'] as $op) {
            // Check idempotency
            $existing = SyncOperation::where('idempotency_key', $op['idempotency_key'])->first();
            if ($existing) {
                $accepted[] = [
                    'operation_id' => $op['operation_id'],
                    'local_id' => $op['local_id'],
                    'server_id' => $existing->server_id ?? $existing->id,
                ];

                continue;
            }

            DB::beginTransaction();
            try {
                $serverId = null;
                $conflict = null;

                switch ($op['entity_name']) {
                    case 'sales':
                        $serverId = $this->handleSalesOperation($op, $organizationId, $businessId, $validated['branch_id'], $user->id, $kraService);
                        break;
                    case 'customers':
                        $serverId = $this->handleCustomersOperation($op, $organizationId, $businessId, $validated['branch_id'], $user->id);
                        break;
                    case 'inventory_movements':
                        $serverId = $this->handleInventoryMovementOperation($op, $organizationId, $businessId, $validated['branch_id'], $user->id);
                        break;
                    case 'cash_shifts':
                        $serverId = $this->handleCashShiftOperation($op, $organizationId, $businessId, $validated['branch_id'], $user->id);
                        break;
                    case 'products':
                        $result = $this->handleProductsOperationWithConflict($op, $organizationId, $businessId, $validated['branch_id'], $user->id);
                        $serverId = $result['server_id'];
                        $conflict = $result['conflict'];
                        break;
                    default:
                        throw new \InvalidArgumentException("Unknown entity: {$op['entity_name']}");
                }

                $syncOp = SyncOperation::create([
                    'id' => Str::uuid()->toString(),
                    'organization_id' => $organizationId,
                    'branch_id' => $validated['branch_id'],
                    'device_id' => $validated['device_id'],
                    'idempotency_key' => $op['idempotency_key'],
                    'entity_name' => $op['entity_name'],
                    'action' => $op['action'],
                    'local_id' => $op['local_id'],
                    'server_id' => $serverId,
                    'payload' => $op['data'],
                    'status' => $conflict ? 'conflict' : 'accepted',
                ]);

                DB::commit();

                if ($conflict) {
                    $conflicts[] = [
                        'operation_id' => $op['operation_id'],
                        'local_id' => $op['local_id'],
                        'server_version' => $conflict['server_version'],
                        'server_data' => $conflict['server_data'],
                        'resolution' => $conflict['resolution'],
                    ];
                } else {
                    $accepted[] = [
                        'operation_id' => $op['operation_id'],
                        'local_id' => $op['local_id'],
                        'server_id' => $serverId ?? $syncOp->id,
                    ];
                }
            } catch (\Throwable $e) {
                DB::rollBack();
                Log::warning('Sync push operation rejected', [
                    'operation_id' => $op['operation_id'],
                    'entity' => $op['entity_name'],
                    'error' => $e->getMessage(),
                ]);
                $rejected[] = [
                    'operation_id' => $op['operation_id'],
                    'local_id' => $op['local_id'],
                    'reason' => $e->getMessage(),
                ];
            }
        }

        $nextCursor = (string) now()->timestamp;

        if ($nextCursor === (string) now()->timestamp) {
            $nextCursor = (string) (now()->timestamp + 1);
        }

        return response()->json([
            'cursor' => $nextCursor,
            'accepted' => $accepted,
            'rejected' => $rejected,
            'conflicts' => $conflicts,
        ]);
    }

    /**
     * POST /api/v1/sync/pull
     * Returns incremental changes since cursor.
     */
    public function pull(SyncPullRequest $request)
    {
        $this->authorize('viewAny', SyncOperation::class);

        $validated = $request->validated();
        $user = $request->user();
        $organizationId = $user->organization_id;

        $sinceCursor = $validated['since_cursor'] ?? '0';
        $sinceTimestamp = (int) $sinceCursor;
        $limit = $validated['limit'] ?? 500;
        $entities = $validated['entities'] ?? ['products', 'categories', 'customers', 'tax_rules', 'branch_config'];

        $changes = [];

        // Products with delta sync
        if (in_array('products', $entities)) {
            $changes['products'] = Product::where('organization_id', $organizationId)
                ->where('is_active', true)
                ->where('updated_at', '>', now()->subSeconds($sinceTimestamp > 0 ? $sinceTimestamp : 86400))
                ->limit($limit)
                ->get();
        }

        // Categories
        if (in_array('categories', $entities)) {
            $changes['categories'] = Category::where('organization_id', $organizationId)
                ->where('updated_at', '>', now()->subSeconds($sinceTimestamp > 0 ? $sinceTimestamp : 86400))
                ->limit($limit)
                ->get();
        }

        // Customers with delta sync
        if (in_array('customers', $entities)) {
            $changes['customers'] = Customer::where('organization_id', $organizationId)
                ->where('updated_at', '>', now()->subSeconds($sinceTimestamp > 0 ? $sinceTimestamp : 86400))
                ->limit($limit)
                ->get();
        }

        // Tax rules (static for now)
        if (in_array('tax_rules', $entities)) {
            $changes['tax_rules'] = config('tax.rules', []);
        }

        // Branch config
        if (in_array('branch_config', $entities)) {
            $branch = Branch::find($validated['branch_id']);
            $changes['branch_config'] = $branch ? [
                'id' => $branch->id,
                'name' => $branch->name,
                'code' => $branch->code,
                'timezone' => 'Africa/Nairobi',
                'currency' => 'KES',
            ] : [];
        }

        $nextCursor = (string) now()->timestamp;

        if ($nextCursor === (string) now()->timestamp) {
            $nextCursor = (string) (now()->timestamp + 1);
        }

        return response()->json([
            'next_cursor' => $nextCursor,
            'has_more' => count($changes['products'] ?? []) >= $limit,
            'changes' => $changes,
        ]);
    }

    private function handleSalesOperation(array $op, string $organizationId, string $businessId, string $branchId, string $userId, KraEtimsService $kraService): string
    {
        $saleData = $op['data'];
        $saleId = $saleData['id'] ?? Str::uuid()->toString();

        $sale = Sale::create([
            'id' => $saleId,
            'organization_id' => $organizationId,
            'business_id' => $businessId,
            'branch_id' => $branchId,
            'terminal_id' => $saleData['terminal_id'] ?? null,
            'cashier_user_id' => $userId,
            'shift_id' => $saleData['shift_id'] ?? null,
            'customer_id' => $saleData['customer_id'] ?? null,
            'receipt_number' => $saleData['receipt_number'] ?? ('REC-'.strtoupper(Str::random(8))),
            'status' => $saleData['status'] ?? 'completed',
            'subtotal_minor' => $saleData['subtotal_minor'] ?? 0,
            'discount_minor' => $saleData['discount_minor'] ?? 0,
            'tax_total_minor' => $saleData['tax_total_minor'] ?? 0,
            'grand_total_minor' => $saleData['grand_total_minor'] ?? 0,
            'paid_total_minor' => $saleData['paid_total_minor'] ?? 0,
            'change_due_minor' => $saleData['change_due_minor'] ?? 0,
        ]);

        if (! empty($saleData['items'])) {
            foreach ($saleData['items'] as $item) {
                SaleItem::create([
                    'id' => $item['id'] ?? Str::uuid()->toString(),
                    'organization_id' => $sale->organization_id,
                    'sale_id' => $sale->id,
                    'product_id' => $item['product_id'] ?? Str::uuid()->toString(),
                    'sku' => $item['sku'] ?? 'GEN',
                    'name' => $item['name'] ?? 'Item',
                    'quantity' => $item['quantity'] ?? 1,
                    'unit_price_minor' => $item['unit_price_minor'] ?? 0,
                    'discount_minor' => $item['discount_minor'] ?? 0,
                    'tax_rate_percentage' => $item['tax_rate_percentage'] ?? 16,
                    'tax_amount_minor' => $item['tax_amount_minor'] ?? 0,
                    'subtotal_minor' => $item['subtotal_minor'] ?? 0,
                    'total_minor' => $item['total_minor'] ?? 0,
                ]);
            }
        }

        if (! empty($saleData['payments'])) {
            foreach ($saleData['payments'] as $payment) {
                Payment::create([
                    'id' => $payment['id'] ?? Str::uuid()->toString(),
                    'organization_id' => $sale->organization_id,
                    'sale_id' => $sale->id,
                    'amount_minor' => $payment['amount_minor'] ?? 0,
                    'currency' => $payment['currency'] ?? 'KES',
                    'payment_method' => $payment['payment_method'] ?? 'cash',
                    'status' => $payment['status'] ?? 'completed',
                    'reference' => $payment['reference'] ?? null,
                ]);
            }
        }

        // Queue KRA fiscalization async
        FiscalizeSaleJob::dispatch($sale->id);

        return $sale->id;
    }

    private function handleCustomersOperation(array $op, string $organizationId, string $businessId, string $branchId, string $userId): string
    {
        $data = $op['data'];
        $action = $op['action'];

        if ($action === 'create') {
            $customer = Customer::create([
                'id' => $data['id'] ?? Str::uuid()->toString(),
                'organization_id' => $organizationId,
                'business_id' => $businessId,
                'code' => $data['code'] ?? null,
                'name' => $data['name'] ?? 'Customer',
                'phone' => $data['phone'] ?? null,
                'email' => $data['email'] ?? null,
                'tax_pin' => $data['tax_pin'] ?? null,
                'credit_limit_minor' => $data['credit_limit_minor'] ?? 0,
                'current_balance_minor' => $data['current_balance_minor'] ?? 0,
                'loyalty_points' => $data['loyalty_points'] ?? 0,
                'price_level' => $data['price_level'] ?? 'retail',
            ]);

            return $customer->id;
        } elseif ($action === 'update') {
            $customer = Customer::where('id', $op['local_id'])->where('organization_id', $organizationId)->first();
            if ($customer) {
                $customer->update($data);

                return $customer->id;
            }
            throw new \Exception('Customer not found for update');
        }

        throw new \InvalidArgumentException("Unsupported action for customers: {$action}");
    }

    private function handleInventoryMovementOperation(array $op, string $organizationId, string $businessId, string $branchId, string $userId): string
    {
        $data = $op['data'];
        $action = $op['action'];

        if ($action === 'create') {
            $movement = InventoryMovement::create([
                'id' => $data['id'] ?? Str::uuid()->toString(),
                'organization_id' => $organizationId,
                'business_id' => $businessId,
                'branch_id' => $branchId,
                'warehouse_id' => $data['warehouse_id'] ?? null,
                'product_id' => $data['product_id'],
                'movement_type' => $data['movement_type'],
                'quantity_change' => $data['quantity_change'],
                'balance_after' => $data['balance_after'],
                'reference_type' => $data['reference_type'],
                'reference_id' => $data['reference_id'],
                'notes' => $data['notes'] ?? null,
                'created_by_user_id' => $userId,
            ]);

            return $movement->id;
        }

        throw new \InvalidArgumentException("Unsupported action for inventory_movements: {$action}");
    }

    private function handleCashShiftOperation(array $op, string $organizationId, string $businessId, string $branchId, string $userId): string
    {
        $data = $op['data'];
        $action = $op['action'];

        if ($action === 'create') {
            $shift = CashShift::create([
                'id' => $data['id'] ?? Str::uuid()->toString(),
                'organization_id' => $organizationId,
                'business_id' => $businessId,
                'branch_id' => $branchId,
                'terminal_id' => $data['terminal_id'],
                'cashier_user_id' => $userId,
                'status' => $data['status'] ?? 'open',
                'opened_at' => $data['opened_at'] ?? now(),
                'opening_float_minor' => $data['opening_float_minor'] ?? 0,
            ]);

            return $shift->id;
        } elseif ($action === 'update') {
            $shift = CashShift::where('id', $op['local_id'])->where('organization_id', $organizationId)->first();
            if ($shift) {
                $shift->update($data);

                return $shift->id;
            }
            throw new \Exception('Cash shift not found for update');
        }

        throw new \InvalidArgumentException("Unsupported action for cash_shifts: {$action}");
    }

    private function handleProductsOperation(array $op, string $organizationId, string $businessId, string $branchId, string $userId): string
    {
        $data = $op['data'];
        $action = $op['action'];

        if ($action === 'update') {
            $product = Product::where('id', $op['local_id'])->where('organization_id', $organizationId)->first();
            if ($product) {
                $product->update($data);

                return $product->id;
            }
            throw new \Exception('Product not found for update');
        }

        throw new \InvalidArgumentException("Unsupported action for products: {$action}");
    }

    private function handleProductsOperationWithConflict(array $op, string $organizationId, string $businessId, string $branchId, string $userId): array
    {
        $data = $op['data'];
        $action = $op['action'];

        if ($action === 'update') {
            $product = Product::where('id', $op['local_id'])->where('organization_id', $organizationId)->first();

            if (! $product) {
                throw new \Exception('Product not found for update');
            }

            // Check for version conflict (optimistic locking)
            $clientVersion = $data['version'] ?? 1;
            if ($product->version !== $clientVersion) {
                // Conflict detected - return server version for client to resolve
                return [
                    'server_id' => $product->id,
                    'conflict' => [
                        'server_version' => $product->version,
                        'server_data' => [
                            'id' => $product->id,
                            'name' => $product->name,
                            'selling_price_minor' => $product->selling_price_minor,
                            'cost_price_minor' => $product->cost_price_minor,
                            'version' => $product->version,
                        ],
                        'resolution' => 'server_wins', // Default resolution strategy
                    ],
                ];
            }

            // No conflict - update with incremented version
            $data['version'] = $product->version + 1;
            $product->update($data);

            return [
                'server_id' => $product->id,
                'conflict' => null,
            ];
        }

        throw new \InvalidArgumentException("Unsupported action for products: {$action}");
    }

    /**
     * POST /api/v1/sync/conflicts/{syncOperationId}/resolve
     * Resolve a sync conflict.
     */
    public function resolveConflict(ResolveConflictRequest $request, string $syncOperationId)
    {
        $validated = $request->validated();
        $user = $request->user();
        $organizationId = $user->organization_id;

        $syncOp = SyncOperation::where('id', $syncOperationId)
            ->where('organization_id', $organizationId)
            ->where('status', 'conflict')
            ->firstOrFail();

        $resolution = $validated['resolution'];
        $mergedData = $validated['merged_data'] ?? null;

        DB::beginTransaction();
        try {
            $result = $this->applyConflictResolution($syncOp, $resolution, $mergedData, $user, $organizationId);

            $syncOp->update([
                'status' => 'accepted',
                'error_message' => null,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Conflict resolved successfully',
                'resolution' => $resolution,
                'result' => $result,
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Conflict resolution failed', [
                'sync_operation_id' => $syncOperationId,
                'resolution' => $resolution,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Conflict resolution failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * GET /api/v1/sync/conflicts
     * List unresolved conflicts.
     */
    public function listConflicts(Request $request)
    {
        $this->authorize('viewAny', SyncOperation::class);

        $user = $request->user();
        $organizationId = $user->organization_id;

        $conflicts = SyncOperation::where('organization_id', $organizationId)
            ->where('status', 'conflict')
            ->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 25));

        return response()->json($conflicts);
    }

    private function applyConflictResolution(SyncOperation $syncOp, string $resolution, ?array $mergedData, $user, string $organizationId): array
    {
        $entityName = $syncOp->entity_name;
        $payload = $syncOp->payload;

        switch ($resolution) {
            case 'server_wins':
                return [
                    'action' => 'server_wins',
                    'message' => 'Server version kept, client changes discarded',
                ];

            case 'client_wins':
                return $this->applyClientChanges($syncOp, $payload, $user, $organizationId);

            case 'merge':
                if (! $mergedData) {
                    throw new \InvalidArgumentException('Merged data required for merge resolution');
                }

                return $this->applyMergedChanges($syncOp, $mergedData, $user, $organizationId);

            default:
                throw new \InvalidArgumentException("Unknown resolution strategy: {$resolution}");
        }
    }

    private function applyClientChanges(SyncOperation $syncOp, array $payload, $user, string $organizationId): array
    {
        $entityName = $syncOp->entity_name;

        switch ($entityName) {
            case 'products':
                $product = Product::where('id', $syncOp->local_id)
                    ->where('organization_id', $organizationId)
                    ->firstOrFail();

                $payload['version'] = $product->version + 1;
                $product->update($payload);

                return ['action' => 'client_wins', 'server_id' => $product->id];

            case 'customers':
                $customer = Customer::where('id', $syncOp->local_id)
                    ->where('organization_id', $organizationId)
                    ->firstOrFail();

                $customer->update($payload);

                return ['action' => 'client_wins', 'server_id' => $customer->id];

            default:
                throw new \InvalidArgumentException("Client-wins resolution not supported for entity: {$entityName}");
        }
    }

    private function applyMergedChanges(SyncOperation $syncOp, array $mergedData, $user, string $organizationId): array
    {
        $entityName = $syncOp->entity_name;

        switch ($entityName) {
            case 'products':
                $product = Product::where('id', $syncOp->local_id)
                    ->where('organization_id', $organizationId)
                    ->firstOrFail();

                $mergedData['version'] = $product->version + 1;
                $product->update($mergedData);

                return ['action' => 'merge', 'server_id' => $product->id];

            case 'customers':
                $customer = Customer::where('id', $syncOp->local_id)
                    ->where('organization_id', $organizationId)
                    ->firstOrFail();

                $customer->update($mergedData);

                return ['action' => 'merge', 'server_id' => $customer->id];

            default:
                throw new \InvalidArgumentException("Merge resolution not supported for entity: {$entityName}");
        }
    }

    public function mpesaWebhook(Request $request)
    {
        return response()->json(['message' => 'Webhook received'], 200);
    }

    public function kraWebhook(Request $request)
    {
        return response()->json(['message' => 'Webhook received'], 200);
    }
}
