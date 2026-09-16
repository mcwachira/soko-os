<?php

namespace App\Policies;

use App\Models\Role;
use App\Models\User;

class RolePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('roles.view') || $user->role === 'admin' || $user->role === 'owner';
    }

    public function view(User $user, Role $role): bool
    {
        return $this->viewAny($user);
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('roles.create') || $user->role === 'admin' || $user->role === 'owner';
    }

    public function update(User $user, Role $role): bool
    {
        return $user->hasPermission('roles.update') || $user->role === 'admin' || $user->role === 'owner';
    }

    public function delete(User $user, Role $role): bool
    {
        return $user->hasPermission('roles.delete') || $user->role === 'admin' || $user->role === 'owner';
    }
}
