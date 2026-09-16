<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Terminal extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'id',
        'organization_id',
        'business_id',
        'branch_id',
        'name',
        'terminal_code',
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

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function devices()
    {
        return $this->hasMany(Device::class);
    }

    public function sales()
    {
        return $this->hasMany(Sale::class);
    }

    public function cashShifts()
    {
        return $this->hasMany(CashShift::class);
    }
}
