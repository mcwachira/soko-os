<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupplierPayment extends Model
{
    use HasUuids;
    protected $fillable = [
        'organization_id',
        'business_id',
        'branch_id',
        'payment_voucher_id',
        'supplier_id',
        'currency',
        'amount_minor',
        'payment_method',
        'reference',
        'external_transaction_id',
        'provider_response',
        'status',
        'paid_at',
        'notes',
    ];

    protected $casts = [
        'amount_minor' => 'integer',
        'provider_response' => 'array',
        'paid_at' => 'datetime',
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

    public function paymentVoucher()
    {
        return $this->belongsTo(PaymentVoucher::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }
}
