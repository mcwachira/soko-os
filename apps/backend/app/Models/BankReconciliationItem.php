<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BankReconciliationItem extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'id',
        'bank_reconciliation_id',
        'bank_transaction_id',
        'status',
        'notes',
    ];

    public function reconciliation()
    {
        return $this->belongsTo(BankReconciliation::class);
    }

    public function transaction()
    {
        return $this->belongsTo(BankTransaction::class);
    }
}
