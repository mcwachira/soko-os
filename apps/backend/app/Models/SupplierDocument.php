<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupplierDocument extends Model
{
    use HasUuids;
    protected $fillable = [
        'organization_id',
        'supplier_id',
        'document_type',
        'document_number',
        'issued_at',
        'expires_at',
        'status',
        'verification_status',
        'verified_at',
        'verified_by_user_id',
        'failure_reason',
        'attachment_url',
        'metadata',
    ];

    protected $casts = [
        'issued_at' => 'date',
        'expires_at' => 'date',
        'verified_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function verifiedBy()
    {
        return $this->belongsTo(User::class, 'verified_by_user_id');
    }
}
