<?php

namespace App\Policies;

use App\Models\SupplierInvoice;
use App\Models\User;

class SupplierInvoicePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('invoices.view') || $user->role === 'admin';
    }

    public function view(User $user, SupplierInvoice $supplierInvoice): bool
    {
        if ($user->hasPermission('invoices.view') || $user->role === 'admin') {
            return true;
        }

        return $user->organization_id === $supplierInvoice->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('invoices.create') || $user->role === 'admin' || $user->role === 'purchasing_officer';
    }

    public function update(User $user, SupplierInvoice $supplierInvoice): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $user->hasPermission('invoices.update') && $user->organization_id === $supplierInvoice->organization_id && $supplierInvoice->status === 'draft';
    }

    public function delete(User $user, SupplierInvoice $supplierInvoice): bool
    {
        return $user->role === 'admin' && $supplierInvoice->status === 'draft';
    }
}
