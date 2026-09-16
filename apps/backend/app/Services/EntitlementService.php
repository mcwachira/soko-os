<?php

namespace App\Services;

use App\Models\Organization;
use App\Models\Subscription;
use App\Models\User;

class EntitlementService
{
    public function getTenantEntitlements(Organization $organization): array
    {
        $subscription = $organization->subscriptions()
            ->whereIn('status', ['active', 'trial', 'past_due'])
            ->latest()
            ->first();

        if (! $subscription) {
            return [];
        }

        if (! $subscription->canAccessProducts()) {
            return [];
        }

        return $subscription->getEnabledProductKeys();
    }

    public function tenantHasProduct(Organization $organization, string $productKey): bool
    {
        $entitlements = $this->getTenantEntitlements($organization);

        return in_array(strtolower($productKey), array_map('strtolower', $entitlements));
    }

    public function userCanAccessProduct(User $user, Organization $organization, string $productKey): bool
    {
        if (! $this->tenantHasProduct($organization, $productKey)) {
            return false;
        }

        $permission = strtolower($productKey) . '.access';

        return $user->hasPermission($permission) || $user->isSuperAdmin();
    }

    public function getSubscription(Organization $organization): ?Subscription
    {
        return $organization->subscriptions()
            ->whereIn('status', ['active', 'trial', 'past_due', 'suspended', 'cancelled'])
            ->latest()
            ->first();
    }

    public function getSubscriptionStatus(Organization $organization): ?string
    {
        $subscription = $this->getSubscription($organization);

        return $subscription ? $subscription->status : null;
    }

    public function isSubscriptionActive(Organization $organization): bool
    {
        $subscription = $this->getSubscription($organization);

        return $subscription ? $subscription->isActive() || $subscription->canAccessProducts() : false;
    }
}
