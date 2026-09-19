<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApprovalRule extends Model
{
    use HasUuids;
    protected $fillable = [
        'organization_id',
        'entity_type',
        'min_amount_minor',
        'max_amount_minor',
        'department',
        'branch_id',
        'supplier_id',
        'category',
        'cost_center',
        'project_id',
        'currency',
        'purchase_type',
        'risk',
        'is_active',
    ];

    protected $casts = [
        'min_amount_minor' => 'integer',
        'max_amount_minor' => 'integer',
        'is_active' => 'boolean',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function steps()
    {
        return $this->hasMany(ApprovalStep::class);
    }
}
