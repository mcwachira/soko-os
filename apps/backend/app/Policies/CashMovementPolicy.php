<?php

namespace App\Policies;

use App\Models\CashMovement;
use App\Models\User;

class CashMovementPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, CashMovement $movement): bool
    {
        return $user->organization_id === $movement->organization_id;
    }

    public function create(User $user): bool
    {
        return true;
    }
}
