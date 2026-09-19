<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentReconciliation extends Model
{
    use HasUuids;
    protected $fillable = [
        'organization_id',
        'supplier_payment_id',
        'provider_transaction_id',
        'amount_minor',
        'currency',
        'reconciled_at',
        'reconciled_by_user_id',
        'status',
        'notes',
    ];

    protected $casts = [
        'amount_minor' => 'integer',
        'reconciled_at' => 'datetime',
    ];

    public function supplierPayment(): BelongsTo
    {
        return $this->belongsTo(SupplierPayment::class);
    }

    public function reconciledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reconciled_by_user_id');
    }
}
