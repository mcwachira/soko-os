<?php

use App\Http\Middleware\CorrelationIdMiddleware;
use App\Http\Middleware\EnsureSuperAdmin;
use App\Http\Middleware\EnsureTenantAccess;
use App\Http\Middleware\RequireProductAccess;
use App\Http\Middleware\SecurityHeadersMiddleware;
use App\Providers\AuthServiceProvider;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Routing\Middleware\ThrottleRequests;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        apiPrefix: 'api',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'tenant' => EnsureTenantAccess::class,
            'super.admin' => EnsureSuperAdmin::class,
            'product' => RequireProductAccess::class,
            'correlation' => CorrelationIdMiddleware::class,
            'security.headers' => SecurityHeadersMiddleware::class,
        ]);

        // Apply correlation ID middleware to all API routes
        $middleware->prependToGroup('api', CorrelationIdMiddleware::class);

        // Apply security headers to all API routes
        $middleware->appendToGroup('api', SecurityHeadersMiddleware::class);

        // Apply rate limiting to API routes
        $middleware->appendToGroup('api', ThrottleRequests::class.':api');
    })
    ->withProviders([
        AuthServiceProvider::class,
    ])
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
