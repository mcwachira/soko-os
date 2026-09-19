<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PaymentAllocation extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'id',
        'organization_id',
        'payment_id',
        'allocatable_type',
        'allocatable_id',
        'allocated_minor',
    ];

    protected $casts = [
        'allocated_minor' => 'integer',
    ];

    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }

    public function allocatable()
    {
        return $this->morphTo();
    }
}
