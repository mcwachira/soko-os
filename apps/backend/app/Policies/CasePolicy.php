<?php

namespace App\Policies;

use App\Models\CaseModel;
use App\Models\User;

class CasePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('crm.cases.view') || $user->role === 'admin' || $user->role === 'support_agent' || $user->role === 'support_manager';
    }

    public function view(User $user, CaseModel $case): bool
    {
        if ($user->hasPermission('crm.cases.view') || $user->role === 'admin') {
            return true;
        }

        return $user->organization_id === $case->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('crm.cases.create') || $user->role === 'admin' || $user->role === 'support_agent' || $user->role === 'support_manager';
    }

    public function update(User $user, CaseModel $case): bool
    {
        if ($user->role === 'admin' || $user->role === 'support_manager') {
            return true;
        }

        return $user->hasPermission('crm.cases.update') && $user->organization_id === $case->organization_id;
    }

    public function delete(User $user, CaseModel $case): bool
    {
        return $user->hasPermission('crm.cases.delete') || $user->role === 'admin';
    }
}
