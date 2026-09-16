<?php

namespace App\Policies;

use App\Models\Payment;
use App\Models\User;

class PaymentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('sales.view') || $user->role === 'admin';
    }

    public function view(User $user, Payment $payment): bool
    {
        if ($user->hasPermission('sales.view') || $user->role === 'admin') {
            return true;
        }

        return $user->branch_id === $payment->sale->branch_id;
    }
}
