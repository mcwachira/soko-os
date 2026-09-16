<?php

namespace App\Policies;

use App\Models\Sale;
use App\Models\User;

class SalePolicy
{
    /**
     * Determine whether the user can view any sales.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('sales.view') || $user->role === 'admin';
    }

    /**
     * Determine whether the user can view the sale.
     */
    public function view(User $user, Sale $sale): bool
    {
        if ($user->hasPermission('sales.view') || $user->role === 'admin') {
            return true;
        }

        // Users can only view sales from their branch
        return $user->branch_id === $sale->branch_id;
    }

    /**
     * Determine whether the user can create sales.
     */
    public function create(User $user): bool
    {
        return $user->hasPermission('sales.create') || $user->role === 'admin' || $user->role === 'cashier';
    }

    /**
     * Determine whether the user can update the sale.
     */
    public function update(User $user, Sale $sale): bool
    {
        // Only admins can update completed sales
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can delete the sale.
     */
    public function delete(User $user, Sale $sale): bool
    {
        // Sales cannot be deleted, only cancelled/refunded
        return false;
    }

    /**
     * Determine whether the user can refund the sale.
     */
    public function refund(User $user, Sale $sale): bool
    {
        return $user->hasPermission('sales.refund') || $user->role === 'admin' || $user->role === 'supervisor';
    }
}
