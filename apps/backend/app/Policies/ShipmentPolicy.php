<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Shipment;

class ShipmentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('shipments.view') || $user->role === 'admin';
    }

    public function view(User $user, Shipment $shipment): bool
    {
        if ($user->role === 'admin') {
            return true;
        }
        return $user->hasPermission('shipments.view') && $user->organization_id === $shipment->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('shipments.create') || $user->role === 'admin';
    }

    public function update(User $user, Shipment $shipment): bool
    {
        if ($user->role === 'admin') {
            return true;
        }
        return $user->hasPermission('shipments.update') && $user->organization_id === $shipment->organization_id;
    }

    public function delete(User $user, Shipment $shipment): bool
    {
        return $user->role === 'admin';
    }
}
