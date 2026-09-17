<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Warehouse;

class WarehousePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('warehouses.view') || $user->role === 'admin';
    }

    public function view(User $user, Warehouse $warehouse): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $user->hasPermission('warehouses.view') && $user->organization_id === $warehouse->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('warehouses.create') || $user->role === 'admin';
    }

    public function update(User $user, Warehouse $warehouse): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $user->hasPermission('warehouses.update') && $user->organization_id === $warehouse->organization_id;
    }

    public function delete(User $user, Warehouse $warehouse): bool
    {
        return $user->role === 'admin';
    }
}
