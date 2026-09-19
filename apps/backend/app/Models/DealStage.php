<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DealStage extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'id',
        'pipeline_id',
        'name',
        'slug',
        'description',
        'position',
        'probability_percentage',
        'required_fields',
        'allowed_next_stages',
        'rotting_threshold_days',
        'automation',
    ];

    protected $casts = [
        'probability_percentage' => 'integer',
        'position' => 'integer',
        'rotting_threshold_days' => 'integer',
        'required_fields' => 'array',
        'allowed_next_stages' => 'array',
        'automation' => 'array',
    ];

    public function pipeline(): BelongsTo
    {
        return $this->belongsTo(Pipeline::class);
    }

    public function deals(): HasMany
    {
        return $this->hasMany(Deal::class);
    }
}
