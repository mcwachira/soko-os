<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PurchaseOrder extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'id',
        'organization_id',
        'business_id',
        'branch_id',
        'warehouse_id',
        'supplier_id',
        'user_id',
        'po_number',
        'status',
        'subtotal_minor',
        'tax_total_minor',
        'grand_total_minor',
        'expected_date',
        'received_date',
        'notes',
    ];

    protected $casts = [
        'subtotal_minor' => 'integer',
        'tax_total_minor' => 'integer',
        'grand_total_minor' => 'integer',
        'expected_date' => 'date',
        'received_date' => 'date',
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

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function items()
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }
}
