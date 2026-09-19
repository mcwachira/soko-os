<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Contact extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'id',
        'organization_id',
        'business_id',
        'account_id',
        'lead_id',
        'first_name',
        'last_name',
        'job_title',
        'department',
        'email',
        'phone',
        'whatsapp_phone',
        'preferred_channel',
        'is_decision_maker',
        'is_billing_contact',
        'is_technical_contact',
        'custom_fields',
        'notes',
    ];

    protected $casts = [
        'custom_fields' => 'array',
        'is_decision_maker' => 'boolean',
        'is_billing_contact' => 'boolean',
        'is_technical_contact' => 'boolean',
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

    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }

    public function deals(): BelongsToMany
    {
        return $this->belongsToMany(Deal::class, 'deal_contacts', 'contact_id', 'deal_id');
    }

    public function activities(): HasMany
    {
        return $this->hasMany(Activity::class);
    }

    public function communications(): BelongsToMany
    {
        return $this->belongsToMany(Communication::class, 'communication_links', 'linkable_id', 'communication_id')
            ->where('communication_links.linkable_type', 'contact');
    }

    public function cases(): HasMany
    {
        return $this->hasMany(CaseModel::class);
    }
}
