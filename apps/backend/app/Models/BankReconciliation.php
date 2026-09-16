<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BankReconciliation extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'id',
        'organization_id',
        'business_id',
        'bank_account_id',
        'statement_date',
        'start_date',
        'end_date',
        'statement_balance_minor',
        'book_balance_minor',
        'difference_minor',
        'status',
        'notes',
    ];

    protected $casts = [
        'statement_balance_minor' => 'integer',
        'book_balance_minor' => 'integer',
        'difference_minor' => 'integer',
        'statement_date' => 'date',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function bankAccount()
    {
        return $this->belongsTo(BankAccount::class);
    }

    public function items()
    {
        return $this->hasMany(BankReconciliationItem::class);
    }
}
