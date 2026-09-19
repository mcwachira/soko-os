<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StocktakeItem extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'id',
        'stocktake_id',
        'product_id',
        'bin_id',
        'system_quantity',
        'counted_quantity',
        'variance',
        'status',
        'notes',
    ];

    protected $casts = [
        'system_quantity' => 'decimal:4',
        'counted_quantity' => 'decimal:4',
        'variance' => 'decimal:4',
    ];

    public function stocktake()
    {
        return $this->belongsTo(Stocktake::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function bin()
    {
        return $this->belongsTo(Bin::class);
    }
}
