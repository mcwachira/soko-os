<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RfqLine extends Model
{
    use HasUuids;
    protected $fillable = [
        'organization_id',
        'rfq_id',
        'product_id',
        'description',
        'quantity',
        'estimated_unit_price_minor',
    ];

    protected $casts = [
        'quantity' => 'decimal:4',
        'estimated_unit_price_minor' => 'integer',
    ];

    public function rfq(): BelongsTo
    {
        return $this->belongsTo(Rfq::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
