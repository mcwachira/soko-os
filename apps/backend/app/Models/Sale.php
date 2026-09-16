<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Sale extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'id',
        'organization_id',
        'business_id',
        'branch_id',
        'terminal_id',
        'cashier_user_id',
        'shift_id',
        'customer_id',
        'receipt_number',
        'invoice_number',
        'status',
        'subtotal_minor',
        'discount_minor',
        'tax_total_minor',
        'grand_total_minor',
        'paid_total_minor',
        'change_due_minor',
        'tax_submission_status',
        'accounting_sync_status',
        'notes',
    ];

    protected $casts = [
        'subtotal_minor' => 'integer',
        'discount_minor' => 'integer',
        'tax_total_minor' => 'integer',
        'grand_total_minor' => 'integer',
        'paid_total_minor' => 'integer',
        'change_due_minor' => 'integer',
        'accounting_ids' => 'array',
    ];

    public function items()
    {
        return $this->hasMany(SaleItem::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function taxSubmissions()
    {
        return $this->hasMany(TaxSubmission::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function cashier()
    {
        return $this->belongsTo(User::class, 'cashier_user_id');
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

    public function getAccountingInvoiceId(string $provider): ?string
    {
        $ids = $this->accounting_ids ?? [];
        return $ids['invoice_'.$provider] ?? null;
    }

    public function setAccountingInvoiceId(string $provider, string $externalId): void
    {
        $ids = $this->accounting_ids ?? [];
        $ids['invoice_'.$provider] = $externalId;
        $this->update(['accounting_ids' => $ids]);
    }
}
