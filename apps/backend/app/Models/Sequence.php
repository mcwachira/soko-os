<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Sequence extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'id',
        'organization_id',
        'name',
        'description',
        'target_entity',
        'status',
        'total_steps',
        'steps',
        'settings',
    ];

    protected $casts = [
        'steps' => 'array',
        'settings' => 'array',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(SequenceEvent::class);
    }
}
