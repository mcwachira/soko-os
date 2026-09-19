<?php

namespace App\Policies;

use App\Models\User;
use App\Models\TransferOrder;

class TransferOrderPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('transfers.view') || $user->role === 'admin';
    }

    public function view(User $user, TransferOrder $transferOrder): bool
    {
        if ($user->role === 'admin') {
            return true;
        }
        return $user->hasPermission('transfers.view') && $user->organization_id === $transferOrder->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('transfers.create') || $user->role === 'admin';
    }

    public function update(User $user, TransferOrder $transferOrder): bool
    {
        if ($user->role === 'admin') {
            return true;
        }
        return $user->hasPermission('transfers.update') && $user->organization_id === $transferOrder->organization_id;
    }

    public function delete(User $user, TransferOrder $transferOrder): bool
    {
        return $user->role === 'admin';
    }
}
