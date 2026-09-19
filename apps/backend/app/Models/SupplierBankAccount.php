<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupplierBankAccount extends Model
{
    use HasUuids;
    protected $fillable = [
        'organization_id',
        'supplier_id',
        'bank_name',
        'account_name',
        'account_number',
        'branch_code',
        'swift_code',
        'currency',
        'is_primary',
    ];

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }
}
