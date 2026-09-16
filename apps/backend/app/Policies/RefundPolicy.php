<?php

namespace App\Policies;

use App\Models\Refund;
use App\Models\User;

class RefundPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('refunds.view') || $user->role === 'admin' || $user->role === 'supervisor';
    }

    public function view(User $user, Refund $refund): bool
    {
        if ($user->hasPermission('refunds.view') || $user->role === 'admin' || $user->role === 'supervisor') {
            return true;
        }

        return $user->branch_id === $refund->branch_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('refunds.create') || $user->role === 'admin' || $user->role === 'supervisor' || $user->role === 'cashier';
    }

    public function update(User $user, Refund $refund): bool
    {
        if ($user->role === 'admin' || $user->role === 'supervisor') {
            return true;
        }

        return $user->hasPermission('refunds.update') && $user->organization_id === $refund->organization_id;
    }

    public function complete(User $user, Refund $refund): bool
    {
        return $user->hasPermission('refunds.complete') || $user->role === 'admin' || $user->role === 'supervisor';
    }

    public function delete(User $user, Refund $refund): bool
    {
        return $user->role === 'admin';
    }
}
