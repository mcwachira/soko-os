<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomFieldDefinition extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'id',
        'organization_id',
        'entity_type',
        'field_name',
        'field_label',
        'field_type',
        'options',
        'is_required',
        'is_unique',
        'default_value',
        'validation_rules',
        'position',
        'is_active',
    ];

    protected $casts = [
        'options' => 'array',
        'default_value' => 'array',
        'validation_rules' => 'array',
        'is_required' => 'boolean',
        'is_unique' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }
}
