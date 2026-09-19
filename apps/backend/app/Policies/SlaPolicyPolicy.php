<?php

namespace App\Policies;

use App\Models\SlaPolicy;
use App\Models\User;

class SlaPolicyPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('crm.slas.view') || $user->role === 'admin' || $user->role === 'sales_manager' || $user->role === 'support_manager';
    }

    public function view(User $user, SlaPolicy $policy): bool
    {
        if ($user->hasPermission('crm.slas.view') || $user->role === 'admin') {
            return true;
        }

        return $user->organization_id === $policy->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('crm.slas.create') || $user->role === 'admin' || $user->role === 'sales_manager';
    }

    public function update(User $user, SlaPolicy $policy): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $user->hasPermission('crm.slas.update') && $user->organization_id === $policy->organization_id;
    }

    public function delete(User $user, SlaPolicy $policy): bool
    {
        return $user->hasPermission('crm.slas.delete') || $user->role === 'admin';
    }
}
