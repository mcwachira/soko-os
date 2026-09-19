<?php

namespace App\Policies;

use App\Models\Activity;
use App\Models\User;

class ActivityPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('crm.activities.view') || $user->role === 'admin' || $user->role === 'sales_rep' || $user->role === 'sales_manager';
    }

    public function view(User $user, Activity $activity): bool
    {
        if ($user->hasPermission('crm.activities.view') || $user->role === 'admin') {
            return true;
        }

        return $user->organization_id === $activity->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('crm.activities.create') || $user->role === 'admin' || $user->role === 'sales_rep' || $user->role === 'sales_manager';
    }

    public function update(User $user, Activity $activity): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $user->hasPermission('crm.activities.update') && $user->organization_id === $activity->organization_id;
    }

    public function delete(User $user, Activity $activity): bool
    {
        return $user->hasPermission('crm.activities.delete') || $user->role === 'admin';
    }
}
