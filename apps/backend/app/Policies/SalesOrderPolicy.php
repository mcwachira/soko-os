<?php

namespace App\Policies;

use App\Models\SalesOrder;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class SalesOrderPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, SalesOrder $salesOrder): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, SalesOrder $salesOrder): bool
    {
        return true;
    }

    public function delete(User $user, SalesOrder $salesOrder): bool
    {
        return true;
    }
}
