<?php

namespace App\Policies;

use App\Models\Tender;
use App\Models\User;

class TenderPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('tenders.view') || $user->role === 'admin';
    }

    public function view(User $user, Tender $tender): bool
    {
        if ($user->hasPermission('tenders.view') || $user->role === 'admin') {
            return true;
        }

        return $user->organization_id === $tender->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('tenders.create') || $user->role === 'admin' || $user->role === 'purchasing_officer';
    }

    public function update(User $user, Tender $tender): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $user->hasPermission('tenders.update') && $user->organization_id === $tender->organization_id && in_array($tender->status, ['draft']);
    }

    public function delete(User $user, Tender $tender): bool
    {
        return $user->role === 'admin' && $tender->status === 'draft';
    }
}
