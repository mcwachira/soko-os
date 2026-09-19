<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Traits\HasDocumentNumbers;

class Assembly extends Model
{
    use HasFactory, HasUuids, HasDocumentNumbers;

    protected $fillable = [
        'id',
        'organization_id',
        'business_id',
        'warehouse_id',
        'finished_product_id',
        'user_id',
        'assembly_number',
        'type',
        'quantity',
        'status',
        'notes',
    ];

    protected $casts = [
        'quantity' => 'decimal:4',
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

    public function finishedProduct()
    {
        return $this->belongsTo(Product::class, 'finished_product_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(AssemblyItem::class);
    }
}
