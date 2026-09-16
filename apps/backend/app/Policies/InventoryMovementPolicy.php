<?php

namespace App\Policies;

use App\Models\InventoryMovement;
use App\Models\User;

class InventoryMovementPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('inventory.view') || $user->role === 'admin' || $user->role === 'inventory_manager';
    }

    public function view(User $user, InventoryMovement $movement): bool
    {
        if ($user->role === 'admin' || $user->role === 'inventory_manager') {
            return true;
        }

        return $user->organization_id === $movement->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('inventory.create') || $user->role === 'admin' || $user->role === 'inventory_manager';
    }

    public function update(User $user, InventoryMovement $movement): bool
    {
        return $user->role === 'admin';
    }

    public function delete(User $user, InventoryMovement $movement): bool
    {
        return false; // Inventory movements cannot be deleted
    }
}
