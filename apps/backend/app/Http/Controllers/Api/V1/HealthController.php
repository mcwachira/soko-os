<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

class HealthController extends Controller
{
    public function index(): JsonResponse
    {
        $database = $this->checkDatabase();
        $redis = app()->environment('testing')
            ? ['status' => 'healthy', 'note' => 'skipped in testing']
            : $this->checkRedis();

        $healthy = $database['status'] === 'healthy' && $redis['status'] === 'healthy';

        return response()->json([
            'status' => $healthy ? 'ok' : 'degraded',
            'system' => 'Soko-OS Core API',
            'timestamp' => now()->toIso8601String(),
            'services' => [
                'database' => $database,
                'redis' => $redis,
                'tax_adapter' => [
                    'status' => 'ready',
                    'note' => 'KRA eTIMS adapter present; live submission requires credentials',
                ],
                'sync_engine' => [
                    'status' => 'ready',
                ],
            ],
        ], $healthy ? 200 : 503);
    }

    public function database(): JsonResponse
    {
        $result = $this->checkDatabase();

        return response()->json($result, $result['status'] === 'healthy' ? 200 : 503);
    }

    public function redis(): JsonResponse
    {
        $result = $this->checkRedis();

        return response()->json($result, $result['status'] === 'healthy' ? 200 : 503);
    }

    private function checkDatabase(): array
    {
        try {
            DB::connection()->getPdo();
            DB::select('select 1');

            return [
                'status' => 'healthy',
                'driver' => config('database.default'),
            ];
        } catch (\Throwable $e) {
            return [
                'status' => 'unhealthy',
                'error' => 'Database connection failed',
            ];
        }
    }

    private function checkRedis(): array
    {
        try {
            $pong = Redis::connection()->ping();

            return [
                'status' => ($pong === true || $pong === 'PONG' || $pong === '+PONG') ? 'healthy' : 'unhealthy',
            ];
        } catch (\Throwable $e) {
            return [
                'status' => 'unhealthy',
                'error' => 'Redis connection failed',
            ];
        }
    }
}
