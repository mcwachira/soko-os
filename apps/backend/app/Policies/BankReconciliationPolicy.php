<?php

namespace App\Policies;

use App\Models\BankReconciliation;
use App\Models\User;

class BankReconciliationPolicy
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
        return $user->hasPermission('bank.reconcile') || $user->hasPermission('bank.view') || $user->hasPermission('books.access');
    }

    public function view(User $user, BankReconciliation $bankReconciliation): bool
    {
        if ($user->hasPermission('bank.reconcile') || $user->hasPermission('bank.view') || $user->hasPermission('books.access')) {
            return $user->organization_id === $bankReconciliation->organization_id;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('bank.reconcile') || $user->hasPermission('bank.view') || $user->hasPermission('books.access');
    }

    public function update(User $user, BankReconciliation $bankReconciliation): bool
    {
        return $user->hasPermission('bank.reconcile')
            && $user->organization_id === $bankReconciliation->organization_id;
    }

    public function delete(User $user, BankReconciliation $bankReconciliation): bool
    {
        return $user->hasPermission('bank.reconcile')
            && $user->organization_id === $bankReconciliation->organization_id;
    }
}
