<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupplierInvoiceLine extends Model
{
    use HasUuids;
    protected $fillable = [
        'organization_id',
        'supplier_invoice_id',
        'purchase_order_item_id',
        'product_id',
        'description',
        'quantity',
        'unit_price_minor',
        'discount_minor',
        'tax_rate_percentage',
        'tax_amount_minor',
        'wht_amount_minor',
        'total_minor',
    ];

    protected $casts = [
        'quantity' => 'decimal:4',
        'unit_price_minor' => 'integer',
        'discount_minor' => 'integer',
        'tax_rate_percentage' => 'decimal:2',
        'tax_amount_minor' => 'integer',
        'wht_amount_minor' => 'integer',
        'total_minor' => 'integer',
    ];

    public function supplierInvoice(): BelongsTo
    {
        return $this->belongsTo(SupplierInvoice::class);
    }

    public function purchaseOrderItem(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrderItem::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
