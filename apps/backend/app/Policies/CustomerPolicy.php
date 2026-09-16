<?php

namespace App\Policies;

use App\Models\Customer;
use App\Models\User;

class CustomerPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('customers.view') || $user->role === 'admin';
    }

    public function view(User $user, Customer $customer): bool
    {
        if ($user->hasPermission('customers.view') || $user->role === 'admin') {
            return true;
        }

        return $user->organization_id === $customer->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('customers.create') || $user->role === 'admin' || $user->role === 'cashier';
    }

    public function update(User $user, Customer $customer): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $user->hasPermission('customers.update') && $user->organization_id === $customer->organization_id;
    }

    public function delete(User $user, Customer $customer): bool
    {
        return $user->role === 'admin';
    }
}
