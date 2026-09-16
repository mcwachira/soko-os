<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AccountingPeriod extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'id',
        'organization_id',
        'business_id',
        'fiscal_year_id',
        'name',
        'start_date',
        'end_date',
        'status',
        'closed_at',
        'closed_by_user_id',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'closed_at' => 'datetime',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function fiscalYear()
    {
        return $this->belongsTo(FiscalYear::class);
    }

    public function closedBy()
    {
        return $this->belongsTo(User::class, 'closed_by_user_id');
    }

    public function scopeForDate($query, string $date, string $organizationId)
    {
        return $query->where('organization_id', $organizationId)
            ->where('start_date', '<=', $date)
            ->where('end_date', '>=', $date)
            ->orderBy('start_date', 'desc');
    }

    public function scopeLocked($query)
    {
        return $query->whereIn('status', ['closed', 'locked']);
    }
}
