<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SequenceEvent extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'id',
        'sequence_id',
        'organization_id',
        'entity_type',
        'entity_id',
        'status',
        'step_index',
        'channel',
        'template',
        'payload',
        'scheduled_at',
        'executed_at',
        'error_message',
    ];

    protected $casts = [
        'payload' => 'array',
        'scheduled_at' => 'datetime',
        'executed_at' => 'datetime',
    ];

    public function sequence(): BelongsTo
    {
        return $this->belongsTo(Sequence::class);
    }
}
