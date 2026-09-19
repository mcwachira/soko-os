<?php

namespace App\Policies;

use App\Models\RetainerInvoice;
use App\Models\User;

class RetainerInvoicePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, RetainerInvoice $retainer): bool
    {
        return $user->organization_id === $retainer->organization_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, RetainerInvoice $retainer): bool
    {
        return $user->organization_id === $retainer->organization_id;
    }

    public function delete(User $user, RetainerInvoice $retainer): bool
    {
        return $user->organization_id === $retainer->organization_id;
    }
}
