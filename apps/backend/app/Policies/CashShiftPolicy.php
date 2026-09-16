<?php

namespace App\Policies;

use App\Models\CashShift;
use App\Models\User;

class CashShiftPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('shifts.view') || $user->role === 'admin' || $user->role === 'cashier';
    }

    public function view(User $user, CashShift $shift): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        // Cashiers can only view their own shifts
        if ($user->role === 'cashier') {
            return $shift->cashier_user_id === $user->id;
        }

        return $user->hasPermission('shifts.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('shifts.create') || $user->role === 'admin' || $user->role === 'cashier';
    }

    public function update(User $user, CashShift $shift): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        // Only the cashier who opened the shift can update it
        return $shift->cashier_user_id === $user->id;
    }

    public function close(User $user, CashShift $shift): bool
    {
        if ($user->role === 'admin' || $user->role === 'supervisor') {
            return true;
        }

        // Only the cashier who opened the shift can close it
        return $shift->cashier_user_id === $user->id;
    }

    public function delete(User $user, CashShift $shift): bool
    {
        return false; // Shifts cannot be deleted
    }
}
