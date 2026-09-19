<?php

namespace App\Policies;

use App\Models\Lead;
use App\Models\User;

class LeadPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('crm.leads.view') || $user->role === 'admin' || $user->role === 'sales_rep' || $user->role === 'sales_manager';
    }

    public function view(User $user, Lead $lead): bool
    {
        if ($user->hasPermission('crm.leads.view') || $user->role === 'admin') {
            return true;
        }

        return $user->organization_id === $lead->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('crm.leads.create') || $user->role === 'admin' || $user->role === 'sales_rep' || $user->role === 'sales_manager';
    }

    public function update(User $user, Lead $lead): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $user->hasPermission('crm.leads.update') && $user->organization_id === $lead->organization_id;
    }

    public function delete(User $user, Lead $lead): bool
    {
        return $user->hasPermission('crm.leads.delete') || $user->role === 'admin';
    }

    public function convert(User $user, Lead $lead): bool
    {
        return $user->hasPermission('crm.leads.convert') || $user->role === 'admin' || $user->role === 'sales_manager';
    }

    public function assign(User $user, Lead $lead): bool
    {
        return $user->hasPermission('crm.leads.assign') || $user->role === 'admin' || $user->role === 'sales_manager';
    }
}
