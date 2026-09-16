<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ReturnModel extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $table = 'returns';

    protected $fillable = [
        'id',
        'organization_id',
        'business_id',
        'branch_id',
        'terminal_id',
        'sale_id',
        'cashier_user_id',
        'shift_id',
        'return_number',
        'status',
        'return_type',
        'subtotal_minor',
        'tax_total_minor',
        'grand_total_minor',
        'refunded_total_minor',
        'reason',
        'notes',
        'approved_by_user_id',
        'approved_at',
    ];

    protected $casts = [
        'subtotal_minor' => 'integer',
        'tax_total_minor' => 'integer',
        'grand_total_minor' => 'integer',
        'refunded_total_minor' => 'integer',
        'approved_at' => 'datetime',
        'accounting_ids' => 'array',
    ];

    public function items()
    {
        return $this->hasMany(ReturnItem::class, 'return_id');
    }

    public function refunds()
    {
        return $this->hasMany(Refund::class, 'return_id');
    }

    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }

    public function cashier()
    {
        return $this->belongsTo(User::class, 'cashier_user_id');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by_user_id');
    }

    public function shift()
    {
        return $this->belongsTo(CashShift::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function terminal()
    {
        return $this->belongsTo(Terminal::class);
    }

    public function getAccountingCreditNoteId(string $provider): ?string
    {
        $ids = $this->accounting_ids ?? [];
        return $ids['credit_note_'.$provider] ?? null;
    }

    public function setAccountingCreditNoteId(string $provider, string $externalId): void
    {
        $ids = $this->accounting_ids ?? [];
        $ids['credit_note_'.$provider] = $externalId;
        $this->update(['accounting_ids' => $ids]);
    }
}
