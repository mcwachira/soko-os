<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Branch extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'id',
        'organization_id',
        'business_id',
        'name',
        'code',
        'address',
        'phone',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function terminals()
    {
        return $this->hasMany(Terminal::class);
    }

    public function warehouses()
    {
        return $this->hasMany(Warehouse::class);
    }

    public function cashShifts()
    {
        return $this->hasMany(CashShift::class);
    }

    public function sales()
    {
        return $this->hasMany(Sale::class);
    }
}
