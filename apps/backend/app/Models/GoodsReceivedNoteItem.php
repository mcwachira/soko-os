<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GoodsReceivedNoteItem extends Model
{
    use HasUuids;

    protected $fillable = [
        'id',
        'grn_id',
        'purchase_order_item_id',
        'product_id',
        'quantity_received',
        'unit_cost_minor',
    ];

    protected $casts = [
        'quantity_received' => 'decimal:4',
        'unit_cost_minor' => 'integer',
    ];

    public function grn()
    {
        return $this->belongsTo(GoodsReceivedNote::class, 'grn_id');
    }

    public function purchaseOrderItem()
    {
        return $this->belongsTo(PurchaseOrderItem::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
