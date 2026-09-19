<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Communication extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'id',
        'organization_id',
        'business_id',
        'channel',
        'direction',
        'status',
        'from_address',
        'to_address',
        'subject',
        'body',
        'attachments',
        'metadata',
        'external_id',
        'sent_at',
        'delivered_at',
        'read_at',
    ];

    protected $casts = [
        'attachments' => 'array',
        'metadata' => 'array',
        'sent_at' => 'datetime',
        'delivered_at' => 'datetime',
        'read_at' => 'datetime',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function links(): HasMany
    {
        return $this->hasMany(CommunicationLink::class);
    }

    public function leads(): BelongsToMany
    {
        return $this->belongsToMany(Lead::class, 'communication_links', 'communication_id', 'linkable_id')
            ->where('communication_links.linkable_type', 'lead');
    }

    public function accounts(): BelongsToMany
    {
        return $this->belongsToMany(Account::class, 'communication_links', 'communication_id', 'linkable_id')
            ->where('communication_links.linkable_type', 'account');
    }

    public function contacts(): BelongsToMany
    {
        return $this->belongsToMany(Contact::class, 'communication_links', 'communication_id', 'linkable_id')
            ->where('communication_links.linkable_type', 'contact');
    }

    public function deals(): BelongsToMany
    {
        return $this->belongsToMany(Deal::class, 'communication_links', 'communication_id', 'linkable_id')
            ->where('communication_links.linkable_type', 'deal');
    }
}
