<?php

namespace App\Policies;

use App\Models\Product;
use App\Models\User;

class ProductPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('products.view') || $user->role === 'admin';
    }

    public function view(User $user, Product $product): bool
    {
        if ($user->hasPermission('products.view') || $user->role === 'admin') {
            return true;
        }

        // Users can view products in their organization
        return $user->organization_id === $product->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('products.create') || $user->role === 'admin' || $user->role === 'inventory_manager';
    }

    public function update(User $user, Product $product): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $user->hasPermission('products.update') && $user->organization_id === $product->organization_id;
    }

    public function delete(User $user, Product $product): bool
    {
        return $user->role === 'admin';
    }
}
