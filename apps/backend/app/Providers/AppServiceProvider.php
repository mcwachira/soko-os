<?php

namespace App\Providers;

use App\Models\CashShift;
use App\Models\Customer;
use App\Models\InventoryMovement;
use App\Models\Product;
use App\Models\Refund;
use App\Models\ReturnModel;
use App\Models\Sale;
use App\Observers\AuditObserver;
use App\Services\Payments\PaymentProviderManager;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(PaymentProviderManager::class, function () {
            return new PaymentProviderManager;
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register audit observers
        foreach ([
            Sale::class,
            Product::class,
            Customer::class,
            CashShift::class,
            InventoryMovement::class,
            ReturnModel::class,
            Refund::class,
        ] as $model) {
            $model::observe(AuditObserver::class);
        }

        // Configure rate limiters
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?? $request->ip());
        });

        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });

        RateLimiter::for('sync', function (Request $request) {
            return Limit::perMinute(30)->by($request->user()?->id ?? $request->ip());
        });
    }
}
