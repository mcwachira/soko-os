<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Role extends \Illuminate\Database\Eloquent\Model
{
    use HasUuids;

    protected $fillable = ['name', 'slug', 'description', 'permissions', 'organization_id'];

    protected function casts(): array
    {
        return [
            'permissions' => 'array',
        ];
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'role_id');
    }

    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'role_has_permissions');
    }
}
