<?php

namespace App\Policies;

use App\Models\PaymentReconciliation;
use App\Models\User;

class PaymentReconciliationPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('reconciliations.view') || $user->role === 'admin';
    }

    public function view(User $user, PaymentReconciliation $paymentReconciliation): bool
    {
        if ($user->hasPermission('reconciliations.view') || $user->role === 'admin') {
            return true;
        }

        return $user->organization_id === $paymentReconciliation->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('reconciliations.create') || $user->role === 'admin' || $user->role === 'purchasing_officer';
    }

    public function update(User $user, PaymentReconciliation $paymentReconciliation): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $user->hasPermission('reconciliations.update') && $user->organization_id === $paymentReconciliation->organization_id && $paymentReconciliation->status === 'pending';
    }

    public function delete(User $user, PaymentReconciliation $paymentReconciliation): bool
    {
        return $user->role === 'admin' && $paymentReconciliation->status === 'pending';
    }
}
