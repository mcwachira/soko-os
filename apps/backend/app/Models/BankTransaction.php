<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BankTransaction extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'id',
        'organization_id',
        'business_id',
        'bank_account_id',
        'journal_entry_id',
        'type',
        'direction',
        'transaction_date',
        'reference',
        'description',
        'counterparty',
        'amount_minor',
        'currency',
        'status',
        'source',
        'external_id',
    ];

    protected $casts = [
        'amount_minor' => 'integer',
        'transaction_date' => 'date',
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

    public function journalEntry()
    {
        return $this->belongsTo(JournalEntry::class);
    }

    public function reconciliationItems()
    {
        return $this->hasMany(BankReconciliationItem::class);
    }
}
