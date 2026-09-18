<?php

namespace App\Policies;

use App\Models\Campaign;
use App\Models\User;

class CampaignPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('crm.campaigns.view') || $user->role === 'admin' || $user->role === 'marketing';
    }

    public function view(User $user, Campaign $campaign): bool
    {
        if ($user->hasPermission('crm.campaigns.view') || $user->role === 'admin') {
            return true;
        }

        return $user->organization_id === $campaign->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('crm.campaigns.create') || $user->role === 'admin' || $user->role === 'marketing';
    }

    public function update(User $user, Campaign $campaign): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $user->hasPermission('crm.campaigns.update') && $user->organization_id === $campaign->organization_id;
    }

    public function delete(User $user, Campaign $campaign): bool
    {
        return $user->hasPermission('crm.campaigns.delete') || $user->role === 'admin';
    }
}
