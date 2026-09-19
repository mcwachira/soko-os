<?php

namespace App\Policies;

use App\Models\LeadScoringRule;
use App\Models\User;

class LeadScoringRulePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('crm.lead_scoring.view') || $user->role === 'admin' || $user->role === 'sales_manager';
    }

    public function view(User $user, LeadScoringRule $rule): bool
    {
        if ($user->hasPermission('crm.lead_scoring.view') || $user->role === 'admin') {
            return true;
        }

        return $user->organization_id === $rule->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('crm.lead_scoring.create') || $user->role === 'admin' || $user->role === 'sales_manager';
    }

    public function update(User $user, LeadScoringRule $rule): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $user->hasPermission('crm.lead_scoring.update') && $user->organization_id === $rule->organization_id;
    }

    public function delete(User $user, LeadScoringRule $rule): bool
    {
        return $user->hasPermission('crm.lead_scoring.delete') || $user->role === 'admin';
    }
}
