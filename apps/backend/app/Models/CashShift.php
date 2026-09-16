<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CashShift extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'id',
        'organization_id',
        'business_id',
        'branch_id',
        'terminal_id',
        'cashier_user_id',
        'status',
        'opened_at',
        'closed_at',
        'opening_float_minor',
        'expected_cash_minor',
        'actual_cash_minor',
        'variance_minor',
        'cash_sales_minor',
        'cash_in_minor',
        'cash_out_minor',
        'cash_refunds_minor',
        'notes',
    ];

    protected $casts = [
        'opening_float_minor' => 'integer',
        'expected_cash_minor' => 'integer',
        'actual_cash_minor' => 'integer',
        'variance_minor' => 'integer',
        'cash_sales_minor' => 'integer',
        'cash_in_minor' => 'integer',
        'cash_out_minor' => 'integer',
        'cash_refunds_minor' => 'integer',
        'opened_at' => 'datetime',
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

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function terminal()
    {
        return $this->belongsTo(Terminal::class);
    }

    public function cashier()
    {
        return $this->belongsTo(User::class, 'cashier_user_id');
    }

    public function sales()
    {
        return $this->hasMany(Sale::class);
    }
}
