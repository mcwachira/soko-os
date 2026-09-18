<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContractRenewal extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'organization_id',
        'procurement_contract_id',
        'renewed_at',
        'new_end_date',
        'notes',
    ];

    protected $casts = [
        'renewed_at' => 'datetime',
    ];

    public function procurementContract(): BelongsTo
    {
        return $this->belongsTo(ProcurementContract::class);
    }
}
