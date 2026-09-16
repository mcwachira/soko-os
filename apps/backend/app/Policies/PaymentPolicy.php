<?php

namespace App\Policies;

use App\Models\Payment;
use App\Models\User;

class PaymentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('sales.view') || $user->hasPermission('books.payments.view') || $user->role === 'admin';
    }

    public function view(User $user, Payment $payment): bool
    {
        if ($user->hasPermission('sales.view') || $user->hasPermission('books.payments.view') || $user->role === 'admin') {
            return true;
        }

        return $user->branch_id === optional($payment->sale)->branch_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('sales.create') || $user->hasPermission('books.payments.create') || $user->role === 'admin';
    }

    public function update(User $user, Payment $payment): bool
    {
        if ($user->hasPermission('sales.update') || $user->hasPermission('books.payments.update') || $user->role === 'admin') {
            return true;
        }

        return $user->branch_id === optional($payment->sale)->branch_id;
    }

    public function delete(User $user, Payment $payment): bool
    {
        if ($user->hasPermission('sales.delete') || $user->hasPermission('books.payments.delete') || $user->role === 'admin') {
            return true;
        }

        return $user->branch_id === optional($payment->sale)->branch_id;
    }
}
