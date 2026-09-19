<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupplierAddress extends Model
{
    use HasUuids;
    protected $fillable = [
        'organization_id',
        'supplier_id',
        'address_type',
        'street',
        'city',
        'state',
        'postal_code',
        'country',
        'is_primary',
    ];

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }
}
