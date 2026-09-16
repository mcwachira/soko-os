<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Invoice extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'id',
        'organization_id',
        'business_id',
        'branch_id',
        'customer_id',
        'invoice_number',
        'status',
        'issue_date',
        'due_date',
        'currency',
        'subtotal_minor',
        'discount_minor',
        'tax_total_minor',
        'grand_total_minor',
        'paid_total_minor',
        'balance_minor',
        'notes',
        'terms',
    ];

    protected $casts = [
        'subtotal_minor' => 'integer',
        'discount_minor' => 'integer',
        'tax_total_minor' => 'integer',
        'grand_total_minor' => 'integer',
        'paid_total_minor' => 'integer',
        'balance_minor' => 'integer',
        'issue_date' => 'date',
        'due_date' => 'date',
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

    public function items()
    {
        return $this->hasMany(InvoiceItem::class);
    }
}
