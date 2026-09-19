<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Package;

class PackagePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('packages.view') || $user->role === 'admin';
    }

    public function view(User $user, Package $package): bool
    {
        if ($user->role === 'admin') {
            return true;
        }
        return $user->hasPermission('packages.view') && $user->organization_id === $package->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('packages.create') || $user->role === 'admin';
    }

    public function update(User $user, Package $package): bool
    {
        if ($user->role === 'admin') {
            return true;
        }
        return $user->hasPermission('packages.update') && $user->organization_id === $package->organization_id;
    }

    public function delete(User $user, Package $package): bool
    {
        return $user->role === 'admin';
    }
}
