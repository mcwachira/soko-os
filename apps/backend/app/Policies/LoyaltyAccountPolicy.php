<?php

namespace App\Policies;

use App\Models\LoyaltyAccount;
use App\Models\User;

class LoyaltyAccountPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, LoyaltyAccount $account): bool
    {
        return $user->organization_id === $account->organization_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, LoyaltyAccount $account): bool
    {
        return $user->organization_id === $account->organization_id;
    }
}
