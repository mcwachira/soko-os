<?php

namespace Tests\Feature;

use Tests\TestCase;

class HealthTest extends TestCase
{
    public function test_health_check_returns_ok_status(): void
    {
        $response = $this->getJson('/api/v1/health');

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'ok',
                'system' => 'Soko-OS Core API',
            ]);
    }
}
