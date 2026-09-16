<?php

namespace App\Policies;

use App\Models\Category;
use App\Models\User;

class CategoryPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('categories.view') || $user->role === 'admin';
    }

    public function view(User $user, Category $category): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $user->organization_id === $category->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('categories.create') || $user->role === 'admin' || $user->role === 'inventory_manager';
    }

    public function update(User $user, Category $category): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $user->hasPermission('categories.update') && $user->organization_id === $category->organization_id;
    }

    public function delete(User $user, Category $category): bool
    {
        return $user->role === 'admin';
    }
}
