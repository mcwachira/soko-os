<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryMovement extends Model
{
    use HasUuids;

    protected $fillable = [
        'id',
        'organization_id',
        'business_id',
        'branch_id',
        'warehouse_id',
        'product_id',
        'movement_type',
        'quantity_change',
        'balance_after',
        'reference_type',
        'reference_id',
        'notes',
        'created_by_user_id',
    ];

    protected $casts = [
        'quantity_change' => 'decimal:4',
        'balance_after' => 'decimal:4',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }
}
