<?php

namespace App\Policies;

use App\Models\PriceBook;
use App\Models\User;

class PriceBookPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('crm.price_books.view') || $user->role === 'admin' || $user->role === 'sales_rep' || $user->role === 'sales_manager';
    }

    public function view(User $user, PriceBook $priceBook): bool
    {
        if ($user->hasPermission('crm.price_books.view') || $user->role === 'admin') {
            return true;
        }

        return $user->organization_id === $priceBook->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('crm.price_books.create') || $user->role === 'admin' || $user->role === 'sales_manager';
    }

    public function update(User $user, PriceBook $priceBook): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $user->hasPermission('crm.price_books.update') && $user->organization_id === $priceBook->organization_id;
    }

    public function delete(User $user, PriceBook $priceBook): bool
    {
        return $user->hasPermission('crm.price_books.delete') || $user->role === 'admin';
    }
}
