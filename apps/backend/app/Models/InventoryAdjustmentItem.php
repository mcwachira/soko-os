<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryAdjustmentItem extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'id',
        'adjustment_id',
        'product_id',
        'bin_id',
        'quantity_before',
        'quantity_change',
        'quantity_after',
        'unit_cost_minor',
        'notes',
    ];

    protected $casts = [
        'quantity_before' => 'decimal:4',
        'quantity_change' => 'decimal:4',
        'quantity_after' => 'decimal:4',
        'unit_cost_minor' => 'integer',
    ];

    public function adjustment()
    {
        return $this->belongsTo(InventoryAdjustment::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function bin()
    {
        return $this->belongsTo(Bin::class);
    }
}
