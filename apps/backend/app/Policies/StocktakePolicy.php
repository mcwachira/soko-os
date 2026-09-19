<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Stocktake;

class StocktakePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('stocktakes.view') || $user->role === 'admin';
    }

    public function view(User $user, Stocktake $stocktake): bool
    {
        if ($user->role === 'admin') {
            return true;
        }
        return $user->hasPermission('stocktakes.view') && $user->organization_id === $stocktake->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('stocktakes.create') || $user->role === 'admin';
    }

    public function update(User $user, Stocktake $stocktake): bool
    {
        if ($user->role === 'admin') {
            return true;
        }
        return $user->hasPermission('stocktakes.update') && $user->organization_id === $stocktake->organization_id;
    }

    public function delete(User $user, Stocktake $stocktake): bool
    {
        return $user->role === 'admin';
    }
}
