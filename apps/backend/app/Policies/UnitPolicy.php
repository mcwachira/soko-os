<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Unit;

class UnitPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('units.view') || $user->role === 'admin';
    }

    public function view(User $user, Unit $unit): bool
    {
        if ($user->role === 'admin') {
            return true;
        }
        return $user->hasPermission('units.view') && $user->organization_id === $unit->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('units.create') || $user->role === 'admin';
    }

    public function update(User $user, Unit $unit): bool
    {
        if ($user->role === 'admin') {
            return true;
        }
        return $user->hasPermission('units.update') && $user->organization_id === $unit->organization_id;
    }

    public function delete(User $user, Unit $unit): bool
    {
        return $user->role === 'admin';
    }
}
