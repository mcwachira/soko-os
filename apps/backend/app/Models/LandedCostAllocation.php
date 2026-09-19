<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LandedCostAllocation extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'id',
        'landed_cost_id',
        'product_id',
        'purchase_order_item_id',
        'allocated_cost_minor',
    ];

    protected $casts = [
        'allocated_cost_minor' => 'integer',
    ];

    public function landedCost()
    {
        return $this->belongsTo(LandedCost::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function purchaseOrderItem()
    {
        return $this->belongsTo(PurchaseOrderItem::class);
    }
}
