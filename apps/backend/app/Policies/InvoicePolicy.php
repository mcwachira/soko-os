<?php

namespace App\Policies;

use App\Models\Invoice;
use App\Models\User;

class InvoicePolicy
{
    public function before(User $user, string $ability): ?bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermission('invoices.view') || $user->hasPermission('books.access');
    }

    public function view(User $user, Invoice $invoice): bool
    {
        if ($user->hasPermission('invoices.view') || $user->hasPermission('books.access')) {
            return $user->organization_id === $invoice->organization_id;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('invoices.create') || $user->hasPermission('books.access');
    }

    public function update(User $user, Invoice $invoice): bool
    {
        return $user->hasPermission('invoices.update')
            && $user->organization_id === $invoice->organization_id;
    }

    public function delete(User $user, Invoice $invoice): bool
    {
        return $user->hasPermission('invoices.delete')
            && $user->organization_id === $invoice->organization_id;
    }
}
