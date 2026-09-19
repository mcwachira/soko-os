<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryLayer extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'id',
        'organization_id',
        'business_id',
        'warehouse_id',
        'product_id',
        'layer_type',
        'quantity',
        'remaining_quantity',
        'unit_cost_minor',
        'total_cost_minor',
        'reference_id',
        'reference_type',
        'notes',
    ];

    protected $casts = [
        'quantity' => 'decimal:4',
        'remaining_quantity' => 'decimal:4',
        'unit_cost_minor' => 'integer',
        'total_cost_minor' => 'integer',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
