<?php

namespace App\Policies;

use App\Models\Workflow;
use App\Models\User;

class WorkflowPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('crm.workflows.view') || $user->role === 'admin' || $user->role === 'sales_manager';
    }

    public function view(User $user, Workflow $workflow): bool
    {
        if ($user->hasPermission('crm.workflows.view') || $user->role === 'admin') {
            return true;
        }

        return $user->organization_id === $workflow->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('crm.workflows.create') || $user->role === 'admin' || $user->role === 'sales_manager';
    }

    public function update(User $user, Workflow $workflow): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $user->hasPermission('crm.workflows.update') && $user->organization_id === $workflow->organization_id;
    }

    public function delete(User $user, Workflow $workflow): bool
    {
        return $user->hasPermission('crm.workflows.delete') || $user->role === 'admin';
    }
}
