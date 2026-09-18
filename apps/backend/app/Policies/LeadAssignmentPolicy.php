<?php

namespace App\Policies;

use App\Models\LeadAssignment;
use App\Models\User;

class LeadAssignmentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('crm.lead_assignment.view') || $user->role === 'admin' || $user->role === 'sales_manager';
    }

    public function view(User $user, LeadAssignment $assignment): bool
    {
        if ($user->hasPermission('crm.lead_assignment.view') || $user->role === 'admin') {
            return true;
        }

        return $user->organization_id === $assignment->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('crm.lead_assignment.create') || $user->role === 'admin' || $user->role === 'sales_manager';
    }

    public function update(User $user, LeadAssignment $assignment): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $user->hasPermission('crm.lead_assignment.update') && $user->organization_id === $assignment->organization_id;
    }

    public function delete(User $user, LeadAssignment $assignment): bool
    {
        return $user->hasPermission('crm.lead_assignment.delete') || $user->role === 'admin';
    }
}
