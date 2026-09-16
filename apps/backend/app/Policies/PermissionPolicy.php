<?php

namespace App\Policies;

use App\Models\Permission;
use App\Models\User;

class PermissionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('permissions.view') || $user->role === 'admin' || $user->role === 'owner';
    }

    public function view(User $user, Permission $permission): bool
    {
        return $this->viewAny($user);
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('permissions.create') || $user->role === 'admin' || $user->role === 'owner';
    }

    public function update(User $user, Permission $permission): bool
    {
        return $user->hasPermission('permissions.update') || $user->role === 'admin' || $user->role === 'owner';
    }

    public function delete(User $user, Permission $permission): bool
    {
        return $user->hasPermission('permissions.delete') || $user->role === 'admin' || $user->role === 'owner';
    }
}
