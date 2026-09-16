<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductStock extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'id',
        'organization_id',
        'business_id',
        'product_id',
        'warehouse_id',
        'quantity_on_hand',
        'quantity_reserved',
        'quantity_available',
    ];

    protected $casts = [
        'quantity_on_hand' => 'decimal:4',
        'quantity_reserved' => 'decimal:4',
        'quantity_available' => 'decimal:4',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }
}
