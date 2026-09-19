<?php

namespace App\Policies;

use App\Models\User;
use App\Models\LandedCost;

class LandedCostPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('landed_costs.view') || $user->role === 'admin';
    }

    public function view(User $user, LandedCost $landedCost): bool
    {
        if ($user->role === 'admin') {
            return true;
        }
        return $user->hasPermission('landed_costs.view') && $user->organization_id === $landedCost->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('landed_costs.create') || $user->role === 'admin';
    }

    public function update(User $user, LandedCost $landedCost): bool
    {
        if ($user->role === 'admin') {
            return true;
        }
        return $user->hasPermission('landed_costs.update') && $user->organization_id === $landedCost->organization_id;
    }

    public function delete(User $user, LandedCost $landedCost): bool
    {
        return $user->role === 'admin';
    }
}
