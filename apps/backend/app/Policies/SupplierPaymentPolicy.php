<?php

namespace App\Policies;

use App\Models\SupplierPayment;
use App\Models\User;

class SupplierPaymentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('payments.view') || $user->role === 'admin';
    }

    public function view(User $user, SupplierPayment $supplierPayment): bool
    {
        if ($user->hasPermission('payments.view') || $user->role === 'admin') {
            return true;
        }

        return $user->organization_id === $supplierPayment->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('payments.create') || $user->role === 'admin' || $user->role === 'purchasing_officer';
    }

    public function update(User $user, SupplierPayment $supplierPayment): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $user->hasPermission('payments.update') && $user->organization_id === $supplierPayment->organization_id && in_array($supplierPayment->status, ['pending', 'processing']);
    }

    public function delete(User $user, SupplierPayment $supplierPayment): bool
    {
        return $user->role === 'admin' && in_array($supplierPayment->status, ['pending', 'failed']);
    }
}
