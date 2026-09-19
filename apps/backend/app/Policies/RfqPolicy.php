<?php

namespace App\Policies;

use App\Models\Rfq;
use App\Models\User;

class RfqPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('rfqs.view') || $user->role === 'admin';
    }

    public function view(User $user, Rfq $rfq): bool
    {
        if ($user->hasPermission('rfqs.view') || $user->role === 'admin') {
            return true;
        }

        return $user->organization_id === $rfq->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('rfqs.create') || $user->role === 'admin' || $user->role === 'purchasing_officer';
    }

    public function update(User $user, Rfq $rfq): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $user->hasPermission('rfqs.update') && $user->organization_id === $rfq->organization_id && in_array($rfq->status, ['draft']);
    }

    public function delete(User $user, Rfq $rfq): bool
    {
        return $user->role === 'admin' && $rfq->status === 'draft';
    }

    public function publish(User $user, Rfq $rfq): bool
    {
        return $user->hasPermission('rfqs.publish') || $user->role === 'admin' || $user->role === 'purchasing_officer';
    }

    public function close(User $user, Rfq $rfq): bool
    {
        return $user->hasPermission('rfqs.close') || $user->role === 'admin' || $user->role === 'purchasing_officer';
    }
}
