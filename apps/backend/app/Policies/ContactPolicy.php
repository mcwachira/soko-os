<?php

namespace App\Policies;

use App\Models\Contact;
use App\Models\User;

class ContactPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('crm.contacts.view') || $user->role === 'admin' || $user->role === 'sales_rep' || $user->role === 'account_manager';
    }

    public function view(User $user, Contact $contact): bool
    {
        if ($user->hasPermission('crm.contacts.view') || $user->role === 'admin') {
            return true;
        }

        return $user->organization_id === $contact->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('crm.contacts.create') || $user->role === 'admin' || $user->role === 'sales_rep' || $user->role === 'account_manager';
    }

    public function update(User $user, Contact $contact): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $user->hasPermission('crm.contacts.update') && $user->organization_id === $contact->organization_id;
    }

    public function delete(User $user, Contact $contact): bool
    {
        return $user->hasPermission('crm.contacts.delete') || $user->role === 'admin';
    }
}
