<?php

namespace App\Policies;

use App\Models\QuickKey;
use App\Models\User;

class QuickKeyPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, QuickKey $key): bool
    {
        return $user->organization_id === $key->organization_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, QuickKey $key): bool
    {
        return $user->organization_id === $key->organization_id;
    }

    public function delete(User $user, QuickKey $key): bool
    {
        return $user->organization_id === $key->organization_id;
    }
}
