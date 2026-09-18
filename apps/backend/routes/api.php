<?php

use App\Http\Controllers\Api\V1\AccountingController;
use App\Http\Controllers\Api\V1\AccountingPeriodController;
use App\Http\Controllers\Api\V1\BankAccountController;
use App\Http\Controllers\Api\V1\BankReconciliationController;
use App\Http\Controllers\Api\V1\BankTransactionController;
use App\Http\Controllers\Api\V1\BillController;
use App\Http\Controllers\Api\V1\ExpenseCategoryController;
use App\Http\Controllers\Api\V1\ExpenseController;
use App\Http\Controllers\Api\V1\FiscalYearController;
use App\Http\Controllers\Api\V1\InvoiceController;
use App\Http\Controllers\Api\V1\TaxRateController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BranchController;
use App\Http\Controllers\Api\V1\BusinessController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\CartController;
use App\Http\Controllers\Api\V1\CashMovementController;
use App\Http\Controllers\Api\V1\CreditNoteController;
use App\Http\Controllers\Api\V1\CurrencyController;
use App\Http\Controllers\Api\V1\CustomerController;
use App\Http\Controllers\Api\V1\CustomerPortalController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\DebitNoteController;
use App\Http\Controllers\Api\V1\DeviceController;
use App\Http\Controllers\Api\V1\ExchangeRateController;
use App\Http\Controllers\Api\V1\GoodsReceivedNote;
use App\Http\Controllers\Api\V1\HealthController;
use App\Http\Controllers\Api\V1\MetricsController;
use App\Http\Controllers\Api\V1\OrganizationController;
use App\Http\Controllers\Api\V1\PaymentAllocationController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\PermissionController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\ProjectController;
use App\Http\Controllers\Api\V1\ProjectExpenseController;
use App\Http\Controllers\Api\V1\PurchasingController;
use App\Http\Controllers\Api\V1\QuoteController;
use App\Http\Controllers\Api\V1\RefundController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\RecurringBillController;
use App\Http\Controllers\Api\V1\RecurringInvoiceController;
use App\Http\Controllers\Api\V1\RetainerInvoiceController;
use App\Http\Controllers\Api\V1\ReturnController;
use App\Http\Controllers\Api\V1\RoleController;
use App\Http\Controllers\Api\V1\SaleController;
use App\Http\Controllers\Api\V1\SalesOrderController;
use App\Http\Controllers\Api\V1\ShiftController;
use App\Http\Controllers\Api\V1\SyncController;
use App\Http\Controllers\Api\V1\TaskController;
use App\Http\Controllers\Api\V1\TerminalController;
use App\Http\Controllers\Api\V1\TimesheetController;
use App\Http\Controllers\Api\V1\WarehouseController;
use App\Http\Controllers\Api\V1\SubscriptionController;
use App\Http\Controllers\Api\V1\PlanController;
use App\Http\Controllers\Api\V1\InvitationController;
use App\Http\Controllers\Api\V1\LoyaltyController;
use App\Http\Controllers\Api\V1\MembershipController;
use App\Http\Controllers\Api\V1\PriceOverrideController;
use App\Http\Controllers\Api\V1\QuickKeyController;
use App\Http\Controllers\Api\V1\StoreCreditController;
use App\Http\Controllers\Api\V1\PosReportController;
use App\Http\Controllers\Api\V1\Admin\SubscriptionController as AdminSubscriptionController;
use App\Http\Controllers\Api\V1\Admin\PlanController as AdminPlanController;
use App\Http\Controllers\Api\V1\Admin\TenantController;
use App\Http\Controllers\Api\V1\LeadController;
use App\Http\Controllers\Api\V1\CrmAccountController;
use App\Http\Controllers\Api\V1\ContactController;
use App\Http\Controllers\Api\V1\PipelineController;
use App\Http\Controllers\Api\V1\DealController;
use App\Http\Controllers\Api\V1\DealStageController;
use App\Http\Controllers\Api\V1\ActivityController;
use App\Http\Controllers\Api\V1\CommunicationController;
use App\Http\Controllers\Api\V1\CaseController;
use App\Http\Controllers\Api\V1\CampaignController;
use App\Http\Controllers\Api\V1\WorkflowController;
use App\Http\Controllers\Api\V1\SlaPolicyController;
use App\Http\Controllers\Api\V1\CustomFieldDefinitionController;
use App\Http\Controllers\Api\V1\TerritoryController;
use App\Http\Controllers\Api\V1\PriceBookController;
use App\Http\Controllers\Api\V1\KnowledgeArticleController;
use App\Http\Controllers\Api\V1\SequenceController;
use App\Http\Controllers\Api\V1\LeadScoringRuleController;
use App\Http\Controllers\Api\V1\LeadAssignmentController;
use App\Http\Controllers\Api\V1\UnitController;
use App\Http\Controllers\Api\V1\Procurement\PurchaseRequisitionController;
use App\Http\Controllers\Api\V1\Procurement\RfqController;
use App\Http\Controllers\Api\V1\Procurement\TenderController;
use App\Http\Controllers\Api\V1\Procurement\SupplierInvoiceController;
use App\Http\Controllers\Api\V1\Procurement\ThreeWayMatchController;
use App\Http\Controllers\Api\V1\Procurement\PaymentVoucherController;
use App\Http\Controllers\Api\V1\Procurement\SupplierPaymentController;
use App\Http\Controllers\Api\V1\Procurement\PaymentReconciliationController;
use App\Http\Controllers\Api\V1\Procurement\ProcurementContractController;
use App\Http\Controllers\Api\V1\Procurement\ApprovalRuleController;

Route::prefix('v1')->group(function () {
    // Public health endpoints
    Route::get('/health', [HealthController::class, 'index']);
    Route::get('/health/database', [HealthController::class, 'database']);
    Route::get('/health/redis', [HealthController::class, 'redis']);

    // Metrics endpoints (public for Prometheus scraping)
    Route::get('/metrics', [MetricsController::class, 'index']);
    Route::get('/metrics/prometheus', [MetricsController::class, 'prometheus']);
    Route::get('/dashboard', [DashboardController::class, 'index'])->middleware('auth:sanctum');

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
            Route::post('/payments', [PaymentController::class, 'store']);
            Route::put('/payments/{id}', [PaymentController::class, 'update']);
            Route::delete('/payments/{id}', [PaymentController::class, 'destroy']);
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

        // Carts
        Route::get('/carts', [CartController::class, 'index']);
        Route::get('/carts/{id}', [CartController::class, 'show']);
        Route::post('/carts', [CartController::class, 'store']);
        Route::put('/carts/{id}', [CartController::class, 'update']);
        Route::delete('/carts/{id}', [CartController::class, 'destroy']);
        Route::post('/carts/{id}/hold', [CartController::class, 'hold']);
        Route::post('/carts/{id}/recall', [CartController::class, 'recall']);

        // Price Overrides
        Route::get('/price-overrides', [PriceOverrideController::class, 'index']);
        Route::post('/price-overrides', [PriceOverrideController::class, 'store']);
        Route::post('/price-overrides/{id}/approve', [PriceOverrideController::class, 'approve']);

        // Cash Movements
        Route::get('/cash-movements', [CashMovementController::class, 'index']);
        Route::post('/cash-movements', [CashMovementController::class, 'store']);

        // Loyalty
        Route::get('/loyalty', [LoyaltyController::class, 'index']);
        Route::get('/loyalty/{id}', [LoyaltyController::class, 'show']);
        Route::post('/loyalty/customers/{customerId}/earn', [LoyaltyController::class, 'earn']);
        Route::post('/loyalty/customers/{customerId}/redeem', [LoyaltyController::class, 'redeem']);

        // Store Credits
        Route::get('/store-credits', [StoreCreditController::class, 'index']);
        Route::post('/store-credits', [StoreCreditController::class, 'store']);

        // Quick Keys
        Route::get('/quick-keys', [QuickKeyController::class, 'index']);
        Route::post('/quick-keys', [QuickKeyController::class, 'store']);
        Route::put('/quick-keys/{id}', [QuickKeyController::class, 'update']);
        Route::delete('/quick-keys/{id}', [QuickKeyController::class, 'destroy']);

        // POS Reports
        Route::get('/pos/reports/sales', [PosReportController::class, 'sales']);
        Route::get('/pos/reports/x-read', [PosReportController::class, 'xRead']);
        Route::get('/pos/reports/z-read', [PosReportController::class, 'zRead']);
        Route::get('/pos/reports/top-products', [PosReportController::class, 'topProducts']);

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
        Route::post('/invoices/{id}/issue', [InvoiceController::class, 'issue']);

        // Quotes
        Route::get('/quotes', [QuoteController::class, 'index']);
        Route::get('/quotes/{id}', [QuoteController::class, 'show']);
        Route::post('/quotes', [QuoteController::class, 'store']);
        Route::put('/quotes/{id}', [QuoteController::class, 'update']);
        Route::delete('/quotes/{id}', [QuoteController::class, 'destroy']);

        // Sales Orders
        Route::get('/sales-orders', [SalesOrderController::class, 'index']);
        Route::get('/sales-orders/{id}', [SalesOrderController::class, 'show']);
        Route::post('/sales-orders', [SalesOrderController::class, 'store']);
        Route::put('/sales-orders/{id}', [SalesOrderController::class, 'update']);
        Route::delete('/sales-orders/{id}', [SalesOrderController::class, 'destroy']);

        // Credit Notes
        Route::get('/credit-notes', [CreditNoteController::class, 'index']);
        Route::get('/credit-notes/{id}', [CreditNoteController::class, 'show']);
        Route::post('/credit-notes', [CreditNoteController::class, 'store']);
        Route::put('/credit-notes/{id}', [CreditNoteController::class, 'update']);
        Route::delete('/credit-notes/{id}', [CreditNoteController::class, 'destroy']);
        Route::post('/credit-notes/{id}/issue', [CreditNoteController::class, 'issue']);

        // Debit Notes
        Route::get('/debit-notes', [DebitNoteController::class, 'index']);
        Route::get('/debit-notes/{id}', [DebitNoteController::class, 'show']);
        Route::post('/debit-notes', [DebitNoteController::class, 'store']);
        Route::put('/debit-notes/{id}', [DebitNoteController::class, 'update']);
        Route::delete('/debit-notes/{id}', [DebitNoteController::class, 'destroy']);
        Route::post('/debit-notes/{id}/approve', [DebitNoteController::class, 'approve']);

        // Projects
        Route::get('/projects', [ProjectController::class, 'index']);
        Route::get('/projects/{id}', [ProjectController::class, 'show']);
        Route::post('/projects', [ProjectController::class, 'store']);
        Route::put('/projects/{id}', [ProjectController::class, 'update']);
        Route::delete('/projects/{id}', [ProjectController::class, 'destroy']);

        // Tasks
        Route::get('/tasks', [TaskController::class, 'index']);
        Route::get('/tasks/{id}', [TaskController::class, 'show']);
        Route::post('/tasks', [TaskController::class, 'store']);
        Route::put('/tasks/{id}', [TaskController::class, 'update']);
        Route::delete('/tasks/{id}', [TaskController::class, 'destroy']);

        // Timesheets
        Route::get('/timesheets', [TimesheetController::class, 'index']);
        Route::get('/timesheets/{id}', [TimesheetController::class, 'show']);
        Route::post('/timesheets', [TimesheetController::class, 'store']);
        Route::put('/timesheets/{id}', [TimesheetController::class, 'update']);
        Route::delete('/timesheets/{id}', [TimesheetController::class, 'destroy']);

        // Project Expenses
        Route::get('/project-expenses', [ProjectExpenseController::class, 'index']);
        Route::get('/project-expenses/{id}', [ProjectExpenseController::class, 'show']);
        Route::post('/project-expenses', [ProjectExpenseController::class, 'store']);
        Route::put('/project-expenses/{id}', [ProjectExpenseController::class, 'update']);
        Route::delete('/project-expenses/{id}', [ProjectExpenseController::class, 'destroy']);

        // Retainer Invoices
        Route::get('/retainer-invoices', [RetainerInvoiceController::class, 'index']);
        Route::get('/retainer-invoices/{id}', [RetainerInvoiceController::class, 'show']);
        Route::post('/retainer-invoices', [RetainerInvoiceController::class, 'store']);
        Route::put('/retainer-invoices/{id}', [RetainerInvoiceController::class, 'update']);
        Route::delete('/retainer-invoices/{id}', [RetainerInvoiceController::class, 'destroy']);

        // Recurring Invoices
        Route::get('/recurring-invoices', [RecurringInvoiceController::class, 'index']);
        Route::get('/recurring-invoices/{id}', [RecurringInvoiceController::class, 'show']);
        Route::post('/recurring-invoices', [RecurringInvoiceController::class, 'store']);
        Route::put('/recurring-invoices/{id}', [RecurringInvoiceController::class, 'update']);
        Route::delete('/recurring-invoices/{id}', [RecurringInvoiceController::class, 'destroy']);

        // Recurring Bills
        Route::get('/recurring-bills', [RecurringBillController::class, 'index']);
        Route::get('/recurring-bills/{id}', [RecurringBillController::class, 'show']);
        Route::post('/recurring-bills', [RecurringBillController::class, 'store']);
        Route::put('/recurring-bills/{id}', [RecurringBillController::class, 'update']);
        Route::delete('/recurring-bills/{id}', [RecurringBillController::class, 'destroy']);

        // Currencies
        Route::get('/currencies', [CurrencyController::class, 'index']);
        Route::get('/currencies/{id}', [CurrencyController::class, 'show']);
        Route::post('/currencies', [CurrencyController::class, 'store']);
        Route::put('/currencies/{id}', [CurrencyController::class, 'update']);
        Route::delete('/currencies/{id}', [CurrencyController::class, 'destroy']);

        // Exchange Rates
        Route::get('/exchange-rates', [ExchangeRateController::class, 'index']);
        Route::post('/exchange-rates', [ExchangeRateController::class, 'store']);

        // Payment Allocations
        Route::post('/portal/login', [CustomerPortalController::class, 'login']);
        Route::middleware('auth:sanctum')->group(function () {
            Route::get('/portal/invoices', [CustomerPortalController::class, 'invoices']);
            Route::get('/portal/invoices/{id}', [CustomerPortalController::class, 'showInvoice']);
        });
        Route::get('/payment-allocations', [PaymentAllocationController::class, 'index']);
        Route::get('/payment-allocations/{id}', [PaymentAllocationController::class, 'show']);
        Route::post('/payment-allocations', [PaymentAllocationController::class, 'store']);
        Route::put('/payment-allocations/{id}', [PaymentAllocationController::class, 'update']);
        Route::delete('/payment-allocations/{id}', [PaymentAllocationController::class, 'destroy']);

        // Bills
        Route::get('/bills', [BillController::class, 'index']);
        Route::get('/bills/{id}', [BillController::class, 'show']);
        Route::post('/bills', [BillController::class, 'store']);
        Route::put('/bills/{id}', [BillController::class, 'update']);
        Route::delete('/bills/{id}', [BillController::class, 'destroy']);
        Route::post('/bills/{id}/approve', [BillController::class, 'approve']);

        // Expense Categories
        Route::get('/expense-categories', [ExpenseCategoryController::class, 'index']);
        Route::get('/expense-categories/{id}', [ExpenseCategoryController::class, 'show']);
        Route::post('/expense-categories', [ExpenseCategoryController::class, 'store']);
        Route::put('/expense-categories/{id}', [ExpenseCategoryController::class, 'update']);
        Route::delete('/expense-categories/{id}', [ExpenseCategoryController::class, 'destroy']);

        // Expenses
        Route::get('/expenses', [ExpenseController::class, 'index']);
        Route::get('/expenses/{id}', [ExpenseController::class, 'show']);
        Route::post('/expenses', [ExpenseController::class, 'store']);
        Route::put('/expenses/{id}', [ExpenseController::class, 'update']);
        Route::delete('/expenses/{id}', [ExpenseController::class, 'destroy']);
        Route::post('/expenses/{id}/approve', [ExpenseController::class, 'approve']);

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

        // Inventory Enhancements
        Route::get('/units', [UnitController::class, 'index']);
        Route::post('/units', [UnitController::class, 'store']);
        Route::get('/units/{id}', [UnitController::class, 'show']);
        Route::put('/units/{id}', [UnitController::class, 'update']);
        Route::delete('/units/{id}', [UnitController::class, 'destroy']);



        Route::get('/serial-numbers', [SerialNumberController::class, 'index']);
        Route::post('/serial-numbers', [SerialNumberController::class, 'store']);
        Route::get('/serial-numbers/{id}', [SerialNumberController::class, 'show']);
        Route::put('/serial-numbers/{id}', [SerialNumberController::class, 'update']);
        Route::delete('/serial-numbers/{id}', [SerialNumberController::class, 'destroy']);

        Route::get('/zones', [ZoneController::class, 'index']);
        Route::post('/zones', [ZoneController::class, 'store']);
        Route::get('/zones/{id}', [ZoneController::class, 'show']);
        Route::put('/zones/{id}', [ZoneController::class, 'update']);
        Route::delete('/zones/{id}', [ZoneController::class, 'destroy']);

        Route::get('/bins', [BinController::class, 'index']);
        Route::post('/bins', [BinController::class, 'store']);
        Route::get('/bins/{id}', [BinController::class, 'show']);
        Route::put('/bins/{id}', [BinController::class, 'update']);
        Route::delete('/bins/{id}', [BinController::class, 'destroy']);

        Route::get('/inventory-adjustments', [InventoryAdjustmentController::class, 'index']);
        Route::post('/inventory-adjustments', [InventoryAdjustmentController::class, 'store']);
        Route::get('/inventory-adjustments/{id}', [InventoryAdjustmentController::class, 'show']);
        Route::post('/inventory-adjustments/{id}/approve', [InventoryAdjustmentController::class, 'approve']);
        Route::delete('/inventory-adjustments/{id}', [InventoryAdjustmentController::class, 'destroy']);

        Route::get('/stocktakes', [StocktakeController::class, 'index']);
        Route::post('/stocktakes', [StocktakeController::class, 'store']);
        Route::get('/stocktakes/{id}', [StocktakeController::class, 'show']);
        Route::post('/stocktakes/{id}/approve', [StocktakeController::class, 'approve']);
        Route::delete('/stocktakes/{id}', [StocktakeController::class, 'destroy']);

        Route::get('/transfers', [TransferOrderController::class, 'index']);
        Route::post('/transfers', [TransferOrderController::class, 'store']);
        Route::get('/transfers/{id}', [TransferOrderController::class, 'show']);
        Route::post('/transfers/{id}/approve', [TransferOrderController::class, 'approve']);
        Route::post('/transfers/{id}/dispatch', [TransferOrderController::class, 'dispatch']);
        Route::post('/transfers/{id}/receive', [TransferOrderController::class, 'receive']);
        Route::delete('/transfers/{id}', [TransferOrderController::class, 'destroy']);

        Route::get('/assemblies', [AssemblyController::class, 'index']);
        Route::post('/assemblies', [AssemblyController::class, 'store']);
        Route::get('/assemblies/{id}', [AssemblyController::class, 'show']);
        Route::post('/assemblies/{id}/complete', [AssemblyController::class, 'complete']);
        Route::delete('/assemblies/{id}', [AssemblyController::class, 'destroy']);

        Route::get('/landed-costs', [LandedCostController::class, 'index']);
        Route::post('/landed-costs', [LandedCostController::class, 'store']);
        Route::get('/landed-costs/{id}', [LandedCostController::class, 'show']);
        Route::delete('/landed-costs/{id}', [LandedCostController::class, 'destroy']);

        Route::get('/replenishment/rules', [ReplenishmentController::class, 'rules']);
        Route::post('/replenishment/rules', [ReplenishmentController::class, 'storeRule']);
        Route::get('/replenishment/suggestions', [ReplenishmentController::class, 'suggestions']);

        Route::get('/price-lists', [PriceListController::class, 'index']);
        Route::post('/price-lists', [PriceListController::class, 'store']);
        Route::get('/price-lists/{id}', [PriceListController::class, 'show']);
        Route::put('/price-lists/{id}', [PriceListController::class, 'update']);
        Route::delete('/price-lists/{id}', [PriceListController::class, 'destroy']);

        Route::get('/packages', [PackageController::class, 'index']);
        Route::post('/packages', [PackageController::class, 'store']);
        Route::get('/packages/{id}', [PackageController::class, 'show']);
        Route::delete('/packages/{id}', [PackageController::class, 'destroy']);

        Route::get('/shipments', [ShipmentController::class, 'index']);
        Route::post('/shipments', [ShipmentController::class, 'store']);
        Route::get('/shipments/{id}', [ShipmentController::class, 'show']);
        Route::put('/shipments/{id}', [ShipmentController::class, 'update']);
        Route::delete('/shipments/{id}', [ShipmentController::class, 'destroy']);

        Route::get('/etims', [EtimsController::class, 'index']);
        Route::get('/etims/{id}', [EtimsController::class, 'show']);
        Route::post('/etims/{id}/retry', [EtimsController::class, 'retry']);

        // CRM
        Route::get('/leads', [LeadController::class, 'index']);
        Route::get('/leads/{id}', [LeadController::class, 'show']);
        Route::post('/leads', [LeadController::class, 'store']);
        Route::put('/leads/{id}', [LeadController::class, 'update']);
        Route::delete('/leads/{id}', [LeadController::class, 'destroy']);
        Route::post('/leads/{id}/convert', [LeadController::class, 'convert']);

        Route::get('/crm/accounts', [CrmAccountController::class, 'index']);
        Route::get('/crm/accounts/{id}', [CrmAccountController::class, 'show']);
        Route::post('/crm/accounts', [CrmAccountController::class, 'store']);
        Route::put('/crm/accounts/{id}', [CrmAccountController::class, 'update']);
        Route::delete('/crm/accounts/{id}', [CrmAccountController::class, 'destroy']);

        Route::get('/contacts', [ContactController::class, 'index']);
        Route::get('/contacts/{id}', [ContactController::class, 'show']);
        Route::post('/contacts', [ContactController::class, 'store']);
        Route::put('/contacts/{id}', [ContactController::class, 'update']);
        Route::delete('/contacts/{id}', [ContactController::class, 'destroy']);

        Route::get('/pipelines', [PipelineController::class, 'index']);
        Route::get('/pipelines/{id}', [PipelineController::class, 'show']);
        Route::post('/pipelines', [PipelineController::class, 'store']);
        Route::put('/pipelines/{id}', [PipelineController::class, 'update']);
        Route::delete('/pipelines/{id}', [PipelineController::class, 'destroy']);

        Route::get('/pipelines/{pipelineId}/stages', [DealStageController::class, 'index']);
        Route::get('/pipelines/{pipelineId}/stages/{id}', [DealStageController::class, 'show']);
        Route::post('/pipelines/{pipelineId}/stages', [DealStageController::class, 'store']);
        Route::put('/pipelines/{pipelineId}/stages/{id}', [DealStageController::class, 'update']);
        Route::delete('/pipelines/{pipelineId}/stages/{id}', [DealStageController::class, 'destroy']);

        Route::get('/deals', [DealController::class, 'index']);
        Route::get('/deals/{id}', [DealController::class, 'show']);
        Route::post('/deals', [DealController::class, 'store']);
        Route::put('/deals/{id}', [DealController::class, 'update']);
        Route::delete('/deals/{id}', [DealController::class, 'destroy']);

        Route::get('/activities', [ActivityController::class, 'index']);
        Route::get('/activities/{id}', [ActivityController::class, 'show']);
        Route::post('/activities', [ActivityController::class, 'store']);
        Route::put('/activities/{id}', [ActivityController::class, 'update']);
        Route::delete('/activities/{id}', [ActivityController::class, 'destroy']);

        Route::get('/communications', [CommunicationController::class, 'index']);
        Route::get('/communications/{id}', [CommunicationController::class, 'show']);
        Route::post('/communications', [CommunicationController::class, 'store']);

        Route::get('/cases', [CaseController::class, 'index']);
        Route::get('/cases/{id}', [CaseController::class, 'show']);
        Route::post('/cases', [CaseController::class, 'store']);
        Route::put('/cases/{id}', [CaseController::class, 'update']);
        Route::delete('/cases/{id}', [CaseController::class, 'destroy']);

        Route::get('/campaigns', [CampaignController::class, 'index']);
        Route::get('/campaigns/{id}', [CampaignController::class, 'show']);
        Route::post('/campaigns', [CampaignController::class, 'store']);
        Route::put('/campaigns/{id}', [CampaignController::class, 'update']);
        Route::delete('/campaigns/{id}', [CampaignController::class, 'destroy']);

        Route::get('/workflows', [WorkflowController::class, 'index']);
        Route::get('/workflows/{id}', [WorkflowController::class, 'show']);
        Route::post('/workflows', [WorkflowController::class, 'store']);
        Route::put('/workflows/{id}', [WorkflowController::class, 'update']);
        Route::delete('/workflows/{id}', [WorkflowController::class, 'destroy']);

        Route::get('/slas', [SlaPolicyController::class, 'index']);
        Route::get('/slas/{id}', [SlaPolicyController::class, 'show']);
        Route::post('/slas', [SlaPolicyController::class, 'store']);
        Route::put('/slas/{id}', [SlaPolicyController::class, 'update']);
        Route::delete('/slas/{id}', [SlaPolicyController::class, 'destroy']);

        Route::get('/custom-fields', [CustomFieldDefinitionController::class, 'index']);
        Route::get('/custom-fields/{id}', [CustomFieldDefinitionController::class, 'show']);
        Route::post('/custom-fields', [CustomFieldDefinitionController::class, 'store']);
        Route::put('/custom-fields/{id}', [CustomFieldDefinitionController::class, 'update']);
        Route::delete('/custom-fields/{id}', [CustomFieldDefinitionController::class, 'destroy']);

        Route::get('/territories', [TerritoryController::class, 'index']);
        Route::get('/territories/{id}', [TerritoryController::class, 'show']);
        Route::post('/territories', [TerritoryController::class, 'store']);
        Route::put('/territories/{id}', [TerritoryController::class, 'update']);
        Route::delete('/territories/{id}', [TerritoryController::class, 'destroy']);

        Route::get('/price-books', [PriceBookController::class, 'index']);
        Route::get('/price-books/{id}', [PriceBookController::class, 'show']);
        Route::post('/price-books', [PriceBookController::class, 'store']);
        Route::put('/price-books/{id}', [PriceBookController::class, 'update']);
        Route::delete('/price-books/{id}', [PriceBookController::class, 'destroy']);

        Route::get('/knowledge', [KnowledgeArticleController::class, 'index']);
        Route::get('/knowledge/{id}', [KnowledgeArticleController::class, 'show']);
        Route::post('/knowledge', [KnowledgeArticleController::class, 'store']);
        Route::put('/knowledge/{id}', [KnowledgeArticleController::class, 'update']);
        Route::delete('/knowledge/{id}', [KnowledgeArticleController::class, 'destroy']);

        Route::get('/sequences', [SequenceController::class, 'index']);
        Route::get('/sequences/{id}', [SequenceController::class, 'show']);
        Route::post('/sequences', [SequenceController::class, 'store']);
        Route::put('/sequences/{id}', [SequenceController::class, 'update']);
        Route::delete('/sequences/{id}', [SequenceController::class, 'destroy']);

        Route::get('/lead-scoring-rules', [LeadScoringRuleController::class, 'index']);
        Route::get('/lead-scoring-rules/{id}', [LeadScoringRuleController::class, 'show']);
        Route::post('/lead-scoring-rules', [LeadScoringRuleController::class, 'store']);
        Route::put('/lead-scoring-rules/{id}', [LeadScoringRuleController::class, 'update']);
        Route::delete('/lead-scoring-rules/{id}', [LeadScoringRuleController::class, 'destroy']);

        Route::get('/lead-assignments', [LeadAssignmentController::class, 'index']);
        Route::get('/lead-assignments/{id}', [LeadAssignmentController::class, 'show']);
        Route::post('/lead-assignments', [LeadAssignmentController::class, 'store']);
        Route::put('/lead-assignments/{id}', [LeadAssignmentController::class, 'update']);
        Route::delete('/lead-assignments/{id}', [LeadAssignmentController::class, 'destroy']);

        // Procurement
        Route::prefix('procurement')->group(function () {
            Route::get('/requisitions', [PurchaseRequisitionController::class, 'index']);
            Route::get('/requisitions/{id}', [PurchaseRequisitionController::class, 'show']);
            Route::post('/requisitions', [PurchaseRequisitionController::class, 'store']);
            Route::put('/requisitions/{id}', [PurchaseRequisitionController::class, 'update']);
            Route::delete('/requisitions/{id}', [PurchaseRequisitionController::class, 'destroy']);
            Route::post('/requisitions/{id}/approve', [PurchaseRequisitionController::class, 'approve']);

            Route::get('/rfqs', [RfqController::class, 'index']);
            Route::get('/rfqs/{id}', [RfqController::class, 'show']);
            Route::post('/rfqs', [RfqController::class, 'store']);
            Route::put('/rfqs/{id}', [RfqController::class, 'update']);
            Route::delete('/rfqs/{id}', [RfqController::class, 'destroy']);
            Route::post('/rfqs/{id}/publish', [RfqController::class, 'publish']);
            Route::post('/rfqs/{id}/close', [RfqController::class, 'close']);

            Route::get('/tenders', [TenderController::class, 'index']);
            Route::get('/tenders/{id}', [TenderController::class, 'show']);
            Route::post('/tenders', [TenderController::class, 'store']);
            Route::put('/tenders/{id}', [TenderController::class, 'update']);
            Route::delete('/tenders/{id}', [TenderController::class, 'destroy']);

            Route::get('/invoices', [SupplierInvoiceController::class, 'index']);
            Route::get('/invoices/{id}', [SupplierInvoiceController::class, 'show']);
            Route::post('/invoices', [SupplierInvoiceController::class, 'store']);
            Route::put('/invoices/{id}', [SupplierInvoiceController::class, 'update']);
            Route::delete('/invoices/{id}', [SupplierInvoiceController::class, 'destroy']);

            Route::get('/matches', [ThreeWayMatchController::class, 'index']);
            Route::get('/matches/{id}', [ThreeWayMatchController::class, 'show']);
            Route::post('/matches', [ThreeWayMatchController::class, 'store']);
            Route::put('/matches/{id}', [ThreeWayMatchController::class, 'update']);
            Route::delete('/matches/{id}', [ThreeWayMatchController::class, 'destroy']);

            Route::get('/payment-vouchers', [PaymentVoucherController::class, 'index']);
            Route::get('/payment-vouchers/{id}', [PaymentVoucherController::class, 'show']);
            Route::post('/payment-vouchers', [PaymentVoucherController::class, 'store']);
            Route::put('/payment-vouchers/{id}', [PaymentVoucherController::class, 'update']);
            Route::delete('/payment-vouchers/{id}', [PaymentVoucherController::class, 'destroy']);

            Route::get('/payments', [SupplierPaymentController::class, 'index']);
            Route::get('/payments/{id}', [SupplierPaymentController::class, 'show']);
            Route::post('/payments', [SupplierPaymentController::class, 'store']);
            Route::put('/payments/{id}', [SupplierPaymentController::class, 'update']);
            Route::delete('/payments/{id}', [SupplierPaymentController::class, 'destroy']);

            Route::get('/reconciliations', [PaymentReconciliationController::class, 'index']);
            Route::get('/reconciliations/{id}', [PaymentReconciliationController::class, 'show']);
            Route::post('/reconciliations', [PaymentReconciliationController::class, 'store']);
            Route::put('/reconciliations/{id}', [PaymentReconciliationController::class, 'update']);
            Route::delete('/reconciliations/{id}', [PaymentReconciliationController::class, 'destroy']);

            Route::get('/contracts', [ProcurementContractController::class, 'index']);
            Route::get('/contracts/{id}', [ProcurementContractController::class, 'show']);
            Route::post('/contracts', [ProcurementContractController::class, 'store']);
            Route::put('/contracts/{id}', [ProcurementContractController::class, 'update']);
            Route::delete('/contracts/{id}', [ProcurementContractController::class, 'destroy']);

            Route::get('/approval-rules', [ApprovalRuleController::class, 'index']);
            Route::get('/approval-rules/{id}', [ApprovalRuleController::class, 'show']);
            Route::post('/approval-rules', [ApprovalRuleController::class, 'store']);
            Route::put('/approval-rules/{id}', [ApprovalRuleController::class, 'update']);
            Route::delete('/approval-rules/{id}', [ApprovalRuleController::class, 'destroy']);
        });
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
