<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PurchaseRequisitionLine extends Model
{
    use HasUuids;
    protected $fillable = [
        'organization_id',
        'purchase_requisition_id',
        'product_id',
        'description',
        'quantity',
        'unit',
        'estimated_unit_price_minor',
        'tax_rate_percentage',
        'estimated_total_minor',
        'required_date',
        'preferred_supplier_id',
        'notes',
    ];

    protected $casts = [
        'quantity' => 'decimal:4',
        'estimated_unit_price_minor' => 'integer',
        'estimated_total_minor' => 'integer',
    ];

    public function purchaseRequisition(): BelongsTo
    {
        return $this->belongsTo(PurchaseRequisition::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
