<?php

namespace App\Policies;

use App\Models\Account;
use App\Models\User;

class AccountPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermission('accounts.view') || $user->hasPermission('books.access');
    }

    public function view(User $user, Account $account): bool
    {
        if ($user->hasPermission('accounts.view') || $user->hasPermission('books.access')) {
            return $user->organization_id === $account->organization_id;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('accounts.create') || $user->hasPermission('books.access');
    }

    public function update(User $user, Account $account): bool
    {
        return $user->hasPermission('accounts.update')
            && $user->organization_id === $account->organization_id;
    }

    public function delete(User $user, Account $account): bool
    {
        if ($account->is_system) {
            return false;
        }

        return $user->hasPermission('accounts.delete')
            && $user->organization_id === $account->organization_id;
    }
}
