<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CreditNote extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'id',
        'organization_id',
        'business_id',
        'branch_id',
        'customer_id',
        'invoice_id',
        'credit_note_number',
        'status',
        'credit_date',
        'currency',
        'subtotal_minor',
        'tax_total_minor',
        'total_minor',
        'reason',
        'notes',
    ];

    protected $casts = [
        'subtotal_minor' => 'integer',
        'tax_total_minor' => 'integer',
        'total_minor' => 'integer',
        'credit_date' => 'date',
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

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }

    public function items()
    {
        return $this->hasMany(CreditNoteItem::class);
    }

    protected $appends = ['customer_name'];

    public function getCustomerNameAttribute(): ?string
    {
        return $this->customer?->name;
    }
}
