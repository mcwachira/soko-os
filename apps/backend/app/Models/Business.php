<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Business extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'id',
        'organization_id',
        'name',
        'business_type',
        'tax_pin',
        'currency',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function branches()
    {
        return $this->hasMany(Branch::class);
    }

    public function terminals()
    {
        return $this->hasMany(Terminal::class);
    }

    public function warehouses()
    {
        return $this->hasMany(Warehouse::class);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }
}
