<?php

namespace App\Policies;

use App\Models\Bill;
use App\Models\User;

class BillPolicy
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
        return $user->hasPermission('bills.view') || $user->hasPermission('books.access');
    }

    public function view(User $user, Bill $bill): bool
    {
        if ($user->hasPermission('bills.view') || $user->hasPermission('books.access')) {
            return $user->organization_id === $bill->organization_id;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('bills.create') || $user->hasPermission('books.access');
    }

    public function update(User $user, Bill $bill): bool
    {
        return $user->hasPermission('bills.update')
            && $user->organization_id === $bill->organization_id;
    }

    public function delete(User $user, Bill $bill): bool
    {
        return $user->hasPermission('bills.delete')
            && $user->organization_id === $bill->organization_id;
    }
}
