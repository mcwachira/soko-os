<?php

namespace App\Policies;

use App\Models\ReturnModel;
use App\Models\User;

class ReturnPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('returns.view') || $user->role === 'admin' || $user->role === 'supervisor';
    }

    public function view(User $user, ReturnModel $return): bool
    {
        if ($user->hasPermission('returns.view') || $user->role === 'admin' || $user->role === 'supervisor') {
            return true;
        }

        return $user->branch_id === $return->branch_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('returns.create') || $user->role === 'admin' || $user->role === 'supervisor' || $user->role === 'cashier';
    }

    public function update(User $user, ReturnModel $return): bool
    {
        if ($user->role === 'admin' || $user->role === 'supervisor') {
            return true;
        }

        return $user->hasPermission('returns.update') && $user->organization_id === $return->organization_id;
    }

    public function approve(User $user, ReturnModel $return): bool
    {
        return $user->hasPermission('returns.approve') || $user->role === 'admin' || $user->role === 'supervisor';
    }

    public function delete(User $user, ReturnModel $return): bool
    {
        return $user->role === 'admin';
    }
}
