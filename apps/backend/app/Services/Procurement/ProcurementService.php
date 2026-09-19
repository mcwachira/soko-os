<?php

namespace App\Services\Procurement;

use App\Models\ApprovalRule;
use App\Models\GoodsReceivedNote;
use App\Models\GoodsReceivedNoteItem;
use App\Models\PaymentVoucher;
use App\Models\ProcurementAuditLog;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\PurchaseRequisition;
use App\Models\PurchaseRequisitionLine;
use App\Models\SupplierInvoice;
use App\Models\SupplierInvoiceLine;
use App\Models\ThreeWayMatch;
use App\Models\ThreeWayMatchLine;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class ProcurementService
{
    public static function convertRequisitionToPo(PurchaseRequisition $requisition, User $user): PurchaseOrder
    {
        if ($requisition->status !== 'approved') {
            throw new InvalidArgumentException('Only approved requisitions can be converted to purchase orders.');
        }

        if ($requisition->lines()->count() === 0) {
            throw new InvalidArgumentException('Requisition must have at least one line item.');
        }

        return DB::transaction(function () use ($requisition, $user) {
            $po = PurchaseOrder::create([
                'organization_id' => $requisition->organization_id,
                'business_id' => $requisition->business_id,
                'branch_id' => $requisition->branch_id,
                'warehouse_id' => $requisition->warehouse_id,
                'supplier_id' => $requisition->lines()->first()?->preferred_supplier_id,
                'user_id' => $user->id,
                'po_number' => self::generatePoNumber($requisition->organization_id),
                'status' => 'draft',
                'subtotal_minor' => 0,
                'tax_total_minor' => 0,
                'grand_total_minor' => 0,
                'notes' => $requisition->notes,
            ]);

            $subtotal = 0;
            $taxTotal = 0;

            foreach ($requisition->lines as $line) {
                $lineTotal = (int) ($line->estimated_unit_price_minor * $line->quantity);
                $lineTax = (int) round($lineTotal * ($line->tax_rate_percentage ?? 0) / 100);

                $subtotal += $lineTotal;
                $taxTotal += $lineTax;

                PurchaseOrderItem::create([
                    'organization_id' => $requisition->organization_id,
                    'purchase_order_id' => $po->id,
                    'product_id' => $line->product_id,
                    'sku' => $line->product?->sku ?? '',
                    'name' => $line->description ?? $line->product?->name ?? '',
                    'quantity' => $line->quantity,
                    'unit_price_minor' => $line->estimated_unit_price_minor,
                    'discount_minor' => 0,
                    'tax_rate_percentage' => $line->tax_rate_percentage ?? 0,
                    'tax_amount_minor' => $lineTax,
                    'subtotal_minor' => $lineTotal,
                    'total_minor' => $lineTotal + $lineTax,
                    'received_quantity' => 0,
                ]);
            }

            $po->update([
                'subtotal_minor' => $subtotal,
                'tax_total_minor' => $taxTotal,
                'grand_total_minor' => $subtotal + $taxTotal,
            ]);

            $requisition->update([
                'status' => 'converted',
                'converted_to_po_ids' => array_merge($requisition->converted_to_po_ids ?? [], [$po->id]),
            ]);

            return $po->fresh();
        });
    }

    public static function createThreeWayMatch(PurchaseOrder $po, GoodsReceivedNote $grn, SupplierInvoice $invoice): ThreeWayMatch
    {
        if ($po->organization_id !== $grn->organization_id || $po->organization_id !== $invoice->organization_id) {
            throw new InvalidArgumentException('All entities must belong to the same organization.');
        }

        if ($po->supplier_id !== $grn->supplier_id || $po->supplier_id !== $invoice->supplier_id) {
            throw new InvalidArgumentException('All entities must belong to the same supplier.');
        }

        return DB::transaction(function () use ($po, $grn, $invoice) {
            $match = ThreeWayMatch::create([
                'organization_id' => $po->organization_id,
                'business_id' => $po->business_id,
                'purchase_order_id' => $po->id,
                'grn_id' => $grn->id,
                'supplier_invoice_id' => $invoice->id,
                'status' => 'pending',
            ]);

            $poLines = $po->lines()->get()->keyBy('id');
            $grnLines = $grn->lines()->get()->keyBy('purchase_order_item_id');
            $invoiceLines = $invoice->lines()->get()->keyBy('purchase_order_item_id');

            foreach ($poLines as $poLine) {
                $grnLine = $grnLines->get($poLine->id);
                $invoiceLine = $invoiceLines->get($poLine->id);

                $grnQty = $grnLine?->quantity_received ?? 0;
                $invoiceQty = $invoiceLine?->quantity ?? 0;
                $grnUnitCost = $grnLine?->unit_cost_minor ?? $poLine->unit_price_minor;
                $invoiceUnitPrice = $invoiceLine?->unit_price_minor ?? $poLine->unit_price_minor;

                $status = 'matched';
                $mismatchReason = null;

                if ($poLine->quantity != $grnQty || $poLine->quantity != $invoiceQty) {
                    $status = 'quantity_mismatch';
                    $mismatchReason = 'Quantity mismatch between PO, GRN, and Invoice.';
                } elseif ($poLine->unit_price_minor != $grnUnitCost || $poLine->unit_price_minor != $invoiceUnitPrice) {
                    $status = 'price_mismatch';
                    $mismatchReason = 'Price mismatch between PO, GRN, and Invoice.';
                }

                ThreeWayMatchLine::create([
                    'organization_id' => $po->organization_id,
                    'three_way_match_id' => $match->id,
                    'po_line_id' => $poLine->id,
                    'grn_line_id' => $grnLine?->id,
                    'invoice_line_id' => $invoiceLine?->id,
                    'po_quantity' => $poLine->quantity,
                    'grn_quantity' => $grnQty,
                    'invoice_quantity' => $invoiceQty,
                    'po_unit_price_minor' => $poLine->unit_price_minor,
                    'grn_unit_cost_minor' => $grnUnitCost,
                    'invoice_unit_price_minor' => $invoiceUnitPrice,
                    'status' => $status,
                    'mismatch_reason' => $mismatchReason,
                ]);
            }

            return $match->fresh();
        });
    }

    public static function submitForApproval(string $entityType, string $entityId, User $user): void
    {
        DB::transaction(function () use ($entityType, $entityId, $user) {
            $model = match ($entityType) {
                'purchase_requisition' => PurchaseRequisition::findOrFail($entityId),
                'purchase_order' => PurchaseOrder::findOrFail($entityId),
                'procurement_contract' => \App\Models\ProcurementContract::findOrFail($entityId),
                default => throw new InvalidArgumentException("Unsupported entity type: {$entityType}"),
            };

            if ($model->organization_id !== $user->organization_id) {
                throw new InvalidArgumentException('Unauthorized to submit this entity for approval.');
            }

            $amountMinor = match ($entityType) {
                'purchase_requisition' => $model->budget_minor ?? 0,
                'purchase_order' => $model->grand_total_minor ?? 0,
                'procurement_contract' => $model->contract_value_minor ?? 0,
            };

            $context = [
                'organization_id' => $model->organization_id,
                'department' => $model->department ?? null,
                'supplier_id' => match ($entityType) {
                    'purchase_requisition' => $model->lines()->first()?->preferred_supplier_id,
                    'purchase_order' => $model->supplier_id,
                    'procurement_contract' => $model->supplier_id,
                    default => null,
                },
                'branch_id' => $model->branch_id ?? null,
                'currency' => $model->currency ?? 'KES',
            ];

            $rule = ApprovalEngine::findApprovalRule($entityType, $amountMinor, $context);

            if (!$rule) {
                $model->update(['status' => 'approved']);
                return;
            }

            $chain = ApprovalEngine::createApprovalChain($rule, $entityType, $entityId, $user);

            if (empty($chain)) {
                $model->update(['status' => 'approved']);
                return;
            }

            $model->update(['status' => 'pending_approval']);
        });
    }

    public static function recordAudit(
        string $entityType,
        string $entityId,
        string $action,
        array $before = null,
        array $after = null,
        ?string $reason = null,
        ?User $user = null
    ): ProcurementAuditLog {
        $organizationId = $user->organization_id ?? null;

        return ProcurementAuditLog::create([
            'organization_id' => $organizationId,
            'user_id' => $user?->id,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'action' => $action,
            'before' => $before,
            'after' => $after,
            'reason' => $reason,
            'ip_address' => request()->ip(),
            'correlation_id' => request()->header('X-Correlation-ID'),
        ]);
    }

    private static function generatePoNumber(string $organizationId): string
    {
        $prefix = 'PO';
        $date = now()->format('Ymd');
        $count = PurchaseOrder::where('organization_id', $organizationId)
            ->whereDate('created_at', now())
            ->count() + 1;

        return $prefix . '-' . $date . '-' . str_pad((string) $count, 4, '0', STR_PAD_LEFT);
    }
}
