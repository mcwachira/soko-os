<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

class MetricsController extends Controller
{
    public function index(): JsonResponse
    {
        $metrics = [];

        // HTTP metrics
        $metrics[] = $this->formatMetric('http_requests_total', 'counter', [
            ['labels' => ['method' => 'GET', 'endpoint' => '/api/v1/health', 'status' => '200'], 'value' => Cache::get('metric:http:GET:/api/v1/health:200', 0)],
            ['labels' => ['method' => 'POST', 'endpoint' => '/api/v1/sales', 'status' => '201'], 'value' => Cache::get('metric:http:POST:/api/v1/sales:201', 0)],
            ['labels' => ['method' => 'POST', 'endpoint' => '/api/v1/sync/push', 'status' => '200'], 'value' => Cache::get('metric:http:POST:/api/v1/sync/push:200', 0)],
        ]);

        // HTTP request duration
        $metrics[] = $this->formatMetric('http_request_duration_seconds', 'histogram', [
            ['labels' => ['method' => 'GET', 'endpoint' => '/api/v1/health'], 'value' => Cache::get('metric:duration:GET:/api/v1/health', 0)],
            ['labels' => ['method' => 'POST', 'endpoint' => '/api/v1/sales'], 'value' => Cache::get('metric:duration:POST:/api/v1/sales', 0)],
        ]);

        // Queue metrics
        $queueSize = $this->getQueueSize();
        $metrics[] = $this->formatMetric('queue_jobs_pending', 'gauge', [
            ['labels' => ['queue' => 'default'], 'value' => $queueSize],
        ]);

        $failedJobs = $this->getFailedJobsCount();
        $metrics[] = $this->formatMetric('queue_jobs_failed_total', 'counter', [
            ['labels' => ['queue' => 'default'], 'value' => $failedJobs],
        ]);

        // Sync metrics
        $metrics[] = $this->formatMetric('sync_operations_total', 'counter', [
            ['labels' => ['entity' => 'products', 'status' => 'accepted'], 'value' => Cache::get('metric:sync:products:accepted', 0)],
            ['labels' => ['entity' => 'sales', 'status' => 'accepted'], 'value' => Cache::get('metric:sync:sales:accepted', 0)],
            ['labels' => ['entity' => 'customers', 'status' => 'accepted'], 'value' => Cache::get('metric:sync:customers:accepted', 0)],
            ['labels' => ['entity' => 'products', 'status' => 'conflict'], 'value' => Cache::get('metric:sync:products:conflict', 0)],
        ]);

        // Tax metrics
        $metrics[] = $this->formatMetric('tax_submissions_total', 'counter', [
            ['labels' => ['authority' => 'KRA', 'status' => 'accepted'], 'value' => Cache::get('metric:tax:KRA:accepted', 0)],
            ['labels' => ['authority' => 'KRA', 'status' => 'failed'], 'value' => Cache::get('metric:tax:KRA:failed', 0)],
        ]);

        // Payment metrics
        $metrics[] = $this->formatMetric('payment_attempts_total', 'counter', [
            ['labels' => ['method' => 'cash', 'status' => 'completed'], 'value' => Cache::get('metric:payment:cash:completed', 0)],
            ['labels' => ['method' => 'mpesa', 'status' => 'completed'], 'value' => Cache::get('metric:payment:mpesa:completed', 0)],
            ['labels' => ['method' => 'card', 'status' => 'completed'], 'value' => Cache::get('metric:payment:card:completed', 0)],
        ]);

        // Accounting metrics
        $metrics[] = $this->formatMetric('accounting_sync_total', 'counter', [
            ['labels' => ['provider' => 'zoho_books', 'status' => 'synced'], 'value' => Cache::get('metric:accounting:zoho_books:synced', 0)],
            ['labels' => ['provider' => 'quickbooks', 'status' => 'synced'], 'value' => Cache::get('metric:accounting:quickbooks:synced', 0)],
            ['labels' => ['provider' => 'xero', 'status' => 'synced'], 'value' => Cache::get('metric:accounting:xero:synced', 0)],
        ]);

        // Database metrics
        $dbConnections = $this->getDbConnections();
        $metrics[] = $this->formatMetric('database_connections_active', 'gauge', [
            ['labels' => ['database' => 'pgsql'], 'value' => $dbConnections],
        ]);

        // Redis metrics
        $redisInfo = $this->getRedisInfo();
        $metrics[] = $this->formatMetric('redis_connected_clients', 'gauge', [
            ['labels' => [], 'value' => $redisInfo['connected_clients'] ?? 0],
        ]);
        $metrics[] = $this->formatMetric('redis_used_memory_bytes', 'gauge', [
            ['labels' => [], 'value' => $redisInfo['used_memory'] ?? 0],
        ]);

        // Sale metrics
        $metrics[] = $this->formatMetric('sales_total', 'counter', [
            ['labels' => ['status' => 'completed'], 'value' => Cache::get('metric:sales:completed', 0)],
        ]);

        $metrics[] = $this->formatMetric('sales_amount_minor_total', 'counter', [
            ['labels' => ['currency' => 'KES'], 'value' => Cache::get('metric:sales:amount_minor:KES', 0)],
        ]);

        return response()->json([
            'metrics' => $metrics,
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    public function prometheus(): Response
    {
        $lines = [];

        // HTTP metrics
        $lines[] = '# HELP http_requests_total Total HTTP requests';
        $lines[] = '# TYPE http_requests_total counter';
        $lines[] = 'http_requests_total{method="GET",endpoint="/api/v1/health",status="200"} '.Cache::get('metric:http:GET:/api/v1/health:200', 0);
        $lines[] = 'http_requests_total{method="POST",endpoint="/api/v1/sales",status="201"} '.Cache::get('metric:http:POST:/api/v1/sales:201', 0);
        $lines[] = 'http_requests_total{method="POST",endpoint="/api/v1/sync/push",status="200"} '.Cache::get('metric:http:POST:/api/v1/sync/push:200', 0);

        $lines[] = '# HELP http_request_duration_seconds HTTP request duration in seconds';
        $lines[] = '# TYPE http_request_duration_seconds histogram';
        $lines[] = 'http_request_duration_seconds{method="GET",endpoint="/api/v1/health"} '.Cache::get('metric:duration:GET:/api/v1/health', 0);
        $lines[] = 'http_request_duration_seconds{method="POST",endpoint="/api/v1/sales"} '.Cache::get('metric:duration:POST:/api/v1/sales', 0);

        // Queue metrics
        $lines[] = '# HELP queue_jobs_pending Pending jobs in queue';
        $lines[] = '# TYPE queue_jobs_pending gauge';
        $lines[] = 'queue_jobs_pending{queue="default"} '.$this->getQueueSize();

        $lines[] = '# HELP queue_jobs_failed_total Total failed jobs';
        $lines[] = '# TYPE queue_jobs_failed_total counter';
        $lines[] = 'queue_jobs_failed_total{queue="default"} '.$this->getFailedJobsCount();

        // Sync metrics
        $lines[] = '# HELP sync_operations_total Total sync operations';
        $lines[] = '# TYPE sync_operations_total counter';
        $lines[] = 'sync_operations_total{entity="products",status="accepted"} '.Cache::get('metric:sync:products:accepted', 0);
        $lines[] = 'sync_operations_total{entity="sales",status="accepted"} '.Cache::get('metric:sync:sales:accepted', 0);
        $lines[] = 'sync_operations_total{entity="customers",status="accepted"} '.Cache::get('metric:sync:customers:accepted', 0);
        $lines[] = 'sync_operations_total{entity="products",status="conflict"} '.Cache::get('metric:sync:products:conflict', 0);

        // Tax metrics
        $lines[] = '# HELP tax_submissions_total Total tax submissions';
        $lines[] = '# TYPE tax_submissions_total counter';
        $lines[] = 'tax_submissions_total{authority="KRA",status="accepted"} '.Cache::get('metric:tax:KRA:accepted', 0);
        $lines[] = 'tax_submissions_total{authority="KRA",status="failed"} '.Cache::get('metric:tax:KRA:failed', 0);

        // Payment metrics
        $lines[] = '# HELP payment_attempts_total Total payment attempts';
        $lines[] = '# TYPE payment_attempts_total counter';
        $lines[] = 'payment_attempts_total{method="cash",status="completed"} '.Cache::get('metric:payment:cash:completed', 0);
        $lines[] = 'payment_attempts_total{method="mpesa",status="completed"} '.Cache::get('metric:payment:mpesa:completed', 0);
        $lines[] = 'payment_attempts_total{method="card",status="completed"} '.Cache::get('metric:payment:card:completed', 0);

        // Database metrics
        $lines[] = '# HELP database_connections_active Active database connections';
        $lines[] = '# TYPE database_connections_active gauge';
        $lines[] = 'database_connections_active{database="pgsql"} '.$this->getDbConnections();

        // Redis metrics
        $redisInfo = $this->getRedisInfo();
        $lines[] = '# HELP redis_connected_clients Connected Redis clients';
        $lines[] = '# TYPE redis_connected_clients gauge';
        $lines[] = 'redis_connected_clients '.($redisInfo['connected_clients'] ?? 0);
        $lines[] = '# HELP redis_used_memory_bytes Redis used memory in bytes';
        $lines[] = '# TYPE redis_used_memory_bytes gauge';
        $lines[] = 'redis_used_memory_bytes '.($redisInfo['used_memory'] ?? 0);

        // Sale metrics
        $lines[] = '# HELP sales_total Total sales';
        $lines[] = '# TYPE sales_total counter';
        $lines[] = 'sales_total{status="completed"} '.Cache::get('metric:sales:completed', 0);

        $lines[] = '# HELP sales_amount_minor_total Total sales amount in minor units';
        $lines[] = '# TYPE sales_amount_minor_total counter';
        $lines[] = 'sales_amount_minor_total{currency="KES"} '.Cache::get('metric:sales:amount_minor:KES', 0);

        return response(implode("\n", $lines)."\n")
            ->header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
    }

    private function formatMetric(string $name, string $type, array $samples): array
    {
        return [
            'name' => $name,
            'type' => $type,
            'samples' => $samples,
        ];
    }

    private function getQueueSize(): int
    {
        try {
            $queue = DB::table('jobs')->count();

            return (int) $queue;
        } catch (\Throwable) {
            return 0;
        }
    }

    private function getFailedJobsCount(): int
    {
        try {
            $failed = DB::table('failed_jobs')->count();

            return (int) $failed;
        } catch (\Throwable) {
            return 0;
        }
    }

    private function getDbConnections(): int
    {
        try {
            $result = DB::select('SELECT count(*) as count FROM pg_stat_activity WHERE state = "active" AND datname = current_database()');

            return (int) ($result[0]->count ?? 0);
        } catch (\Throwable) {
            return 0;
        }
    }

    private function getRedisInfo(): array
    {
        try {
            $info = Redis::info();

            return [
                'connected_clients' => $info['connected_clients'] ?? 0,
                'used_memory' => $info['used_memory'] ?? 0,
            ];
        } catch (\Throwable) {
            return [];
        }
    }
}
