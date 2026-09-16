<?php

namespace App\Policies;

use App\Models\PurchaseOrder;
use App\Models\User;

class PurchaseOrderPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('purchase_orders.view') || $user->role === 'admin';
    }

    public function view(User $user, PurchaseOrder $purchaseOrder): bool
    {
        if ($user->hasPermission('purchase_orders.view') || $user->role === 'admin') {
            return true;
        }

        return $user->organization_id === $purchaseOrder->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('purchase_orders.create') || $user->role === 'admin' || $user->role === 'purchasing_officer';
    }

    public function update(User $user, PurchaseOrder $purchaseOrder): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $user->hasPermission('purchase_orders.update') && $user->organization_id === $purchaseOrder->organization_id && $purchaseOrder->status === 'draft';
    }

    public function delete(User $user, PurchaseOrder $purchaseOrder): bool
    {
        return $user->role === 'admin' && $purchaseOrder->status === 'draft';
    }

    public function approve(User $user, PurchaseOrder $purchaseOrder): bool
    {
        return $user->hasPermission('purchase_orders.approve') || $user->role === 'admin' || $user->role === 'manager';
    }

    public function cancel(User $user, PurchaseOrder $purchaseOrder): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $user->hasPermission('purchase_orders.cancel') && in_array($purchaseOrder->status, ['draft', 'approved', 'partial_received']);
    }
}
