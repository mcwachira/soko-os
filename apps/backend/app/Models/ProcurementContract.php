<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProcurementContract extends Model
{
    use HasUuids;
    protected $fillable = [
        'organization_id',
        'business_id',
        'supplier_id',
        'contract_number',
        'title',
        'description',
        'start_date',
        'end_date',
        'renewal_date',
        'contract_value_minor',
        'currency',
        'terms',
        'status',
        'attachment_url',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'renewal_date' => 'date',
        'contract_value_minor' => 'integer',
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

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function lines()
    {
        return $this->hasMany(ContractLine::class);
    }

    public function renewals()
    {
        return $this->hasMany(ContractRenewal::class);
    }
}
