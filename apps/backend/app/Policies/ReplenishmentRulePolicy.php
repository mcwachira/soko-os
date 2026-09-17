<?php

namespace App\Policies;

use App\Models\User;
use App\Models\ReplenishmentRule;

class ReplenishmentRulePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('replenishment.view') || $user->role === 'admin';
    }

    public function view(User $user, ReplenishmentRule $rule): bool
    {
        if ($user->role === 'admin') {
            return true;
        }
        return $user->hasPermission('replenishment.view') && $user->organization_id === $rule->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('replenishment.create') || $user->role === 'admin';
    }

    public function update(User $user, ReplenishmentRule $rule): bool
    {
        if ($user->role === 'admin') {
            return true;
        }
        return $user->hasPermission('replenishment.update') && $user->organization_id === $rule->organization_id;
    }

    public function delete(User $user, ReplenishmentRule $rule): bool
    {
        return $user->role === 'admin';
    }
}
