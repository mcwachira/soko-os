<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ThreeWayMatchLine extends Model
{
    use HasUuids;
    protected $fillable = [
        'organization_id',
        'three_way_match_id',
        'po_line_id',
        'grn_line_id',
        'invoice_line_id',
        'po_quantity',
        'grn_quantity',
        'invoice_quantity',
        'po_unit_price_minor',
        'grn_unit_cost_minor',
        'invoice_unit_price_minor',
        'status',
        'mismatch_reason',
    ];

    protected $casts = [
        'po_quantity' => 'decimal:4',
        'grn_quantity' => 'decimal:4',
        'invoice_quantity' => 'decimal:4',
        'po_unit_price_minor' => 'integer',
        'grn_unit_cost_minor' => 'integer',
        'invoice_unit_price_minor' => 'integer',
    ];

    public function threeWayMatch(): BelongsTo
    {
        return $this->belongsTo(ThreeWayMatch::class);
    }

    public function poLine(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrderItem::class, 'po_line_id');
    }

    public function grnLine(): BelongsTo
    {
        return $this->belongsTo(GoodsReceivedNoteItem::class, 'grn_line_id');
    }

    public function invoiceLine(): BelongsTo
    {
        return $this->belongsTo(SupplierInvoiceLine::class, 'invoice_line_id');
    }
}
