<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TenderEvaluation extends Model
{
    use HasUuids;
    protected $fillable = [
        'organization_id',
        'tender_id',
        'tender_bid_id',
        'evaluator_user_id',
        'criteria',
        'score',
        'comments',
        'evaluated_at',
    ];

    protected $casts = [
        'criteria' => 'array',
        'score' => 'decimal:2',
        'evaluated_at' => 'datetime',
    ];

    public function tender(): BelongsTo
    {
        return $this->belongsTo(Tender::class);
    }

    public function tenderBid(): BelongsTo
    {
        return $this->belongsTo(TenderBid::class);
    }

    public function evaluator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'evaluator_user_id');
    }
}
