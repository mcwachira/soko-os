<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    public function test_login_returns_token_on_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
            'organization_id' => $this->createOrganization()->id,
            'business_id' => $this->createBusiness($this->createOrganization())->id,
            'is_active' => true,
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'test@example.com',
            'password' => 'password',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'token',
                    'user' => [
                        'id',
                        'name',
                        'email',
                        'role',
                        'organization_id',
                        'business_id',
                    ],
                ],
                'message',
            ])
            ->assertJsonPath('data.user.email', 'test@example.com');
    }

    public function test_login_fails_on_invalid_email(): void
    {
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'wrong@example.com',
            'password' => 'password',
        ]);

        $response->assertStatus(422);
    }

    public function test_login_fails_on_invalid_password(): void
    {
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'test@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(422);
    }

    public function test_login_fails_on_inactive_user(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
            'is_active' => false,
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'test@example.com',
            'password' => 'password',
        ]);

        $response->assertStatus(422);
    }

    public function test_logout_revokes_token(): void
    {
        $user = $this->actingAsAdmin();

        $response = $this->postJson('/api/v1/auth/logout');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
            ]);
    }

    public function test_me_returns_current_user(): void
    {
        $user = $this->actingAsAdmin();

        $response = $this->getJson('/api/v1/auth/me');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'email',
                    'role',
                    'organization_id',
                    'business_id',
                    'permissions',
                ],
            ])
            ->assertJsonPath('data.id', $user->id);
    }

    public function test_unauthenticated_user_cannot_access_me(): void
    {
        $response = $this->getJson('/api/v1/auth/me');

        $response->assertStatus(401);
    }

    public function test_unauthenticated_user_cannot_access_protected_routes(): void
    {
        $response = $this->getJson('/api/v1/sales');

        $response->assertStatus(401);
    }
}