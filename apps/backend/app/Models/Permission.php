<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Permission extends \Illuminate\Database\Eloquent\Model
{
    use HasUuids;

    protected $fillable = ['name', 'slug', 'description', 'group', 'organization_id'];

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_has_permissions');
    }
}
