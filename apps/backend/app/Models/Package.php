<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Traits\HasDocumentNumbers;

class Package extends Model
{
    use HasFactory, HasUuids, HasDocumentNumbers;

    protected $fillable = [
        'id',
        'organization_id',
        'business_id',
        'sale_id',
        'sales_order_id',
        'warehouse_id',
        'package_number',
        'status',
        'weight',
        'dimensions',
        'notes',
    ];

    protected $casts = [
        'weight' => 'decimal:2',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }

    public function salesOrder()
    {
        return $this->belongsTo(SalesOrder::class);
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function items()
    {
        return $this->hasMany(PackageItem::class);
    }
}
