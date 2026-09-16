<?php

namespace App\Policies;

use App\Models\GoodsReceivedNote;
use App\Models\User;

class GoodsReceivedNotePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('grns.view') || $user->role === 'admin';
    }

    public function view(User $user, GoodsReceivedNote $grn): bool
    {
        if ($user->hasPermission('grns.view') || $user->role === 'admin') {
            return true;
        }

        return $user->organization_id === $grn->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('grns.create') || $user->role === 'admin' || $user->role === 'purchasing_officer' || $user->role === 'warehouse_manager';
    }

    public function update(User $user, GoodsReceivedNote $grn): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $user->hasPermission('grns.update') && $user->organization_id === $grn->organization_id;
    }

    public function delete(User $user, GoodsReceivedNote $grn): bool
    {
        return $user->role === 'admin';
    }
}
