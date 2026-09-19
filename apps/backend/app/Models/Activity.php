<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Activity extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'id',
        'organization_id',
        'business_id',
        'user_id',
        'activity_type',
        'subject',
        'description',
        'status',
        'priority',
        'due_date',
        'completed_at',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'due_date' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function links(): HasMany
    {
        return $this->hasMany(ActivityLink::class);
    }

    public function leads(): BelongsToMany
    {
        return $this->belongsToMany(Lead::class, 'activity_links', 'activity_id', 'linkable_id')
            ->where('activity_links.linkable_type', 'lead');
    }

    public function accounts(): BelongsToMany
    {
        return $this->belongsToMany(Account::class, 'activity_links', 'activity_id', 'linkable_id')
            ->where('activity_links.linkable_type', 'account');
    }

    public function contacts(): BelongsToMany
    {
        return $this->belongsToMany(Contact::class, 'activity_links', 'activity_id', 'linkable_id')
            ->where('activity_links.linkable_type', 'contact');
    }

    public function deals(): BelongsToMany
    {
        return $this->belongsToMany(Deal::class, 'activity_links', 'activity_id', 'linkable_id')
            ->where('activity_links.linkable_type', 'deal');
    }
}
