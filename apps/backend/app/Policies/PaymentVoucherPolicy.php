<?php

namespace App\Policies;

use App\Models\PaymentVoucher;
use App\Models\User;

class PaymentVoucherPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('payment_vouchers.view') || $user->role === 'admin';
    }

    public function view(User $user, PaymentVoucher $paymentVoucher): bool
    {
        if ($user->hasPermission('payment_vouchers.view') || $user->role === 'admin') {
            return true;
        }

        return $user->organization_id === $paymentVoucher->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('payment_vouchers.create') || $user->role === 'admin' || $user->role === 'purchasing_officer';
    }

    public function update(User $user, PaymentVoucher $paymentVoucher): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $user->hasPermission('payment_vouchers.update') && $user->organization_id === $paymentVoucher->organization_id && $paymentVoucher->status === 'draft';
    }

    public function delete(User $user, PaymentVoucher $paymentVoucher): bool
    {
        return $user->role === 'admin' && $paymentVoucher->status === 'draft';
    }

    public function approve(User $user, PaymentVoucher $paymentVoucher): bool
    {
        return $user->hasPermission('payment_vouchers.approve') || $user->role === 'admin' || $user->role === 'manager';
    }
}
