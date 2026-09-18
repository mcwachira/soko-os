<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLink extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;

    protected $fillable = [
        'id',
        'activity_id',
        'linkable_type',
        'linkable_id',
    ];

    public function activity(): BelongsTo
    {
        return $this->belongsTo(Activity::class);
    }

    public function linkable(): BelongsTo
    {
        return $this->morphTo();
    }
}
