<?php

namespace App\Policies;

use App\Models\TaxRate;
use App\Models\User;

class TaxRatePolicy
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
        return $user->hasPermission('tax.view') || $user->hasPermission('books.access');
    }

    public function view(User $user, TaxRate $taxRate): bool
    {
        if ($user->hasPermission('tax.view') || $user->hasPermission('books.access')) {
            return $user->organization_id === $taxRate->organization_id;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('tax.manage') || $user->hasPermission('books.access');
    }

    public function update(User $user, TaxRate $taxRate): bool
    {
        return $user->hasPermission('tax.manage')
            && $user->organization_id === $taxRate->organization_id;
    }

    public function delete(User $user, TaxRate $taxRate): bool
    {
        return $user->hasPermission('tax.manage')
            && $user->organization_id === $taxRate->organization_id;
    }
}
