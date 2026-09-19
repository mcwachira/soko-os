<?php

namespace App\Policies;

use App\Models\Deal;
use App\Models\User;

class DealPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('crm.deals.view') || $user->role === 'admin' || $user->role === 'sales_rep' || $user->role === 'sales_manager' || $user->role === 'account_manager';
    }

    public function view(User $user, Deal $deal): bool
    {
        if ($user->hasPermission('crm.deals.view') || $user->role === 'admin') {
            return true;
        }

        return $user->organization_id === $deal->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('crm.deals.create') || $user->role === 'admin' || $user->role === 'sales_rep' || $user->role === 'sales_manager';
    }

    public function update(User $user, Deal $deal): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $user->hasPermission('crm.deals.update') && $user->organization_id === $deal->organization_id;
    }

    public function delete(User $user, Deal $deal): bool
    {
        return $user->hasPermission('crm.deals.delete') || $user->role === 'admin';
    }

    public function close(User $user, Deal $deal): bool
    {
        return $user->hasPermission('crm.deals.close') || $user->role === 'admin' || $user->role === 'sales_manager';
    }
}
