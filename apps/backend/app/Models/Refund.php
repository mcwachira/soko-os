<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Refund extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'id',
        'organization_id',
        'business_id',
        'branch_id',
        'return_id',
        'sale_id',
        'payment_id',
        'customer_id',
        'refund_number',
        'status',
        'refund_method',
        'amount_minor',
        'currency',
        'reference',
        'external_transaction_id',
        'provider_response',
        'reason',
        'processed_by_user_id',
        'processed_at',
    ];

    protected $casts = [
        'amount_minor' => 'integer',
        'provider_response' => 'array',
        'processed_at' => 'datetime',
    ];

    public function items()
    {
        return $this->hasMany(RefundItem::class);
    }

    public function return()
    {
        return $this->belongsTo(ReturnModel::class, 'return_id');
    }

    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }

    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function processor()
    {
        return $this->belongsTo(User::class, 'processed_by_user_id');
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
}
