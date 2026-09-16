<?php

namespace App\Policies;

use App\Models\StoreCredit;
use App\Models\User;

class StoreCreditPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, StoreCredit $credit): bool
    {
        return $user->organization_id === $credit->organization_id;
    }

    public function create(User $user): bool
    {
        return true;
    }
}
