<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Traits\HasDocumentNumbers;

class Stocktake extends Model
{
    use HasFactory, HasUuids, HasDocumentNumbers;

    protected $fillable = [
        'id',
        'organization_id',
        'business_id',
        'branch_id',
        'warehouse_id',
        'user_id',
        'stocktake_number',
        'type',
        'scope',
        'freeze_stock',
        'blind_count',
        'status',
        'started_at',
        'completed_at',
        'approved_by_user_id',
        'approved_at',
    ];

    protected $casts = [
        'scope' => 'array',
        'freeze_stock' => 'boolean',
        'blind_count' => 'boolean',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'approved_at' => 'datetime',
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

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by_user_id');
    }

    public function items()
    {
        return $this->hasMany(StocktakeItem::class);
    }
}
