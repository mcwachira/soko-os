<?php

namespace App\Policies;

use App\Models\User;
use App\Models\ProductVariant;

class ProductVariantPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('products.view') || $user->role === 'admin';
    }

    public function view(User $user, ProductVariant $variant): bool
    {
        if ($user->role === 'admin') {
            return true;
        }
        return $user->hasPermission('products.view') && $user->organization_id === $variant->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('products.create') || $user->role === 'admin';
    }

    public function update(User $user, ProductVariant $variant): bool
    {
        if ($user->role === 'admin') {
            return true;
        }
        return $user->hasPermission('products.update') && $user->organization_id === $variant->organization_id;
    }

    public function delete(User $user, ProductVariant $variant): bool
    {
        return $user->role === 'admin';
    }
}
