<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RefundItem extends Model
{
    use HasUuids;

    protected $fillable = [
        'id',
        'refund_id',
        'return_item_id',
        'sale_item_id',
        'quantity',
        'unit_price_minor',
        'tax_amount_minor',
        'total_minor',
    ];

    protected $casts = [
        'quantity' => 'decimal:4',
        'unit_price_minor' => 'integer',
        'tax_amount_minor' => 'integer',
        'total_minor' => 'integer',
    ];

    public function refund()
    {
        return $this->belongsTo(Refund::class);
    }

    public function returnItem()
    {
        return $this->belongsTo(ReturnItem::class);
    }

    public function saleItem()
    {
        return $this->belongsTo(SaleItem::class);
    }
}
