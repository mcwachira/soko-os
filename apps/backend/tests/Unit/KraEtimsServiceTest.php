<?php

namespace Tests\Unit;

use App\Services\Tax\KraEtimsService;
use Tests\TestCase;

class KraEtimsServiceTest extends TestCase
{
    public function test_credentials_are_not_considered_present_for_placeholders(): void
    {
        config([
            'tax.kra.client_id' => 'sbx_client_id_placeholder',
            'tax.kra.client_secret' => 'sbx_client_secret_placeholder',
        ]);

        $service = new KraEtimsService;

        $this->assertFalse($service->hasCredentials());
    }
}
