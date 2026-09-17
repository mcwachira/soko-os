<?php

namespace App\Policies;

use App\Models\User;
use App\Models\InventoryAdjustment;

class InventoryAdjustmentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('inventory_adjustments.view') || $user->role === 'admin';
    }

    public function view(User $user, InventoryAdjustment $adjustment): bool
    {
        if ($user->role === 'admin') {
            return true;
        }
        return $user->hasPermission('inventory_adjustments.view') && $user->organization_id === $adjustment->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('inventory_adjustments.create') || $user->role === 'admin';
    }

    public function update(User $user, InventoryAdjustment $adjustment): bool
    {
        if ($user->role === 'admin') {
            return true;
        }
        return $user->hasPermission('inventory_adjustments.update') && $user->organization_id === $adjustment->organization_id;
    }

    public function delete(User $user, InventoryAdjustment $adjustment): bool
    {
        return $user->role === 'admin';
    }
}
