<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentVoucherLine extends Model
{
    use HasUuids;
    protected $fillable = [
        'organization_id',
        'payment_voucher_id',
        'supplier_invoice_id',
        'amount_minor',
        'wht_amount_minor',
        'notes',
    ];

    protected $casts = [
        'amount_minor' => 'integer',
        'wht_amount_minor' => 'integer',
    ];

    public function paymentVoucher(): BelongsTo
    {
        return $this->belongsTo(PaymentVoucher::class);
    }

    public function supplierInvoice(): BelongsTo
    {
        return $this->belongsTo(SupplierInvoice::class);
    }
}
