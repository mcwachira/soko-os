<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentVoucher extends Model
{
    use HasUuids;
    protected $fillable = [
        'organization_id',
        'business_id',
        'branch_id',
        'voucher_number',
        'supplier_id',
        'currency',
        'gross_amount_minor',
        'wht_rate_percentage',
        'wht_amount_minor',
        'other_deductions_minor',
        'net_payable_minor',
        'status',
        'approved_at',
        'approved_by_user_id',
        'notes',
    ];

    protected $casts = [
        'gross_amount_minor' => 'integer',
        'wht_rate_percentage' => 'decimal:2',
        'wht_amount_minor' => 'integer',
        'other_deductions_minor' => 'integer',
        'net_payable_minor' => 'integer',
        'approved_at' => 'datetime',
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

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by_user_id');
    }

    public function lines()
    {
        return $this->hasMany(PaymentVoucherLine::class);
    }

    public function approvals()
    {
        return $this->hasMany(PaymentApproval::class);
    }
}
