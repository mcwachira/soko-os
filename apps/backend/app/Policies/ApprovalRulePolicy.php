<?php

namespace App\Policies;

use App\Models\ApprovalRule;
use App\Models\User;

class ApprovalRulePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('approval_rules.view') || $user->role === 'admin';
    }

    public function view(User $user, ApprovalRule $approvalRule): bool
    {
        if ($user->hasPermission('approval_rules.view') || $user->role === 'admin') {
            return true;
        }

        return $user->organization_id === $approvalRule->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('approval_rules.create') || $user->role === 'admin' || $user->role === 'manager';
    }

    public function update(User $user, ApprovalRule $approvalRule): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $user->hasPermission('approval_rules.update') && $user->organization_id === $approvalRule->organization_id;
    }

    public function delete(User $user, ApprovalRule $approvalRule): bool
    {
        return $user->role === 'admin';
    }
}
