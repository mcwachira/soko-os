<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Organization extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'id',
        'name',
        'slug',
        'tax_number',
        'country_code',
        'currency',
        'status',
    ];

    protected $casts = [
        'country_code' => 'string',
        'currency' => 'string',
    ];

    public function businesses()
    {
        return $this->hasMany(Business::class);
    }

    public function branches()
    {
        return $this->hasMany(Branch::class);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function memberships()
    {
        return $this->hasMany(TenantMembership::class);
    }

    public function invitations()
    {
        return $this->hasMany(Invitation::class);
    }
}
