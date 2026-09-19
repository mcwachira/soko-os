<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Batch;

class BatchPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('batches.view') || $user->role === 'admin';
    }

    public function view(User $user, Batch $batch): bool
    {
        if ($user->role === 'admin') {
            return true;
        }
        return $user->hasPermission('batches.view') && $user->organization_id === $batch->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('batches.create') || $user->role === 'admin';
    }

    public function update(User $user, Batch $batch): bool
    {
        if ($user->role === 'admin') {
            return true;
        }
        return $user->hasPermission('batches.update') && $user->organization_id === $batch->organization_id;
    }

    public function delete(User $user, Batch $batch): bool
    {
        return $user->role === 'admin';
    }
}
