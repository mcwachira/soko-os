<?php

namespace App\Providers;

use App\Models\AccountingPeriod;
use App\Models\BankAccount;
use App\Models\BankReconciliation;
use App\Models\BankTransaction;
use App\Models\Bill;
use App\Models\Expense;
use App\Models\FiscalYear;
use App\Models\Invoice;
use App\Models\JournalEntry;
use App\Models\TaxRate;
use App\Models\Category;
use App\Models\Customer;
use App\Models\GoodsReceivedNote;
use App\Models\InventoryMovement;
use App\Models\Payment;
use App\Models\Permission;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\Refund;
use App\Models\ReturnModel;
use App\Models\Role;
use App\Models\Sale;
use App\Models\Supplier;
use App\Policies\AccountingPeriodPolicy;
use App\Policies\BankAccountPolicy;
use App\Policies\BankReconciliationPolicy;
use App\Policies\BankTransactionPolicy;
use App\Policies\BillPolicy;
use App\Policies\CashShiftPolicy;
use App\Policies\CustomerPolicy;
use App\Policies\ExpensePolicy;
use App\Policies\FiscalYearPolicy;
use App\Policies\GoodsReceivedNotePolicy;
use App\Policies\InventoryMovementPolicy;
use App\Policies\InvoicePolicy;
use App\Policies\JournalEntryPolicy;
use App\Policies\PaymentPolicy;
use App\Policies\PermissionPolicy;
use App\Policies\ProductPolicy;
use App\Policies\PurchaseOrderPolicy;
use App\Policies\RefundPolicy;
use App\Policies\ReturnPolicy;
use App\Policies\RolePolicy;
use App\Policies\SalePolicy;
use App\Policies\SupplierPolicy;
use App\Policies\TaxRatePolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Sale::class => SalePolicy::class,
        Payment::class => PaymentPolicy::class,
        Product::class => ProductPolicy::class,
        Customer::class => CustomerPolicy::class,
        Category::class => CategoryPolicy::class,
        CashShift::class => CashShiftPolicy::class,
        InventoryMovement::class => InventoryMovementPolicy::class,
        ReturnModel::class => ReturnPolicy::class,
        Refund::class => RefundPolicy::class,
        Role::class => RolePolicy::class,
        Permission::class => PermissionPolicy::class,
        Supplier::class => SupplierPolicy::class,
        PurchaseOrder::class => PurchaseOrderPolicy::class,
        GoodsReceivedNote::class => GoodsReceivedNotePolicy::class,
        Account::class => AccountPolicy::class,
        JournalEntry::class => JournalEntryPolicy::class,
        Invoice::class => InvoicePolicy::class,
        Bill::class => BillPolicy::class,
        Expense::class => ExpensePolicy::class,
        BankAccount::class => BankAccountPolicy::class,
        BankTransaction::class => BankTransactionPolicy::class,
        BankReconciliation::class => BankReconciliationPolicy::class,
        FiscalYear::class => FiscalYearPolicy::class,
        AccountingPeriod::class => AccountingPeriodPolicy::class,
        TaxRate::class => TaxRatePolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();

        Gate::before(function ($user, $ability) {
            if ($user->isSuperAdmin()) {
                return true;
            }
        });
    }
}
