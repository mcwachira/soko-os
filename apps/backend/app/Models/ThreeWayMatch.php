<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ThreeWayMatch extends Model
{
    use HasUuids;
    protected $fillable = [
        'organization_id',
        'business_id',
        'purchase_order_id',
        'grn_id',
        'supplier_invoice_id',
        'status',
        'matched_at',
        'mismatches',
        'notes',
    ];

    protected $casts = [
        'matched_at' => 'datetime',
        'mismatches' => 'array',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function grn()
    {
        return $this->belongsTo(GoodsReceivedNote::class);
    }

    public function supplierInvoice()
    {
        return $this->belongsTo(SupplierInvoice::class);
    }

    public function lines()
    {
        return $this->hasMany(ThreeWayMatchLine::class);
    }
}
