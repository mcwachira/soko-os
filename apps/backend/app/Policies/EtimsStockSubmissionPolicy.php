<?php

namespace App\Policies;

use App\Models\User;
use App\Models\EtimsStockSubmission;

class EtimsStockSubmissionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('etims.view') || $user->role === 'admin';
    }

    public function view(User $user, EtimsStockSubmission $submission): bool
    {
        if ($user->role === 'admin') {
            return true;
        }
        return $user->hasPermission('etims.view') && $user->organization_id === $submission->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('etims.submit') || $user->role === 'admin';
    }

    public function update(User $user, EtimsStockSubmission $submission): bool
    {
        if ($user->role === 'admin') {
            return true;
        }
        return $user->hasPermission('etims.retry') && $user->organization_id === $submission->organization_id;
    }

    public function delete(User $user, EtimsStockSubmission $submission): bool
    {
        return $user->role === 'admin';
    }
}
