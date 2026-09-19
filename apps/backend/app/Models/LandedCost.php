<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Traits\HasDocumentNumbers;

class LandedCost extends Model
{
    use HasFactory, HasUuids, HasDocumentNumbers;

    protected $fillable = [
        'id',
        'organization_id',
        'business_id',
        'purchase_order_id',
        'grn_id',
        'user_id',
        'landed_cost_number',
        'costs',
        'total_cost_minor',
        'allocation_method',
        'status',
    ];

    protected $casts = [
        'costs' => 'array',
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

    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function grn()
    {
        return $this->belongsTo(GoodsReceivedNote::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function allocations()
    {
        return $this->hasMany(LandedCostAllocation::class);
    }
}
