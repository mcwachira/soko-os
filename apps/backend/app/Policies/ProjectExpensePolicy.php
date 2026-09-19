<?php

namespace App\Policies;

use App\Models\ProjectExpense;
use App\Models\User;

class ProjectExpensePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, ProjectExpense $expense): bool
    {
        return $user->organization_id === $expense->organization_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, ProjectExpense $expense): bool
    {
        return $user->organization_id === $expense->organization_id;
    }

    public function delete(User $user, ProjectExpense $expense): bool
    {
        return $user->organization_id === $expense->organization_id;
    }
}
