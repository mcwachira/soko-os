<?php

namespace App\Policies;

use App\Models\ProcurementContract;
use App\Models\User;

class ProcurementContractPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('contracts.view') || $user->role === 'admin';
    }

    public function view(User $user, ProcurementContract $procurementContract): bool
    {
        if ($user->hasPermission('contracts.view') || $user->role === 'admin') {
            return true;
        }

        return $user->organization_id === $procurementContract->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('contracts.create') || $user->role === 'admin' || $user->role === 'purchasing_officer';
    }

    public function update(User $user, ProcurementContract $procurementContract): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $user->hasPermission('contracts.update') && $user->organization_id === $procurementContract->organization_id && in_array($procurementContract->status, ['draft', 'active']);
    }

    public function delete(User $user, ProcurementContract $procurementContract): bool
    {
        return $user->role === 'admin' && $procurementContract->status === 'draft';
    }
}
