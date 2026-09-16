<?php

namespace App\Policies;

use App\Models\Expense;
use App\Models\User;

class ExpensePolicy
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
        return $user->hasPermission('expenses.view') || $user->hasPermission('books.access');
    }

    public function view(User $user, Expense $expense): bool
    {
        if ($user->hasPermission('expenses.view') || $user->hasPermission('books.access')) {
            return $user->organization_id === $expense->organization_id;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('expenses.create') || $user->hasPermission('books.access');
    }

    public function update(User $user, Expense $expense): bool
    {
        return $user->hasPermission('expenses.update')
            && $user->organization_id === $expense->organization_id;
    }

    public function delete(User $user, Expense $expense): bool
    {
        return $user->hasPermission('expenses.delete')
            && $user->organization_id === $expense->organization_id;
    }

    public function approve(User $user, Expense $expense): bool
    {
        return $user->hasPermission('expenses.approve')
            && $user->organization_id === $expense->organization_id;
    }
}
