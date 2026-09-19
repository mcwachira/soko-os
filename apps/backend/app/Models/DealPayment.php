<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DealPayment extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'id',
        'deal_id',
        'payment_id',
        'amount_minor',
        'currency',
        'payment_method',
        'status',
        'external_transaction_id',
        'provider_response',
        'paid_at',
    ];

    protected $casts = [
        'amount_minor' => 'integer',
        'provider_response' => 'array',
        'paid_at' => 'datetime',
    ];

    public function deal(): BelongsTo
    {
        return $this->belongsTo(Deal::class);
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }
}
