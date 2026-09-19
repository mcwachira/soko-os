<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Assembly;

class AssemblyPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('assemblies.view') || $user->role === 'admin';
    }

    public function view(User $user, Assembly $assembly): bool
    {
        if ($user->role === 'admin') {
            return true;
        }
        return $user->hasPermission('assemblies.view') && $user->organization_id === $assembly->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('assemblies.create') || $user->role === 'admin';
    }

    public function update(User $user, Assembly $assembly): bool
    {
        if ($user->role === 'admin') {
            return true;
        }
        return $user->hasPermission('assemblies.update') && $user->organization_id === $assembly->organization_id;
    }

    public function delete(User $user, Assembly $assembly): bool
    {
        return $user->role === 'admin';
    }
}
