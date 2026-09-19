<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TenderAward extends Model
{
    use HasUuids;
    protected $fillable = [
        'organization_id',
        'tender_id',
        'tender_bid_id',
        'supplier_id',
        'awarded_at',
        'amount_minor',
        'currency',
        'notes',
    ];

    protected $casts = [
        'awarded_at' => 'datetime',
        'amount_minor' => 'integer',
    ];

    public function tender(): BelongsTo
    {
        return $this->belongsTo(Tender::class);
    }

    public function tenderBid(): BelongsTo
    {
        return $this->belongsTo(TenderBid::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }
}
