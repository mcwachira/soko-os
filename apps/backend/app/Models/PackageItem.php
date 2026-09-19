<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PackageItem extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'id',
        'package_id',
        'product_id',
        'quantity',
    ];

    protected $casts = [
        'quantity' => 'decimal:4',
    ];

    public function package()
    {
        return $this->belongsTo(Package::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
