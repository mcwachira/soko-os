<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class SubscriptionItem extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'subscription_id',
        'product_id',
        'enabled',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'enabled' => 'boolean',
            'metadata' => 'array',
        ];
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
