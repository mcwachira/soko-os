<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BankAccount extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'id',
        'organization_id',
        'business_id',
        'account_id',
        'name',
        'account_number_masked',
        'bank_name',
        'currency',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function ledgerAccount()
    {
        return $this->belongsTo(Account::class, 'account_id');
    }

    public function transactions()
    {
        return $this->hasMany(BankTransaction::class);
    }

    public function reconciliations()
    {
        return $this->hasMany(BankReconciliation::class);
    }
}
