<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransferOrderItem extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'id',
        'transfer_order_id',
        'product_id',
        'quantity_requested',
        'quantity_dispatched',
        'quantity_received',
        'notes',
    ];

    protected $casts = [
        'quantity_requested' => 'decimal:4',
        'quantity_dispatched' => 'decimal:4',
        'quantity_received' => 'decimal:4',
    ];

    public function transferOrder()
    {
        return $this->belongsTo(TransferOrder::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
