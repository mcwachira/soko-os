<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Bin;

class BinPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('bins.view') || $user->role === 'admin';
    }

    public function view(User $user, Bin $bin): bool
    {
        if ($user->role === 'admin') {
            return true;
        }
        return $user->hasPermission('bins.view') && $user->organization_id === $bin->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('bins.create') || $user->role === 'admin';
    }

    public function update(User $user, Bin $bin): bool
    {
        if ($user->role === 'admin') {
            return true;
        }
        return $user->hasPermission('bins.update') && $user->organization_id === $bin->organization_id;
    }

    public function delete(User $user, Bin $bin): bool
    {
        return $user->role === 'admin';
    }
}
