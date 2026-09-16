<?php

use App\Http\Controllers\Api\V1\AccountingController;
use App\Http\Controllers\Api\V1\AccountingPeriodController;
use App\Http\Controllers\Api\V1\BankAccountController;
use App\Http\Controllers\Api\V1\BankReconciliationController;
use App\Http\Controllers\Api\V1\BankTransactionController;
use App\Http\Controllers\Api\V1\BillController;
use App\Http\Controllers\Api\V1\ExpenseController;
use App\Http\Controllers\Api\V1\FiscalYearController;
use App\Http\Controllers\Api\V1\InvoiceController;
use App\Http\Controllers\Api\V1\TaxRateController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BranchController;
use App\Http\Controllers\Api\V1\BusinessController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\CustomerController;
use App\Http\Controllers\Api\V1\DeviceController;
use App\Http\Controllers\Api\V1\GoodsReceivedNote;
use App\Http\Controllers\Api\V1\HealthController;
use App\Http\Controllers\Api\V1\MetricsController;
use App\Http\Controllers\Api\V1\OrganizationController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\PermissionController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\PurchasingController;
use App\Http\Controllers\Api\V1\RefundController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\ReturnController;
use App\Http\Controllers\Api\V1\RoleController;
use App\Http\Controllers\Api\V1\SaleController;
use App\Http\Controllers\Api\V1\ShiftController;
use App\Http\Controllers\Api\V1\SyncController;
use App\Http\Controllers\Api\V1\TerminalController;
use App\Http\Controllers\Api\V1\WarehouseController;
use App\Http\Controllers\Api\V1\SubscriptionController;
use App\Http\Controllers\Api\V1\PlanController;
use App\Http\Controllers\Api\V1\InvitationController;
use App\Http\Controllers\Api\V1\MembershipController;
use App\Http\Controllers\Api\V1\Admin\SubscriptionController as AdminSubscriptionController;
use App\Http\Controllers\Api\V1\Admin\PlanController as AdminPlanController;
use App\Http\Controllers\Api\V1\Admin\TenantController;

Route::prefix('v1')->group(function () {
    // Public health endpoints
    Route::get('/health', [HealthController::class, 'index']);
    Route::get('/health/database', [HealthController::class, 'database']);
    Route::get('/health/redis', [HealthController::class, 'redis']);

    // Metrics endpoints (public for Prometheus scraping)
    Route::get('/metrics', [MetricsController::class, 'index']);
    Route::get('/metrics/prometheus', [MetricsController::class, 'prometheus']);

    // Auth endpoints
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('/auth/me', [AuthController::class, 'me'])->middleware('auth:sanctum');
    Route::post('/auth/switch-tenant', [AuthController::class, 'switchTenant'])->middleware('auth:sanctum');
    Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

    // Webhook endpoints (no auth, signature verification in controller)
    Route::post('/webhooks/mpesa', [SyncController::class, 'mpesaWebhook']);
    Route::post('/webhooks/kra', [SyncController::class, 'kraWebhook']);

    // Protected API routes with tenant isolation
    Route::middleware(['auth:sanctum', 'tenant'])->group(function () {
        Route::post('/sync/push', [SyncController::class, 'push']);
        Route::post('/sync/pull', [SyncController::class, 'pull']);
        Route::get('/sync/conflicts', [SyncController::class, 'listConflicts']);
        Route::post('/sync/conflicts/{syncOperationId}/resolve', [SyncController::class, 'resolveConflict']);

        Route::middleware('tenant')->group(function () {
            Route::get('/sales', [SaleController::class, 'index']);
            Route::get('/sales/{id}', [SaleController::class, 'show']);
            Route::post('/sales', [SaleController::class, 'store']);
            Route::get('/sales/{id}/receipt', [SaleController::class, 'receipt']);

            Route::get('/payments', [PaymentController::class, 'index']);
            Route::get('/payments/{id}', [PaymentController::class, 'show']);
        });

        // Products
        Route::get('/products', [ProductController::class, 'index']);
        Route::get('/products/search', [ProductController::class, 'search']);
        Route::get('/products/{id}', [ProductController::class, 'show']);
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{id}', [ProductController::class, 'update']);
        Route::delete('/products/{id}', [ProductController::class, 'destroy']);

        // Categories
        Route::get('/categories', [CategoryController::class, 'index']);
        Route::get('/categories/{id}', [CategoryController::class, 'show']);
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{id}', [CategoryController::class, 'update']);
        Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

        // Shifts
        Route::get('/shifts/current', [ShiftController::class, 'current']);
        Route::post('/shifts/open', [ShiftController::class, 'open']);
        Route::post('/shifts/close', [ShiftController::class, 'close']);

        // Returns
        Route::get('/returns', [ReturnController::class, 'index']);
        Route::get('/returns/{id}', [ReturnController::class, 'show']);
        Route::post('/returns', [ReturnController::class, 'store']);
        Route::put('/returns/{id}', [ReturnController::class, 'update']);
        Route::delete('/returns/{id}', [ReturnController::class, 'destroy']);

        // Refunds
        Route::get('/refunds', [RefundController::class, 'index']);
        Route::get('/refunds/{id}', [RefundController::class, 'show']);
        Route::post('/refunds', [RefundController::class, 'store']);
        Route::post('/refunds/{id}/complete', [RefundController::class, 'complete']);

        // Organizations
        Route::get('/organizations', [OrganizationController::class, 'index']);
        Route::get('/organizations/{id}', [OrganizationController::class, 'show']);
        Route::post('/organizations', [OrganizationController::class, 'store']);
        Route::put('/organizations/{id}', [OrganizationController::class, 'update']);
        Route::delete('/organizations/{id}', [OrganizationController::class, 'destroy']);

        // Businesses
        Route::get('/businesses', [BusinessController::class, 'index']);
        Route::get('/businesses/{id}', [BusinessController::class, 'show']);
        Route::post('/businesses', [BusinessController::class, 'store']);
        Route::put('/businesses/{id}', [BusinessController::class, 'update']);
        Route::delete('/businesses/{id}', [BusinessController::class, 'destroy']);

        // Branches
        Route::get('/branches', [BranchController::class, 'index']);
        Route::get('/branches/{id}', [BranchController::class, 'show']);
        Route::post('/branches', [BranchController::class, 'store']);
        Route::put('/branches/{id}', [BranchController::class, 'update']);
        Route::delete('/branches/{id}', [BranchController::class, 'destroy']);

        // Warehouses
        Route::get('/warehouses', [WarehouseController::class, 'index']);
        Route::get('/warehouses/{id}', [WarehouseController::class, 'show']);
        Route::post('/warehouses', [WarehouseController::class, 'store']);
        Route::put('/warehouses/{id}', [WarehouseController::class, 'update']);
        Route::delete('/warehouses/{id}', [WarehouseController::class, 'destroy']);

        // Terminals
        Route::get('/terminals', [TerminalController::class, 'index']);
        Route::get('/terminals/{id}', [TerminalController::class, 'show']);
        Route::post('/terminals', [TerminalController::class, 'store']);
        Route::put('/terminals/{id}', [TerminalController::class, 'update']);
        Route::delete('/terminals/{id}', [TerminalController::class, 'destroy']);

        // Devices
        Route::get('/devices', [DeviceController::class, 'index']);
        Route::get('/devices/{id}', [DeviceController::class, 'show']);
        Route::post('/devices', [DeviceController::class, 'store']);
        Route::put('/devices/{id}', [DeviceController::class, 'update']);
        Route::delete('/devices/{id}', [DeviceController::class, 'destroy']);

        // Customers
        Route::get('/customers', [CustomerController::class, 'index']);
        Route::get('/customers/{id}', [CustomerController::class, 'show']);
        Route::post('/customers', [CustomerController::class, 'store']);
        Route::put('/customers/{id}', [CustomerController::class, 'update']);
        Route::delete('/customers/{id}', [CustomerController::class, 'destroy']);

        // Suppliers
        Route::get('/suppliers', [PurchasingController::class, 'suppliersIndex']);
        Route::get('/suppliers/{id}', [PurchasingController::class, 'suppliersShow']);
        Route::post('/suppliers', [PurchasingController::class, 'suppliersStore']);
        Route::put('/suppliers/{id}', [PurchasingController::class, 'suppliersUpdate']);
        Route::delete('/suppliers/{id}', [PurchasingController::class, 'suppliersDestroy']);

        // Purchase Orders
        Route::get('/purchase-orders', [PurchasingController::class, 'purchaseOrdersIndex']);
        Route::get('/purchase-orders/{id}', [PurchasingController::class, 'purchaseOrdersShow']);
        Route::post('/purchase-orders', [PurchasingController::class, 'purchaseOrdersStore']);
        Route::put('/purchase-orders/{id}', [PurchasingController::class, 'purchaseOrdersUpdate']);
        Route::post('/purchase-orders/{id}/approve', [PurchasingController::class, 'purchaseOrdersApprove']);
        Route::post('/purchase-orders/{id}/cancel', [PurchasingController::class, 'purchaseOrdersCancel']);

        // GRNs
        Route::get('/grns', [PurchasingController::class, 'grnsIndex']);
        Route::get('/grns/{id}', [PurchasingController::class, 'grnsShow']);
        Route::post('/grns', [PurchasingController::class, 'grnsStore']);

        // Reports
        Route::get('/reports/sales', [ReportController::class, 'sales']);
        Route::get('/reports/inventory', [ReportController::class, 'inventory']);
        Route::get('/reports/tax', [ReportController::class, 'tax']);

        // Accounting
        Route::get('/accounts', [AccountingController::class, 'accounts']);
        Route::get('/accounts/{id}', [AccountingController::class, 'showAccount']);
        Route::post('/accounts', [AccountingController::class, 'storeAccount']);
        Route::put('/accounts/{id}', [AccountingController::class, 'updateAccount']);
        Route::get('/journal-entries', [AccountingController::class, 'journalEntries']);
        Route::get('/journal-entries/{id}', [AccountingController::class, 'showJournalEntry']);
        Route::post('/journal-entries', [AccountingController::class, 'storeJournalEntry']);
        Route::post('/journal-entries/{id}/post', [AccountingController::class, 'postJournalEntry']);
        Route::post('/journal-entries/{id}/reverse', [AccountingController::class, 'reverseJournalEntry']);
        Route::get('/ledger', [AccountingController::class, 'ledger']);
        Route::get('/reports/trial-balance', [AccountingController::class, 'trialBalance']);
        Route::get('/reports/profit-loss', [AccountingController::class, 'profitLoss']);
        Route::get('/reports/balance-sheet', [AccountingController::class, 'balanceSheet']);
        Route::get('/reports/cash-flow', [AccountingController::class, 'cashFlow']);

        // Invoices
        Route::get('/invoices', [InvoiceController::class, 'index']);
        Route::get('/invoices/{id}', [InvoiceController::class, 'show']);
        Route::post('/invoices', [InvoiceController::class, 'store']);
        Route::put('/invoices/{id}', [InvoiceController::class, 'update']);
        Route::delete('/invoices/{id}', [InvoiceController::class, 'destroy']);

        // Bills
        Route::get('/bills', [BillController::class, 'index']);
        Route::get('/bills/{id}', [BillController::class, 'show']);
        Route::post('/bills', [BillController::class, 'store']);
        Route::put('/bills/{id}', [BillController::class, 'update']);
        Route::delete('/bills/{id}', [BillController::class, 'destroy']);

        // Expenses
        Route::get('/expenses', [ExpenseController::class, 'index']);
        Route::get('/expenses/{id}', [ExpenseController::class, 'show']);
        Route::post('/expenses', [ExpenseController::class, 'store']);
        Route::put('/expenses/{id}', [ExpenseController::class, 'update']);
        Route::delete('/expenses/{id}', [ExpenseController::class, 'destroy']);

        // Bank Accounts
        Route::get('/bank-accounts', [BankAccountController::class, 'index']);
        Route::get('/bank-accounts/{id}', [BankAccountController::class, 'show']);
        Route::post('/bank-accounts', [BankAccountController::class, 'store']);
        Route::put('/bank-accounts/{id}', [BankAccountController::class, 'update']);
        Route::delete('/bank-accounts/{id}', [BankAccountController::class, 'destroy']);

        // Bank Transactions
        Route::get('/bank-transactions', [BankTransactionController::class, 'index']);
        Route::get('/bank-transactions/{id}', [BankTransactionController::class, 'show']);
        Route::post('/bank-transactions', [BankTransactionController::class, 'store']);
        Route::put('/bank-transactions/{id}', [BankTransactionController::class, 'update']);
        Route::delete('/bank-transactions/{id}', [BankTransactionController::class, 'destroy']);

        // Bank Reconciliations
        Route::get('/bank-reconciliations', [BankReconciliationController::class, 'index']);
        Route::get('/bank-reconciliations/{id}', [BankReconciliationController::class, 'show']);
        Route::post('/bank-reconciliations', [BankReconciliationController::class, 'store']);
        Route::put('/bank-reconciliations/{id}', [BankReconciliationController::class, 'update']);
        Route::delete('/bank-reconciliations/{id}', [BankReconciliationController::class, 'destroy']);

        // Fiscal Years
        Route::get('/fiscal-years', [FiscalYearController::class, 'index']);
        Route::get('/fiscal-years/{id}', [FiscalYearController::class, 'show']);
        Route::post('/fiscal-years', [FiscalYearController::class, 'store']);
        Route::put('/fiscal-years/{id}', [FiscalYearController::class, 'update']);
        Route::delete('/fiscal-years/{id}', [FiscalYearController::class, 'destroy']);

        // Accounting Periods
        Route::get('/accounting-periods', [AccountingPeriodController::class, 'index']);
        Route::get('/accounting-periods/{id}', [AccountingPeriodController::class, 'show']);
        Route::post('/accounting-periods', [AccountingPeriodController::class, 'store']);
        Route::put('/accounting-periods/{id}', [AccountingPeriodController::class, 'update']);
        Route::delete('/accounting-periods/{id}', [AccountingPeriodController::class, 'destroy']);

        // Tax Rates
        Route::get('/tax-rates', [TaxRateController::class, 'index']);
        Route::get('/tax-rates/{id}', [TaxRateController::class, 'show']);
        Route::post('/tax-rates', [TaxRateController::class, 'store']);
        Route::put('/tax-rates/{id}', [TaxRateController::class, 'update']);
        Route::delete('/tax-rates/{id}', [TaxRateController::class, 'destroy']);

        // RBAC
        Route::get('/roles', [RoleController::class, 'index']);
        Route::get('/roles/{id}', [RoleController::class, 'show']);
        Route::post('/roles', [RoleController::class, 'store']);
        Route::put('/roles/{id}', [RoleController::class, 'update']);
        Route::delete('/roles/{id}', [RoleController::class, 'destroy']);

        Route::get('/permissions', [PermissionController::class, 'index']);

        // Subscriptions
        Route::get('/subscriptions', [SubscriptionController::class, 'index']);
        Route::get('/subscriptions/{id}', [SubscriptionController::class, 'show']);
        Route::put('/subscriptions/{id}', [SubscriptionController::class, 'update']);

        // Plans
        Route::get('/plans', [PlanController::class, 'index']);
        Route::get('/plans/{id}', [PlanController::class, 'show']);

        // Invitations
        Route::get('/invitations', [InvitationController::class, 'index']);
        Route::post('/invitations', [InvitationController::class, 'store']);
        Route::post('/invitations/accept', [InvitationController::class, 'accept']);
        Route::delete('/invitations/{id}', [InvitationController::class, 'destroy']);

        // Memberships
        Route::get('/memberships', [MembershipController::class, 'index']);
        Route::put('/memberships/{id}', [MembershipController::class, 'update']);
        Route::delete('/memberships/{id}', [MembershipController::class, 'destroy']);
    });

    // Admin routes
    Route::middleware(['auth:sanctum', \App\Http\Middleware\EnsureSuperAdmin::class])->prefix('admin')->group(function () {
        Route::get('/tenants', [\App\Http\Controllers\Api\V1\Admin\TenantController::class, 'index']);
        Route::get('/tenants/{id}', [\App\Http\Controllers\Api\V1\Admin\TenantController::class, 'show']);
        Route::post('/tenants', [\App\Http\Controllers\Api\V1\Admin\TenantController::class, 'store']);
        Route::put('/tenants/{id}', [\App\Http\Controllers\Api\V1\Admin\TenantController::class, 'update']);
        Route::post('/tenants/{id}/suspend', [\App\Http\Controllers\Api\V1\Admin\TenantController::class, 'suspend']);
        Route::post('/tenants/{id}/activate', [\App\Http\Controllers\Api\V1\Admin\TenantController::class, 'activate']);

        Route::get('/subscriptions', [AdminSubscriptionController::class, 'index']);
        Route::get('/subscriptions/{id}', [AdminSubscriptionController::class, 'show']);
        Route::put('/subscriptions/{id}', [AdminSubscriptionController::class, 'update']);

        Route::get('/plans', [AdminPlanController::class, 'index']);
        Route::post('/plans', [AdminPlanController::class, 'store']);
        Route::put('/plans/{id}', [AdminPlanController::class, 'update']);
        Route::delete('/plans/{id}', [AdminPlanController::class, 'destroy']);
    });
});
