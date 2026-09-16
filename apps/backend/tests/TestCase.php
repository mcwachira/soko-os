<?php

namespace Tests;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Laravel\Sanctum\Sanctum;

abstract class TestCase extends BaseTestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
    }

    protected function actingAsAdmin(): \App\Models\User
    {
        $user = \App\Models\User::factory()->create([
            'role' => 'admin',
            'permissions' => ['*'],
        ]);
        Sanctum::actingAs($user);
        return $user;
    }

    protected function actingAsCashier(): \App\Models\User
    {
        $user = \App\Models\User::factory()->create([
            'role' => 'cashier',
            'permissions' => ['sales.create', 'sales.view', 'products.view', 'customers.view'],
        ]);
        Sanctum::actingAs($user);
        return $user;
    }

    protected function actingAsManager(): \App\Models\User
    {
        $user = \App\Models\User::factory()->create([
            'role' => 'manager',
            'permissions' => ['sales.*', 'products.*', 'customers.*', 'inventory.*', 'reports.*'],
        ]);
        Sanctum::actingAs($user);
        return $user;
    }

    protected function createOrganization(array $attributes = []): \App\Models\Organization
    {
        return \App\Models\Organization::factory()->create($attributes);
    }

    protected function createBusiness(\App\Models\Organization $organization, array $attributes = []): \App\Models\Business
    {
        return \App\Models\Business::factory()->create(array_merge(['organization_id' => $organization->id], $attributes));
    }

    protected function createBranch(\App\Models\Organization $organization, \App\Models\Business $business, array $attributes = []): \App\Models\Branch
    {
        return \App\Models\Branch::factory()->create(array_merge([
            'organization_id' => $organization->id,
            'business_id' => $business->id,
        ], $attributes));
    }

    protected function createTerminal(\App\Models\Branch $branch, array $attributes = []): \App\Models\Terminal
    {
        return \App\Models\Terminal::factory()->create(array_merge([
            'organization_id' => $branch->organization_id,
            'business_id' => $branch->business_id,
            'branch_id' => $branch->id,
        ], $attributes));
    }

    protected function actingAsSuperAdmin(): \App\Models\User
    {
        $user = \App\Models\User::factory()->create([
            'role' => 'super-admin',
            'permissions' => ['*'],
        ]);
        Sanctum::actingAs($user);
        return $user;
    }
}