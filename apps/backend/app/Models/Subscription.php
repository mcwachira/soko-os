<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Subscription extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'organization_id',
        'plan_id',
        'status',
        'payment_status',
        'trial_ends_at',
        'current_period_started_at',
        'current_period_ends_at',
        'cancelled_at',
        'ended_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'trial_ends_at' => 'datetime',
            'current_period_started_at' => 'datetime',
            'current_period_ends_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'ended_at' => 'datetime',
        ];
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(SubscriptionItem::class);
    }

    public function isActive(): bool
    {
        return in_array($this->status, ['active', 'trial']);
    }

    public function canAccessProducts(): bool
    {
        if (in_array($this->status, ['active', 'trial'])) {
            return true;
        }

        if ($this->status === 'past_due' && $this->plan) {
            $gracePeriod = (int) $this->plan->grace_period_days;
            if ($gracePeriod > 0 && $this->current_period_ends_at) {
                return $this->current_period_ends_at->addDays($gracePeriod)->isFuture();
            }
        }

        return false;
    }

    public function getEnabledProductKeys(): array
    {
        return $this->items()
            ->where('enabled', true)
            ->whereHas('product', function ($q) {
                $q->where('is_active', true);
            })
            ->with('product')
            ->get()
            ->pluck('product.key')
            ->filter()
            ->unique()
            ->values()
            ->all();
    }
}
