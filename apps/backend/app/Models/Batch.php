<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Batch extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'id',
        'organization_id',
        'business_id',
        'warehouse_id',
        'product_id',
        'batch_number',
        'manufacture_date',
        'expiry_date',
        'supplier',
        'quantity',
        'unit_cost_minor',
        'status',
    ];

    protected $casts = [
        'quantity' => 'decimal:4',
        'unit_cost_minor' => 'integer',
        'manufacture_date' => 'date',
        'expiry_date' => 'date',
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
