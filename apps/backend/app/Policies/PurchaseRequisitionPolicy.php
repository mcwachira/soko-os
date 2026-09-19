<?php

namespace App\Policies;

use App\Models\PurchaseRequisition;
use App\Models\User;

class PurchaseRequisitionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('purchase_requisitions.view') || $user->role === 'admin';
    }

    public function view(User $user, PurchaseRequisition $purchaseRequisition): bool
    {
        if ($user->hasPermission('purchase_requisitions.view') || $user->role === 'admin') {
            return true;
        }

        return $user->organization_id === $purchaseRequisition->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('purchase_requisitions.create') || $user->role === 'admin' || $user->role === 'purchasing_officer';
    }

    public function update(User $user, PurchaseRequisition $purchaseRequisition): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $user->hasPermission('purchase_requisitions.update') && $user->organization_id === $purchaseRequisition->organization_id && $purchaseRequisition->status === 'draft';
    }

    public function delete(User $user, PurchaseRequisition $purchaseRequisition): bool
    {
        return $user->role === 'admin' && $purchaseRequisition->status === 'draft';
    }

    public function approve(User $user, PurchaseRequisition $purchaseRequisition): bool
    {
        return $user->hasPermission('purchase_requisitions.approve') || $user->role === 'admin' || $user->role === 'manager';
    }
}
