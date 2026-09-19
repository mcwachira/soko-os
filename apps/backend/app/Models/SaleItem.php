<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SaleItem extends Model
{
    use HasUuids;

    protected $fillable = [
        'id',
        'organization_id',
        'sale_id',
        'product_id',
        'sku',
        'name',
        'quantity',
        'unit_price_minor',
        'discount_minor',
        'tax_rate_percentage',
        'tax_amount_minor',
        'subtotal_minor',
        'total_minor',
        'batch_number',
        'serial_number',
        'cogs_minor',
    ];

    protected $casts = [
        'quantity' => 'decimal:4',
        'unit_price_minor' => 'integer',
        'discount_minor' => 'integer',
        'tax_rate_percentage' => 'decimal:2',
        'tax_amount_minor' => 'integer',
        'subtotal_minor' => 'integer',
        'total_minor' => 'integer',
    ];

    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
