<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TenderBid extends Model
{
    use HasUuids;
    protected $fillable = [
        'organization_id',
        'tender_id',
        'supplier_id',
        'submitted_at',
        'status',
        'total_price_minor',
        'notes',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'total_price_minor' => 'integer',
    ];

    public function tender(): BelongsTo
    {
        return $this->belongsTo(Tender::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function lines()
    {
        return $this->hasMany(TenderBidLine::class);
    }

    public function evaluations()
    {
        return $this->hasMany(TenderEvaluation::class);
    }
}
