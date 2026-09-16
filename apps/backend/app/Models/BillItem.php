<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BillItem extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'id',
        'bill_id',
        'product_id',
        'description',
        'quantity',
        'unit_cost_minor',
        'discount_minor',
        'tax_rate_percentage',
        'tax_amount_minor',
        'subtotal_minor',
        'total_minor',
    ];

    protected $casts = [
        'unit_cost_minor' => 'integer',
        'discount_minor' => 'integer',
        'tax_amount_minor' => 'integer',
        'subtotal_minor' => 'integer',
        'total_minor' => 'integer',
        'quantity' => 'decimal:4',
        'tax_rate_percentage' => 'decimal:2',
    ];

    public function bill()
    {
        return $this->belongsTo(Bill::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
