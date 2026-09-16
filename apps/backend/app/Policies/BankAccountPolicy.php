<?php

namespace App\Policies;

use App\Models\BankAccount;
use App\Models\User;

class BankAccountPolicy
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
        return $user->hasPermission('bank.view') || $user->hasPermission('books.access');
    }

    public function view(User $user, BankAccount $bankAccount): bool
    {
        if ($user->hasPermission('bank.view') || $user->hasPermission('books.access')) {
            return $user->organization_id === $bankAccount->organization_id;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('bank.view') || $user->hasPermission('books.access');
    }

    public function update(User $user, BankAccount $bankAccount): bool
    {
        return $user->hasPermission('bank.view')
            && $user->organization_id === $bankAccount->organization_id;
    }

    public function delete(User $user, BankAccount $bankAccount): bool
    {
        return $user->hasPermission('bank.view')
            && $user->organization_id === $bankAccount->organization_id;
    }
}
