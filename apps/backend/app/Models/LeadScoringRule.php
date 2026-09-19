<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeadScoringRule extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'id',
        'organization_id',
        'name',
        'condition_type',
        'condition_field',
        'condition_operator',
        'condition_value',
        'score_change',
        'is_decay',
        'decay_after_hours',
        'decay_amount',
        'is_active',
    ];

    protected $casts = [
        'condition_value' => 'array',
        'score_change' => 'integer',
        'is_decay' => 'boolean',
        'decay_after_hours' => 'integer',
        'decay_amount' => 'integer',
        'is_active' => 'boolean',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }
}
