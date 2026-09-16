<?php

namespace Tests\Feature;

use App\Models\Business;
use App\Models\Organization;
use App\Models\Plan;
use App\Models\Role;
use App\Models\TenantMembership;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class InvitationTest extends TestCase
{
    use RefreshDatabase;

    private function createRole(string $slug, string $name, \App\Models\Organization $organization, array $permissions = []): \App\Models\Role
    {
        return \App\Models\Role::create([
            'id' => (string) Str::uuid(),
            'organization_id' => $organization->id,
            'name' => $name,
            'slug' => $slug,
            'description' => $name . ' role',
            'permissions' => $permissions,
        ]);
    }

    private function createMembership(\App\Models\User $user, \App\Models\Organization $organization, \App\Models\Role $role, string $status = 'active'): \App\Models\TenantMembership
    {
        $business = Business::factory()->create(['organization_id' => $organization->id]);

        return \App\Models\TenantMembership::create([
            'id' => (string) Str::uuid(),
            'organization_id' => $organization->id,
            'business_id' => $business->id,
            'user_id' => $user->id,
            'role_id' => $role->id,
            'status' => $status,
            'joined_at' => now(),
        ]);
    }

    private function createTenantOwner(\App\Models\Organization $organization): \App\Models\User
    {
        $role = $this->createRole('owner', 'Owner', $organization, ['*']);
        $business = Business::factory()->create(['organization_id' => $organization->id]);

        $user = User::factory()->create([
            'organization_id' => $organization->id,
            'business_id' => $business->id,
            'role' => 'owner',
            'permissions' => ['*'],
            'is_active' => true,
        ]);

        $this->createMembership($user, $organization, $role);

        return $user;
    }

    public function test_tenant_owner_can_invite_user(): void
    {
        $organization = Organization::factory()->create();
        $owner = $this->createTenantOwner($organization);

        Sanctum::actingAs($owner);

        $response = $this->postJson('/api/v1/invitations', [
            'email' => 'newuser@example.com',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'token',
                    'email',
                    'status',
                ],
            ])
            ->assertJsonPath('data.email', 'newuser@example.com')
            ->assertJsonPath('data.status', 'pending');

        $this->assertDatabaseHas('invitations', [
            'email' => 'newuser@example.com',
            'organization_id' => $organization->id,
            'status' => 'pending',
        ]);
    }

    public function test_invitation_token_works_for_acceptance(): void
    {
        $organization = Organization::factory()->create();
        $owner = $this->createTenantOwner($organization);

        Sanctum::actingAs($owner);

        $inviteeEmail = 'newuser@example.com';

        $this->postJson('/api/v1/invitations', [
            'email' => $inviteeEmail,
        ])->assertStatus(201);

        $invitation = \App\Models\Invitation::where('email', $inviteeEmail)->first();
        $this->assertNotNull($invitation);

        $this->postJson('/api/v1/invitations/accept', [
            'token' => $invitation->token,
        ])->assertStatus(200)
          ->assertJson(['message' => 'Invitation accepted']);

        $invitation->refresh();
        $this->assertEquals('accepted', $invitation->status);
        $this->assertNotNull($invitation->accepted_at);

        $newUser = User::where('email', $inviteeEmail)->first();
        $this->assertNotNull($newUser);

        $this->assertDatabaseHas('tenant_memberships', [
            'organization_id' => $organization->id,
            'user_id' => $newUser->id,
            'status' => 'active',
        ]);
    }

    public function test_expired_invitation_fails(): void
    {
        $organization = Organization::factory()->create();
        $owner = $this->createTenantOwner($organization);

        Sanctum::actingAs($owner);

        $response = $this->postJson('/api/v1/invitations', [
            'email' => 'newuser@example.com',
            'expires_at' => now()->subDay()->toDateTimeString(),
        ]);

        $response->assertStatus(422);
    }

    public function test_duplicate_invitation_fails(): void
    {
        $organization = Organization::factory()->create();
        $owner = $this->createTenantOwner($organization);

        Sanctum::actingAs($owner);

        $this->postJson('/api/v1/invitations', [
            'email' => 'newuser@example.com',
        ])->assertStatus(201);

        $response = $this->postJson('/api/v1/invitations', [
            'email' => 'newuser@example.com',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('message', 'The given data was invalid.');
    }
}
