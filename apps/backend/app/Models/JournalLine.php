<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class JournalLine extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'id',
        'journal_entry_id',
        'account_id',
        'description',
        'debit_minor',
        'credit_minor',
        'entry_type',
        'branch_id',
        'external_reference',
    ];

    protected $casts = [
        'debit_minor' => 'integer',
        'credit_minor' => 'integer',
    ];

    public function journalEntry()
    {
        return $this->belongsTo(JournalEntry::class);
    }

    public function account()
    {
        return $this->belongsTo(Account::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
}
