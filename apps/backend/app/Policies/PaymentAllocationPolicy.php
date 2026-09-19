<?php

namespace App\Policies;

use App\Models\PaymentAllocation;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class PaymentAllocationPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, PaymentAllocation $allocation): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, PaymentAllocation $allocation): bool
    {
        return true;
    }

    public function delete(User $user, PaymentAllocation $allocation): bool
    {
        return true;
    }
}
