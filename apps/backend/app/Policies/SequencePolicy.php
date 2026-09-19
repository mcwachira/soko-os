<?php

namespace App\Policies;

use App\Models\Sequence;
use App\Models\User;

class SequencePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('crm.sequences.view') || $user->role === 'admin' || $user->role === 'marketing' || $user->role === 'sales_manager';
    }

    public function view(User $user, Sequence $sequence): bool
    {
        if ($user->hasPermission('crm.sequences.view') || $user->role === 'admin') {
            return true;
        }

        return $user->organization_id === $sequence->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('crm.sequences.create') || $user->role === 'admin' || $user->role === 'marketing' || $user->role === 'sales_manager';
    }

    public function update(User $user, Sequence $sequence): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $user->hasPermission('crm.sequences.update') && $user->organization_id === $sequence->organization_id;
    }

    public function delete(User $user, Sequence $sequence): bool
    {
        return $user->hasPermission('crm.sequences.delete') || $user->role === 'admin';
    }
}
