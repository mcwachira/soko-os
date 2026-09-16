<?php

namespace App\Policies;

use App\Models\User;
use App\Models\PriceList;

class PriceListPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('price_lists.view') || $user->role === 'admin';
    }

    public function view(User $user, PriceList $priceList): bool
    {
        if ($user->role === 'admin') {
            return true;
        }
        return $user->hasPermission('price_lists.view') && $user->organization_id === $priceList->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('price_lists.create') || $user->role === 'admin';
    }

    public function update(User $user, PriceList $priceList): bool
    {
        if ($user->role === 'admin') {
            return true;
        }
        return $user->hasPermission('price_lists.update') && $user->organization_id === $priceList->organization_id;
    }

    public function delete(User $user, PriceList $priceList): bool
    {
        return $user->role === 'admin';
    }
}
