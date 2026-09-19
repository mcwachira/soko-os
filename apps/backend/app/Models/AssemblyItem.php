<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssemblyItem extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'id',
        'assembly_id',
        'product_id',
        'quantity',
        'unit_cost_minor',
    ];

    protected $casts = [
        'quantity' => 'decimal:4',
        'unit_cost_minor' => 'integer',
    ];

    public function assembly()
    {
        return $this->belongsTo(Assembly::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
