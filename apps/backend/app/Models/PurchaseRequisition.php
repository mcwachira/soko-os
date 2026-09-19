<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PurchaseRequisition extends Model
{
    use HasUuids;
    protected $fillable = [
        'organization_id',
        'business_id',
        'branch_id',
        'warehouse_id',
        'requester_user_id',
        'department',
        'cost_center',
        'project_id',
        'priority',
        'required_date',
        'reason',
        'budget_minor',
        'currency',
        'status',
        'converted_to_po_ids',
        'custom_fields',
        'notes',
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

    public function requestedBy()
    {
        return $this->belongsTo(User::class, 'requested_by_user_id');
    }

    public function lines()
    {
        return $this->hasMany(PurchaseRequisitionLine::class);
    }

    public function approvals()
    {
        return $this->hasMany(PurchaseRequisitionApproval::class);
    }
}
