<?php

namespace App\Policies;

use App\Models\AccountingPeriod;
use App\Models\User;

class AccountingPeriodPolicy
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
        return $user->hasPermission('fiscal.view') || $user->hasPermission('books.access');
    }

    public function view(User $user, AccountingPeriod $accountingPeriod): bool
    {
        if ($user->hasPermission('fiscal.view') || $user->hasPermission('books.access')) {
            return $user->organization_id === $accountingPeriod->organization_id;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('fiscal.manage') || $user->hasPermission('books.access');
    }

    public function update(User $user, AccountingPeriod $accountingPeriod): bool
    {
        return $user->hasPermission('fiscal.manage')
            && $user->organization_id === $accountingPeriod->organization_id;
    }

    public function delete(User $user, AccountingPeriod $accountingPeriod): bool
    {
        return $user->hasPermission('fiscal.manage')
            && $user->organization_id === $accountingPeriod->organization_id;
    }
}
