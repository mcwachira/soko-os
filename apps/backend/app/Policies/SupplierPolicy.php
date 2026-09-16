<?php

namespace App\Policies;

use App\Models\Supplier;
use App\Models\User;

class SupplierPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('suppliers.view') || $user->role === 'admin';
    }

    public function view(User $user, Supplier $supplier): bool
    {
        if ($user->hasPermission('suppliers.view') || $user->role === 'admin') {
            return true;
        }

        return $user->organization_id === $supplier->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('suppliers.create') || $user->role === 'admin' || $user->role === 'purchasing_officer';
    }

    public function update(User $user, Supplier $supplier): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $user->hasPermission('suppliers.update') && $user->organization_id === $supplier->organization_id;
    }

    public function delete(User $user, Supplier $supplier): bool
    {
        return $user->role === 'admin';
    }
}
