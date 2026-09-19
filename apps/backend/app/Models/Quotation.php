<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Quotation extends Model
{
    use HasFactory, HasUuids, SoftDeletes;
    protected $fillable = [
        'organization_id',
        'business_id',
        'branch_id',
        'tender_id',
        'supplier_id',
        'submitted_at',
        'valid_until',
        'currency',
        'total_minor',
        'status',
        'notes',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'valid_until' => 'date',
        'total_minor' => 'integer',
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

    public function tender()
    {
        return $this->belongsTo(Tender::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function items()
    {
        return $this->hasMany(QuotationItem::class);
    }
}
