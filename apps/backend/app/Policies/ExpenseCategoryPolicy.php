<?php

namespace App\Policies;

use App\Models\ExpenseCategory;
use App\Models\User;

class ExpenseCategoryPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('books.expenses.view') || $user->hasPermission('sales.view') || $user->role === 'admin';
    }

    public function view(User $user, ExpenseCategory $category): bool
    {
        return $user->hasPermission('books.expenses.view') || $user->hasPermission('sales.view') || $user->role === 'admin';
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('books.expenses.create') || $user->hasPermission('sales.create') || $user->role === 'admin';
    }

    public function update(User $user, ExpenseCategory $category): bool
    {
        return $user->hasPermission('books.expenses.update') || $user->hasPermission('sales.update') || $user->role === 'admin';
    }

    public function delete(User $user, ExpenseCategory $category): bool
    {
        return $user->hasPermission('books.expenses.delete') || $user->hasPermission('sales.delete') || $user->role === 'admin';
    }
}
