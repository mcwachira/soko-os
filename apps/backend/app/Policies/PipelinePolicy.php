<?php

namespace App\Policies;

use App\Models\Pipeline;
use App\Models\User;

class PipelinePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('crm.pipelines.view') || $user->role === 'admin' || $user->role === 'sales_manager';
    }

    public function view(User $user, Pipeline $pipeline): bool
    {
        if ($user->hasPermission('crm.pipelines.view') || $user->role === 'admin') {
            return true;
        }

        return $user->organization_id === $pipeline->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('crm.pipelines.create') || $user->role === 'admin' || $user->role === 'sales_manager';
    }

    public function update(User $user, Pipeline $pipeline): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $user->hasPermission('crm.pipelines.update') && $user->organization_id === $pipeline->organization_id;
    }

    public function delete(User $user, Pipeline $pipeline): bool
    {
        return $user->hasPermission('crm.pipelines.delete') || $user->role === 'admin';
    }
}
