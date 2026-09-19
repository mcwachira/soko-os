<?php

namespace App\Providers;

use App\Models\AccountingPeriod;
use App\Models\BankAccount;
use App\Models\BankReconciliation;
use App\Models\BankTransaction;
use App\Models\Bill;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\FiscalYear;
use App\Models\Invoice;
use App\Models\JournalEntry;
use App\Models\TaxRate;
use App\Models\Category;
use App\Models\CreditNote;
use App\Models\DebitNote;
use App\Models\Customer;
use App\Models\GoodsReceivedNote;
use App\Models\InventoryMovement;
use App\Models\Payment;
use App\Models\PaymentAllocation;
use App\Models\Permission;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\Quote;
use App\Models\Refund;
use App\Models\ReturnModel;
use App\Models\Role;
use App\Models\Sale;
use App\Models\SalesOrder;
use App\Models\Supplier;
use App\Models\EtimsStockSubmission;
use App\Models\Lead;
use App\Models\CrmAccount;
use App\Models\Contact;
use App\Models\Pipeline;
use App\Models\Deal;
use App\Models\Activity;
use App\Models\CaseModel;
use App\Models\Campaign;
use App\Models\Workflow;
use App\Models\SlaPolicy;
use App\Models\CustomFieldDefinition;
use App\Models\LeadScoringRule;
use App\Models\LeadAssignment;
use App\Models\PriceBook;
use App\Models\KnowledgeArticle;
use App\Models\Sequence;
use App\Policies\AccountingPeriodPolicy;
use App\Policies\BankAccountPolicy;
use App\Policies\BankReconciliationPolicy;
use App\Policies\BankTransactionPolicy;
use App\Policies\BillPolicy;
use App\Policies\CashShiftPolicy;
use App\Policies\CreditNotePolicy;
use App\Policies\CustomerPolicy;
use App\Policies\DebitNotePolicy;
use App\Policies\ExpenseCategoryPolicy;
use App\Policies\ExpensePolicy;
use App\Policies\FiscalYearPolicy;
use App\Policies\GoodsReceivedNotePolicy;
use App\Policies\InventoryMovementPolicy;
use App\Policies\InvoicePolicy;
use App\Policies\JournalEntryPolicy;
use App\Policies\PaymentAllocationPolicy;
use App\Policies\PaymentPolicy;
use App\Policies\PermissionPolicy;
use App\Policies\ProductPolicy;
use App\Policies\PurchaseOrderPolicy;
use App\Policies\QuotePolicy;
use App\Policies\RefundPolicy;
use App\Policies\ReturnPolicy;
use App\Policies\RolePolicy;
use App\Policies\SalePolicy;
use App\Policies\SalesOrderPolicy;
use App\Policies\SupplierPolicy;
use App\Policies\TaxRatePolicy;
use App\Policies\EtimsStockSubmissionPolicy;
use App\Policies\LeadPolicy;
use App\Policies\CrmAccountPolicy;
use App\Policies\ContactPolicy;
use App\Policies\PipelinePolicy;
use App\Policies\DealPolicy;
use App\Policies\ActivityPolicy;
use App\Policies\CasePolicy;
use App\Policies\CampaignPolicy;
use App\Policies\WorkflowPolicy;
use App\Policies\SlaPolicyPolicy;
use App\Policies\CustomFieldDefinitionPolicy;
use App\Policies\LeadScoringRulePolicy;
use App\Policies\LeadAssignmentPolicy;
use App\Policies\PriceBookPolicy;
use App\Policies\KnowledgeArticlePolicy;
use App\Policies\SequencePolicy;
use App\Policies\PurchaseRequisitionPolicy;
use App\Policies\RfqPolicy;
use App\Policies\TenderPolicy;
use App\Policies\SupplierInvoicePolicy;
use App\Policies\ThreeWayMatchPolicy;
use App\Policies\PaymentVoucherPolicy;
use App\Policies\SupplierPaymentPolicy;
use App\Policies\PaymentReconciliationPolicy;
use App\Policies\ProcurementContractPolicy;
use App\Policies\ApprovalRulePolicy;
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
        PaymentAllocation::class => PaymentAllocationPolicy::class,
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
        Warehouse::class => WarehousePolicy::class,
        Account::class => AccountPolicy::class,
        JournalEntry::class => JournalEntryPolicy::class,
        Invoice::class => InvoicePolicy::class,
        Bill::class => BillPolicy::class,
        Expense::class => ExpensePolicy::class,
        ExpenseCategory::class => ExpenseCategoryPolicy::class,
        BankAccount::class => BankAccountPolicy::class,
        BankTransaction::class => BankTransactionPolicy::class,
        BankReconciliation::class => BankReconciliationPolicy::class,
        FiscalYear::class => FiscalYearPolicy::class,
        AccountingPeriod::class => AccountingPeriodPolicy::class,
        TaxRate::class => TaxRatePolicy::class,
        Quote::class => QuotePolicy::class,
        SalesOrder::class => SalesOrderPolicy::class,
        CreditNote::class => CreditNotePolicy::class,
        DebitNote::class => DebitNotePolicy::class,
        Unit::class => UnitPolicy::class,
        UnitConversion::class => UnitPolicy::class,
        ProductVariant::class => ProductVariantPolicy::class,
        Batch::class => BatchPolicy::class,
        SerialNumber::class => SerialNumberPolicy::class,
        Zone::class => WarehousePolicy::class,
        Bin::class => BinPolicy::class,
        InventoryAdjustment::class => InventoryAdjustmentPolicy::class,
        Stocktake::class => StocktakePolicy::class,
        TransferOrder::class => TransferOrderPolicy::class,
        Assembly::class => AssemblyPolicy::class,
        LandedCost::class => LandedCostPolicy::class,
        ReplenishmentRule::class => ReplenishmentRulePolicy::class,
        PriceList::class => PriceListPolicy::class,
        Package::class => PackagePolicy::class,
        Shipment::class => ShipmentPolicy::class,
        EtimsStockSubmission::class => EtimsStockSubmissionPolicy::class,
        Lead::class => LeadPolicy::class,
        CrmAccount::class => CrmAccountPolicy::class,
        Contact::class => ContactPolicy::class,
        Pipeline::class => PipelinePolicy::class,
        Deal::class => DealPolicy::class,
        Activity::class => ActivityPolicy::class,
        CaseModel::class => CasePolicy::class,
        Campaign::class => CampaignPolicy::class,
        Workflow::class => WorkflowPolicy::class,
        SlaPolicy::class => SlaPolicyPolicy::class,
        CustomFieldDefinition::class => CustomFieldDefinitionPolicy::class,
        LeadScoringRule::class => LeadScoringRulePolicy::class,
        LeadAssignment::class => LeadAssignmentPolicy::class,
        PriceBook::class => PriceBookPolicy::class,
        KnowledgeArticle::class => KnowledgeArticlePolicy::class,
        Sequence::class => SequencePolicy::class,
        PurchaseRequisition::class => PurchaseRequisitionPolicy::class,
        Rfq::class => RfqPolicy::class,
        Tender::class => TenderPolicy::class,
        SupplierInvoice::class => SupplierInvoicePolicy::class,
        ThreeWayMatch::class => ThreeWayMatchPolicy::class,
        PaymentVoucher::class => PaymentVoucherPolicy::class,
        SupplierPayment::class => SupplierPaymentPolicy::class,
        PaymentReconciliation::class => PaymentReconciliationPolicy::class,
        ProcurementContract::class => ProcurementContractPolicy::class,
        ApprovalRule::class => ApprovalRulePolicy::class,
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
