<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RfqResponseLine extends Model
{
    use HasUuids;
    protected $fillable = [
        'organization_id',
        'rfq_response_id',
        'rfq_line_id',
        'unit_price_minor',
        'delivery_days',
        'notes',
    ];

    protected $casts = [
        'unit_price_minor' => 'integer',
        'delivery_days' => 'integer',
    ];

    public function rfqResponse(): BelongsTo
    {
        return $this->belongsTo(RfqResponse::class);
    }

    public function rfqLine(): BelongsTo
    {
        return $this->belongsTo(RfqLine::class);
    }
}
