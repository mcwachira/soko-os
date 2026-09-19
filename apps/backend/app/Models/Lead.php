<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Lead extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'id',
        'organization_id',
        'business_id',
        'branch_id',
        'assigned_to_user_id',
        'first_name',
        'last_name',
        'company_name',
        'email',
        'phone',
        'whatsapp_phone',
        'source',
        'status',
        'lifecycle_stage',
        'score',
        'custom_fields',
        'notes',
        'last_contacted_at',
        'converted_at',
        'converted_by_user_id',
    ];

    protected $casts = [
        'custom_fields' => 'array',
        'score' => 'integer',
        'last_contacted_at' => 'datetime',
        'converted_at' => 'datetime',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to_user_id');
    }

    public function convertedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'converted_by_user_id');
    }

    public function activities(): HasMany
    {
        return $this->hasMany(Activity::class);
    }

    public function communications(): BelongsToMany
    {
        return $this->belongsToMany(Communication::class, 'communication_links', 'linkable_id', 'communication_id')
            ->where('communication_links.linkable_type', 'lead');
    }
}
