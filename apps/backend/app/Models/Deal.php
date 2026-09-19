<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Deal extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'id',
        'organization_id',
        'business_id',
        'account_id',
        'contact_id',
        'pipeline_id',
        'stage_id',
        'owner_user_id',
        'lead_id',
        'deal_name',
        'description',
        'currency',
        'value_minor',
        'probability_minor',
        'expected_close_date',
        'actual_close_date',
        'status',
        'lost_reason',
        'competitors',
        'source_campaign',
        'custom_fields',
        'metadata',
        'notes',
        'stage_entered_at',
        'stage_exited_at',
    ];

    protected $casts = [
        'value_minor' => 'integer',
        'probability_minor' => 'integer',
        'custom_fields' => 'array',
        'metadata' => 'array',
        'expected_close_date' => 'date',
        'actual_close_date' => 'date',
        'stage_entered_at' => 'datetime',
        'stage_exited_at' => 'datetime',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }

    public function pipeline(): BelongsTo
    {
        return $this->belongsTo(Pipeline::class);
    }

    public function stage(): BelongsTo
    {
        return $this->belongsTo(DealStage::class);
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_user_id');
    }

    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(DealProduct::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(DealPayment::class);
    }

    public function activities(): BelongsToMany
    {
        return $this->belongsToMany(Activity::class, 'activity_links', 'linkable_id', 'activity_id')
            ->where('activity_links.linkable_type', 'deal');
    }

    public function contacts(): BelongsToMany
    {
        return $this->belongsToMany(Contact::class, 'deal_contacts', 'deal_id', 'contact_id');
    }
}
