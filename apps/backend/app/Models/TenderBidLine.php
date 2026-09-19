<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TenderBidLine extends Model
{
    use HasUuids;
    protected $fillable = [
        'organization_id',
        'tender_bid_id',
        'product_id',
        'description',
        'quantity',
        'unit_price_minor',
        'total_minor',
    ];

    protected $casts = [
        'quantity' => 'decimal:4',
        'unit_price_minor' => 'integer',
        'total_minor' => 'integer',
    ];

    public function tenderBid(): BelongsTo
    {
        return $this->belongsTo(TenderBid::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
