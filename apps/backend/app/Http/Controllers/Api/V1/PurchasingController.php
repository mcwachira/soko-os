<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Supplier;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\GoodsReceivedNote;
use App\Models\GoodsReceivedNoteItem;
use App\Models\InventoryMovement;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PurchasingController extends Controller
{
    // Suppliers
    public function suppliersIndex(Request $request)
    {
        $this->authorize('viewAny', Supplier::class);

        $query = Supplier::where('organization_id', $request->user()->organization_id)
            ->with('business');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                    ->orWhere('email', 'ilike', "%{$search}%")
                    ->orWhere('phone', 'ilike', "%{$search}%");
            });
        }

        $suppliers = $query->orderBy('name')
            ->paginate($request->integer('per_page', 50));

        return response()->json($suppliers);
    }

    public function suppliersShow(string $id)
    {
        $supplier = Supplier::where('organization_id', request()->user()->organization_id)
            ->with('business')
            ->findOrFail($id);

        $this->authorize('view', $supplier);

        return response()->json(['data' => $supplier]);
    }

    public function suppliersStore(Request $request)
    {
        $this->authorize('create', Supplier::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'tax_pin' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'credit_limit_minor' => 'nullable|integer|min:0',
        ]);

        $user = $request->user();

        $supplier = Supplier::create([
            'id' => Str::uuid()->toString(),
            'organization_id' => $user->organization_id,
            'business_id' => $user->business_id,
            'name' => $validated['name'],
            'contact_person' => $validated['contact_person'] ?? null,
            'email' => $validated['email'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'tax_pin' => $validated['tax_pin'] ?? null,
            'address' => $validated['address'] ?? null,
            'credit_limit_minor' => $validated['credit_limit_minor'] ?? 0,
            'current_balance_minor' => 0,
        ]);

        return response()->json(['data' => $supplier->load('business')], 201);
    }

    public function suppliersUpdate(Request $request, string $id)
    {
        $supplier = Supplier::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $supplier);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => 'nullable|string|max:50',
            'tax_pin' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'credit_limit_minor' => 'nullable|integer|min:0',
            'is_active' => 'sometimes|boolean',
        ]);

        $supplier->update($validated);

        return response()->json(['data' => $supplier->load('business')]);
    }

    public function suppliersDestroy(string $id)
    {
        $supplier = Supplier::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $supplier);

        $supplier->delete();

        return response()->json(['message' => 'Supplier deleted']);
    }

    // Purchase Orders
    public function purchaseOrdersIndex(Request $request)
    {
        $this->authorize('viewAny', PurchaseOrder::class);

        $query = PurchaseOrder::where('organization_id', $request->user()->organization_id)
            ->with(['supplier', 'branch', 'warehouse', 'user']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        $purchaseOrders = $query->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 25));

        return response()->json($purchaseOrders);
    }

    public function purchaseOrdersShow(string $id)
    {
        $purchaseOrder = PurchaseOrder::with(['items.product', 'supplier', 'branch', 'warehouse', 'user'])
            ->where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('view', $purchaseOrder);

        return response()->json(['data' => $purchaseOrder]);
    }

    public function purchaseOrdersStore(Request $request)
    {
        $this->authorize('create', PurchaseOrder::class);

        $validated = $request->validate([
            'supplier_id' => 'required|uuid|exists:suppliers,id',
            'branch_id' => 'required|uuid|exists:branches,id',
            'warehouse_id' => 'required|uuid|exists:warehouses,id',
            'expected_date' => 'nullable|date',
            'notes' => 'nullable|string|max:1000',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|uuid|exists:products,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price_minor' => 'required|integer|min:0',
            'items.*.discount_minor' => 'nullable|integer|min:0',
            'items.*.tax_rate_percentage' => 'nullable|numeric|min:0',
        ]);

        $user = $request->user();

        return DB::transaction(function () use ($validated, $user) {
            $subtotalMinor = 0;
            $taxTotalMinor = 0;

            $poItems = [];
            foreach ($validated['items'] as $item) {
                $product = \App\Models\Product::find($item['product_id']);
                $quantity = (float) $item['quantity'];
                $unitPrice = (int) $item['unit_price_minor'];
                $discount = (int) ($item['discount_minor'] ?? 0);
                $taxRate = (float) ($item['tax_rate_percentage'] ?? 16.0);
                $itemSubtotal = ($quantity * $unitPrice) - $discount;
                $taxAmount = $taxRate > 0 ? (int) round(($itemSubtotal * $taxRate) / (100 + $taxRate)) : 0;
                $itemTotal = $itemSubtotal + $taxAmount;

                $subtotalMinor += $itemSubtotal;
                $taxTotalMinor += $taxAmount;

                $poItems[] = [
                    'id' => Str::uuid()->toString(),
                    'product_id' => $product->id,
                    'sku' => $product->sku,
                    'name' => $product->name,
                    'quantity' => $quantity,
                    'unit_price_minor' => $unitPrice,
                    'discount_minor' => $discount,
                    'tax_rate_percentage' => $taxRate,
                    'tax_amount_minor' => $taxAmount,
                    'subtotal_minor' => $itemSubtotal,
                    'total_minor' => $itemTotal,
                    'received_quantity' => 0,
                ];
            }

            $grandTotalMinor = $subtotalMinor + $taxTotalMinor;

            $po = PurchaseOrder::create([
                'id' => Str::uuid()->toString(),
                'organization_id' => $user->organization_id,
                'business_id' => $user->business_id,
                'branch_id' => $validated['branch_id'],
                'warehouse_id' => $validated['warehouse_id'],
                'supplier_id' => $validated['supplier_id'],
                'user_id' => $user->id,
                'po_number' => $this->generatePONumber($validated['branch_id']),
                'status' => 'draft',
                'subtotal_minor' => $subtotalMinor,
                'tax_total_minor' => $taxTotalMinor,
                'grand_total_minor' => $grandTotalMinor,
                'expected_date' => $validated['expected_date'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($poItems as $poItem) {
                $poItem['purchase_order_id'] = $po->id;
                PurchaseOrderItem::create($poItem);
            }

            return response()->json(['data' => $po->load('items.product')], 201);
        });
    }

    public function purchaseOrdersUpdate(Request $request, string $id)
    {
        $po = PurchaseOrder::where('organization_id', $request->user()->organization_id)
            ->where('status', 'draft')
            ->findOrFail($id);

        $this->authorize('update', $po);

        $validated = $request->validate([
            'expected_date' => 'nullable|date',
            'notes' => 'nullable|string|max:1000',
            'status' => 'sometimes|string|in:draft',
        ]);

        $po->update($validated);

        return response()->json(['data' => $po->load('items.product', 'supplier')]);
    }

    public function purchaseOrdersApprove(Request $request, string $id)
    {
        $po = PurchaseOrder::where('organization_id', $request->user()->organization_id)
            ->where('status', 'draft')
            ->findOrFail($id);

        $this->authorize('update', $po);

        $po->update(['status' => 'approved']);

        Log::info('Purchase order approved', [
            'po_id' => $po->id,
            'po_number' => $po->po_number,
            'user_id' => $request->user()->id,
        ]);

        return response()->json(['data' => $po->load('items.product', 'supplier')]);
    }

    public function purchaseOrdersCancel(Request $request, string $id)
    {
        $po = PurchaseOrder::where('organization_id', $request->user()->organization_id)
            ->whereIn('status', ['draft', 'approved', 'partial_received'])
            ->findOrFail($id);

        $this->authorize('update', $po);

        $po->update(['status' => 'cancelled']);

        Log::info('Purchase order cancelled', [
            'po_id' => $po->id,
            'po_number' => $po->po_number,
            'user_id' => $request->user()->id,
        ]);

        return response()->json(['data' => $po->load('items.product', 'supplier')]);
    }

    // GRNs
    public function grnsIndex(Request $request)
    {
        $this->authorize('viewAny', GoodsReceivedNote::class);

        $query = GoodsReceivedNote::where('organization_id', $request->user()->organization_id)
            ->with(['purchaseOrder', 'supplier', 'receivedBy', 'branch', 'warehouse']);

        if ($request->has('purchase_order_id')) {
            $query->where('purchase_order_id', $request->purchase_order_id);
        }

        $grns = $query->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 25));

        return response()->json($grns);
    }

    public function grnsShow(string $id)
    {
        $grn = GoodsReceivedNote::with(['items.product', 'purchaseOrder.items', 'supplier', 'receivedBy', 'branch', 'warehouse'])
            ->where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('view', $grn);

        return response()->json(['data' => $grn]);
    }

    public function grnsStore(Request $request)
    {
        $this->authorize('create', GoodsReceivedNote::class);

        $validated = $request->validate([
            'purchase_order_id' => 'required|uuid|exists:purchase_orders,id',
            'branch_id' => 'required|uuid|exists:branches,id',
            'warehouse_id' => 'required|uuid|exists:warehouses,id',
            'notes' => 'nullable|string|max:1000',
            'items' => 'required|array|min:1',
            'items.*.purchase_order_item_id' => 'required|uuid|exists:purchase_order_items,id',
            'items.*.quantity_received' => 'required|numeric|min:0.01',
            'items.*.unit_cost_minor' => 'required|integer|min:0',
        ]);

        $user = $request->user();
        $po = PurchaseOrder::where('id', $validated['purchase_order_id'])
            ->where('organization_id', $user->organization_id)
            ->with('items')
            ->firstOrFail();

        return DB::transaction(function () use ($validated, $user, $po) {
            $grn = GoodsReceivedNote::create([
                'id' => Str::uuid()->toString(),
                'organization_id' => $user->organization_id,
                'business_id' => $user->business_id,
                'branch_id' => $validated['branch_id'],
                'warehouse_id' => $validated['warehouse_id'],
                'purchase_order_id' => $po->id,
                'supplier_id' => $po->supplier_id,
                'grn_number' => $this->generateGRNNumber($validated['branch_id']),
                'received_by_user_id' => $user->id,
                'notes' => $validated['notes'] ?? null,
            ]);

            $totalReceived = 0;

            foreach ($validated['items'] as $item) {
                $poItem = PurchaseOrderItem::where('id', $item['purchase_order_item_id'])
                    ->where('purchase_order_id', $po->id)
                    ->firstOrFail();

                $qtyReceived = (float) $item['quantity_received'];

                GoodsReceivedNoteItem::create([
                    'id' => Str::uuid()->toString(),
                    'grn_id' => $grn->id,
                    'purchase_order_item_id' => $poItem->id,
                    'product_id' => $poItem->product_id,
                    'quantity_received' => $qtyReceived,
                    'unit_cost_minor' => (int) $item['unit_cost_minor'],
                ]);

                $poItem->increment('received_quantity', $qtyReceived);
                $totalReceived += $qtyReceived;

                $this->createInventoryMovement($grn, $poItem, $qtyReceived, $user);
            }

            $allReceived = $po->items->every(fn ($item) => $item->received_quantity >= $item->quantity);
            $someReceived = $po->items->some(fn ($item) => $item->received_quantity > 0);

            if ($allReceived) {
                $po->update([
                    'status' => 'completed',
                    'received_date' => now()->toDateString(),
                ]);
            } elseif ($someReceived) {
                $po->update(['status' => 'partial_received']);
            }

            return response()->json(['data' => $grn->load('items.product', 'purchaseOrder')], 201);
        });
    }

    private function generatePONumber(string $branchId): string
    {
        $branch = \App\Models\Branch::find($branchId);
        $branchCode = $branch?->code ?? 'BR';
        $date = now()->format('Ymd');
        $random = strtoupper(Str::random(6));

        return 'PO-' . $branchCode . '-' . $date . '-' . $random;
    }

    private function generateGRNNumber(string $branchId): string
    {
        $branch = \App\Models\Branch::find($branchId);
        $branchCode = $branch?->code ?? 'BR';
        $date = now()->format('Ymd');
        $random = strtoupper(Str::random(6));

        return 'GRN-' . $branchCode . '-' . $date . '-' . $random;
    }

    private function createInventoryMovement(GoodsReceivedNote $grn, PurchaseOrderItem $poItem, float $qtyReceived, $user): void
    {
        $product = \App\Models\Product::find($poItem->product_id);
        if (! $product || ! $product->track_inventory) {
            return;
        }

        $warehouse = \App\Models\Warehouse::find($grn->warehouse_id);

        \App\Services\InventoryService::recordMovement(
            $product,
            $warehouse,
            'purchase_receive',
            $qtyReceived,
            [
                'branch_id' => $grn->branch_id,
                'reference_type' => 'grn',
                'reference_id' => $grn->id,
                'notes' => 'GRN ' . $grn->grn_number . ' - ' . $poItem->name,
                'user_id' => $user->id,
            ]
        );
    }
}
