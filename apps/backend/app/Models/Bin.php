<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bin extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'id',
        'organization_id',
        'business_id',
        'warehouse_id',
        'zone_id',
        'name',
        'code',
        'aisle',
        'rack',
        'shelf',
        'capacity',
        'status',
        'pick_priority',
        'putaway_priority',
    ];

    protected $casts = [
        'capacity' => 'decimal:4',
        'pick_priority' => 'integer',
        'putaway_priority' => 'integer',
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

    public function zone()
    {
        return $this->belongsTo(Zone::class);
    }
}
