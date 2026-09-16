<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class CorrelationIdMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $correlationId = $request->header('X-Correlation-ID')
            ?? $request->header('X-Request-ID')
            ?? Str::uuid()->toString();

        // Set correlation ID on request for use in controllers
        $request->attributes->set('correlation_id', $correlationId);

        // Add to response headers
        $response = $next($request);
        $response->headers->set('X-Correlation-ID', $correlationId);

        return $response;
    }
}
