<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CrmAccount extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $table = 'crm_accounts';

    protected $fillable = [
        'id',
        'organization_id',
        'business_id',
        'parent_account_id',
        'owner_user_id',
        'account_type',
        'legal_name',
        'trading_name',
        'registration_number',
        'kra_pin',
        'industry',
        'country_code',
        'county',
        'city',
        'address',
        'website',
        'phone',
        'email',
        'credit_limit_minor',
        'payment_terms',
        'price_list',
        'custom_fields',
        'notes',
    ];

    protected $casts = [
        'custom_fields' => 'array',
        'credit_limit_minor' => 'integer',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(CrmAccount::class, 'parent_account_id');
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_user_id');
    }

    public function contacts(): HasMany
    {
        return $this->hasMany(Contact::class);
    }

    public function deals(): HasMany
    {
        return $this->hasMany(Deal::class);
    }

    public function activities(): HasMany
    {
        return $this->hasMany(Activity::class);
    }

    public function cases(): HasMany
    {
        return $this->hasMany(CaseModel::class);
    }

    public function children(): HasMany
    {
        return $this->hasMany(CrmAccount::class, 'parent_account_id');
    }
}
