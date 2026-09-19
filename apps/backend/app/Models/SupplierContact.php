<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupplierContact extends Model
{
    use HasUuids;
    protected $fillable = [
        'organization_id',
        'supplier_id',
        'first_name',
        'last_name',
        'job_title',
        'department',
        'email',
        'phone',
        'whatsapp_phone',
        'is_primary',
        'is_finance_contact',
        'is_procurement_contact',
    ];

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }
}
