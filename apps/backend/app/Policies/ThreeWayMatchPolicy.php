<?php

namespace App\Policies;

use App\Models\ThreeWayMatch;
use App\Models\User;

class ThreeWayMatchPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('matches.view') || $user->role === 'admin';
    }

    public function view(User $user, ThreeWayMatch $threeWayMatch): bool
    {
        if ($user->hasPermission('matches.view') || $user->role === 'admin') {
            return true;
        }

        return $user->organization_id === $threeWayMatch->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('matches.create') || $user->role === 'admin' || $user->role === 'purchasing_officer';
    }

    public function update(User $user, ThreeWayMatch $threeWayMatch): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $user->hasPermission('matches.update') && $user->organization_id === $threeWayMatch->organization_id && in_array($threeWayMatch->status, ['pending']);
    }

    public function delete(User $user, ThreeWayMatch $threeWayMatch): bool
    {
        return $user->role === 'admin' && $threeWayMatch->status === 'pending';
    }
}
