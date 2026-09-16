<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'key',
        'description',
        'status',
        'billing_interval',
        'currency',
        'price_minor',
        'trial_days',
        'grace_period_days',
    ];

    protected function casts(): array
    {
        return [
            'price_minor' => 'integer',
            'trial_days' => 'integer',
            'grace_period_days' => 'integer',
        ];
    }

    public function products(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'plan_products', 'plan_id', 'product_id')
            ->withPivot('enabled')
            ->withTimestamps();
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
