<?php

namespace App\Policies;

use App\Models\FiscalYear;
use App\Models\User;

class FiscalYearPolicy
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

    public function view(User $user, FiscalYear $fiscalYear): bool
    {
        if ($user->hasPermission('fiscal.view') || $user->hasPermission('books.access')) {
            return $user->organization_id === $fiscalYear->organization_id;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('fiscal.manage') || $user->hasPermission('books.access');
    }

    public function update(User $user, FiscalYear $fiscalYear): bool
    {
        return $user->hasPermission('fiscal.manage')
            && $user->organization_id === $fiscalYear->organization_id;
    }

    public function delete(User $user, FiscalYear $fiscalYear): bool
    {
        return $user->hasPermission('fiscal.manage')
            && $user->organization_id === $fiscalYear->organization_id;
    }
}
