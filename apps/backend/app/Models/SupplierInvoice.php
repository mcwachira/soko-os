<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupplierInvoice extends Model
{
    use HasUuids;
    protected $fillable = [
        'organization_id',
        'business_id',
        'branch_id',
        'supplier_id',
        'purchase_order_id',
        'invoice_number',
        'invoice_date',
        'due_date',
        'currency',
        'subtotal_minor',
        'discount_minor',
        'tax_minor',
        'wht_minor',
        'grand_total_minor',
        'etims_status',
        'etims_control_number',
        'etims_verified_at',
        'etims_payload',
        'status',
        'custom_fields',
        'notes',
    ];

    protected $casts = [
        'subtotal_minor' => 'integer',
        'discount_minor' => 'integer',
        'tax_minor' => 'integer',
        'wht_minor' => 'integer',
        'grand_total_minor' => 'integer',
        'invoice_date' => 'date',
        'due_date' => 'date',
        'etims_verified_at' => 'datetime',
        'etims_payload' => 'array',
        'custom_fields' => 'array',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function lines()
    {
        return $this->hasMany(SupplierInvoiceLine::class);
    }
}
