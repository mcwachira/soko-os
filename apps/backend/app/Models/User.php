<?php

namespace App\Models;

use App\Models\Role;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['organization_id', 'business_id', 'name', 'email', 'phone', 'password', 'role', 'permissions', 'is_active', 'role_id'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, HasUuids, Notifiable;

    public $incrementing = false;

    protected $keyType = 'string';

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'permissions' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function devices()
    {
        return $this->hasMany(Device::class);
    }

    public function memberships()
    {
        return $this->hasMany(TenantMembership::class);
    }

    public function activeMemberships()
    {
        return $this->memberships()->active();
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === 'super-admin' || in_array('*', $this->permissions ?? []);
    }

    public function hasPermission(string $permission): bool
    {
        $directPermissions = $this->permissions ?? [];

        if (in_array('*', $directPermissions) || in_array($permission, $directPermissions)) {
            return true;
        }

        if ($this->role) {
            $rolePermissions = $this->role->permissions ?? [];

            if (in_array('*', $rolePermissions) || in_array($permission, $rolePermissions)) {
                return true;
            }
        }

        return false;
    }

    public function hasRole(string $roleName): bool
    {
        return $this->role === $roleName || ($this->role && $this->role->slug === $roleName);
    }
}
