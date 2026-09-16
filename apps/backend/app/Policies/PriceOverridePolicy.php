<?php

namespace App\Policies;

use App\Models\PriceOverride;
use App\Models\User;

class PriceOverridePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, PriceOverride $override): bool
    {
        return $user->organization_id === $override->organization_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function approve(User $user, PriceOverride $override): bool
    {
        return $user->hasPermission('pos.price_override') || $user->role === 'admin' || $user->role === 'manager';
    }
}
