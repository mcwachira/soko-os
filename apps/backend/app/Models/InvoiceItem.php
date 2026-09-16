<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InvoiceItem extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'id',
        'invoice_id',
        'product_id',
        'description',
        'quantity',
        'unit_price_minor',
        'discount_minor',
        'tax_rate_percentage',
        'tax_amount_minor',
        'subtotal_minor',
        'total_minor',
    ];

    protected $casts = [
        'unit_price_minor' => 'integer',
        'discount_minor' => 'integer',
        'tax_amount_minor' => 'integer',
        'subtotal_minor' => 'integer',
        'total_minor' => 'integer',
        'quantity' => 'decimal:4',
        'tax_rate_percentage' => 'decimal:2',
    ];

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
