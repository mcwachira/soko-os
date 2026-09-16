<?php

namespace App\Policies;

use App\Models\Cart;
use App\Models\User;

class CartPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Cart $cart): bool
    {
        return $user->organization_id === $cart->organization_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Cart $cart): bool
    {
        return $user->organization_id === $cart->organization_id;
    }

    public function delete(User $user, Cart $cart): bool
    {
        return $user->organization_id === $cart->organization_id;
    }
}
