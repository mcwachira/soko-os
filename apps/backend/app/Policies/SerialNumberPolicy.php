<?php

namespace App\Policies;

use App\Models\User;
use App\Models\SerialNumber;

class SerialNumberPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('serial_numbers.view') || $user->role === 'admin';
    }

    public function view(User $user, SerialNumber $serialNumber): bool
    {
        if ($user->role === 'admin') {
            return true;
        }
        return $user->hasPermission('serial_numbers.view') && $user->organization_id === $serialNumber->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('serial_numbers.create') || $user->role === 'admin';
    }

    public function update(User $user, SerialNumber $serialNumber): bool
    {
        if ($user->role === 'admin') {
            return true;
        }
        return $user->hasPermission('serial_numbers.update') && $user->organization_id === $serialNumber->organization_id;
    }

    public function delete(User $user, SerialNumber $serialNumber): bool
    {
        return $user->role === 'admin';
    }
}
