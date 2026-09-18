<?php

namespace App\Policies;

use App\Models\CrmAccount;
use App\Models\User;

class CrmAccountPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('crm.accounts.view') || $user->role === 'admin' || $user->role === 'sales_rep' || $user->role === 'account_manager';
    }

    public function view(User $user, CrmAccount $account): bool
    {
        if ($user->hasPermission('crm.accounts.view') || $user->role === 'admin') {
            return true;
        }

        return $user->organization_id === $account->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('crm.accounts.create') || $user->role === 'admin' || $user->role === 'sales_rep' || $user->role === 'account_manager';
    }

    public function update(User $user, CrmAccount $account): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $user->hasPermission('crm.accounts.update') && $user->organization_id === $account->organization_id;
    }

    public function delete(User $user, CrmAccount $account): bool
    {
        return $user->hasPermission('crm.accounts.delete') || $user->role === 'admin';
    }
}
