<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasUuids;

    protected $fillable = [
        'id',
        'organization_id',
        'sale_id',
        'customer_id',
        'amount_minor',
        'currency',
        'payment_method',
        'status',
        'reference',
        'external_transaction_id',
        'provider_response',
        'payment_type',
        'reference_type',
        'reference_id',
        'notes',
    ];

    protected $casts = [
        'amount_minor' => 'integer',
        'provider_response' => 'array',
    ];

    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
