'use client';

import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider as TanStackQueryProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { queryKeys } from '@/lib/query-keys';
import {
  getProducts,
  createProduct,
  getSales,
  createSale,
  getCustomers,
  createCustomer,
  getCurrentShift,
  openShift,
  closeShift,
  pushSync,
  pullSync,
  getReturns,
  createReturn,
  getRefunds,
  createRefund,
  completeRefund,
  getPayments,
  getReceipt,
  searchProducts,
  getTerminals,
  getSuppliers,
  getWarehouses,
  getInventoryMovements,
  getPurchaseOrders,
  getAccounts,
  createAccount,
  updateAccount,
  getJournalEntries,
  getJournalEntry,
  createJournalEntry,
  postJournalEntry,
  reverseJournalEntry,
  getLedger,
  getTrialBalance,
  getProfitLoss,
  getBalanceSheet,
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  getBills,
  getBill,
  createBill,
  updateBill,
  deleteBill,
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  getBankAccounts,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
  getBankTransactions,
  createBankTransaction,
  getBankReconciliations,
  createBankReconciliation,
  getFiscalYears,
  createFiscalYear,
  updateFiscalYear,
  deleteFiscalYear,
  getAccountingPeriods,
  createAccountingPeriod,
  getTaxRates,
  createTaxRate,
  updateTaxRate,
  deleteTaxRate,
  getExpenseCategories,
  getQuotes,
  getQuote,
  createQuote,
  updateQuote,
  deleteQuote,
  getSalesOrders,
  getSalesOrder,
  createSalesOrder,
  updateSalesOrder,
  deleteSalesOrder,
  getCreditNotes,
  getCreditNote,
  createCreditNote,
  updateCreditNote,
  deleteCreditNote,
  getDebitNotes,
  getDebitNote,
  createDebitNote,
  updateDebitNote,
  deleteDebitNote,
  getAccountingPayments,
  getAccountingPayment,
  createAccountingPayment,
  updateAccountingPayment,
  deleteAccountingPayment,
  issueInvoice,
  approveBill,
  approveExpense,
  getPaymentAllocations,
  getPaymentAllocation,
  createPaymentAllocation,
  updatePaymentAllocation,
  deletePaymentAllocation,
  createExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory,
  dashboardApi,
  issueCreditNote,
  approveDebitNote,
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getTimesheets,
  getTimesheet,
  createTimesheet,
  updateTimesheet,
  deleteTimesheet,
  getProjectExpenses,
  getProjectExpense,
  createProjectExpense,
  updateProjectExpense,
  deleteProjectExpense,
  getRetainerInvoices,
  getRetainerInvoice,
  createRetainerInvoice,
  updateRetainerInvoice,
  deleteRetainerInvoice,
  getCarts,
  getCart,
  createCart,
  updateCart,
  holdCart,
  recallCart,
  deleteCart,
  getPriceOverrides,
  createPriceOverride,
  approvePriceOverride,
  getCashMovements,
  createCashMovement,
  getLoyalty,
  earnLoyalty,
  redeemLoyalty,
  getStoreCredits,
  createStoreCredit,
  getQuickKeys,
  createQuickKey,
  updateQuickKey,
  deleteQuickKey,
  getUnits,
  createUnit,
  getProductVariants,
  createProductVariant,
  getBatches,
  createBatch,
  getSerialNumbers,
  createSerialNumber,
  getBins,
  createBin,
  getInventoryAdjustments,
  createInventoryAdjustment,
  approveInventoryAdjustment,
  getStocktakes,
  createStocktake,
  approveStocktake,
  getTransfers,
  createTransfer,
  approveTransfer,
  dispatchTransfer,
  receiveTransfer,
  getAssemblies,
  createAssembly,
  completeAssembly,
  getLandedCosts,
  createLandedCost,
  getReplenishmentRules,
  getReplenishmentSuggestions,
  getPriceLists,
  createPriceList,
  getPackages,
  createPackage,
  getShipments,
  createShipment,
  updateShipment,
  getEtimsSubmissions,
  retryEtimsSubmission,
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  convertLead,
  getCrmAccounts,
  getCrmAccount,
  createCrmAccount,
  updateCrmAccount,
  deleteCrmAccount,
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  getDeals,
  getDeal,
  createDeal,
  updateDeal,
  deleteDeal,
  getPipelines,
  getPipeline,
  createPipeline,
  updatePipeline,
  deletePipeline,
  getCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  getCases,
  getCase,
  createCase,
  updateCase,
  deleteCase,
  getDealStages,
  getDealStage,
  createDealStage,
  updateDealStage,
  deleteDealStage,
  getActivities,
  getActivity,
  createActivity,
  updateActivity,
  deleteActivity,
  getCommunications,
  getCommunication,
  createCommunication,
  getWorkflows,
  getWorkflow,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  getSlas,
  getSla,
  createSla,
  updateSla,
  deleteSla,
  getCustomFields,
  getCustomField,
  createCustomField,
  updateCustomField,
  deleteCustomField,
  getTerritories,
  getTerritory,
  createTerritory,
  updateTerritory,
  deleteTerritory,
  getPriceBooks,
  getPriceBook,
  createPriceBook,
  updatePriceBook,
  deletePriceBook,
  getKnowledgeArticles,
  getKnowledgeArticle,
  createKnowledgeArticle,
  updateKnowledgeArticle,
  deleteKnowledgeArticle,
  getSequences,
  getSequence,
  createSequence,
  updateSequence,
  deleteSequence,
  getLeadScoringRules,
  getLeadScoringRule,
  createLeadScoringRule,
  updateLeadScoringRule,
  deleteLeadScoringRule,
  getLeadAssignments,
  getLeadAssignment,
  createLeadAssignment,
  updateLeadAssignment,
  deleteLeadAssignment,
  getPurchaseRequisitions,
  getPurchaseRequisition,
  createPurchaseRequisition,
  updatePurchaseRequisition,
  deletePurchaseRequisition,
  getRfqs,
  getRfq,
  createRfq,
  updateRfq,
  deleteRfq,
  publishRfq,
  closeRfq,
  getTenders,
  getTender,
  createTender,
  updateTender,
  deleteTender,
  getSupplierInvoices,
  getSupplierInvoice,
  createSupplierInvoice,
  updateSupplierInvoice,
  deleteSupplierInvoice,
  getThreeWayMatches,
  getThreeWayMatch,
  createThreeWayMatch,
  updateThreeWayMatch,
  deleteThreeWayMatch,
  getPaymentVouchers,
  getPaymentVoucher,
  createPaymentVoucher,
  updatePaymentVoucher,
  deletePaymentVoucher,
  getSupplierPayments,
  getSupplierPayment,
  createSupplierPayment,
  updateSupplierPayment,
  deleteSupplierPayment,
  getPaymentReconciliations,
  getPaymentReconciliation,
  createPaymentReconciliation,
  updatePaymentReconciliation,
  deletePaymentReconciliation,
  getProcurementContracts,
  getProcurementContract,
  createProcurementContract,
  updateProcurementContract,
  deleteProcurementContract,
  getApprovalRules,
  getApprovalRule,
  createApprovalRule,
  updateApprovalRule,
  deleteApprovalRule,
} from '@/lib/api';
import type { Product, Customer, SyncPushPayload, ReturnModel, Refund, PaymentTransaction, Account, JournalEntry, Invoice, Bill, Expense, BankAccount, BankTransaction, FiscalYear, AccountingPeriod, TaxRate, ExpenseCategory, Quote, SalesOrder, CreditNote, DebitNote, Payment, PaymentAllocation, Project, Task, Timesheet, ProjectExpense, RetainerInvoice, Unit, ProductVariant, Batch, SerialNumber, Bin, InventoryAdjustment, Stocktake, TransferOrder, Assembly, LandedCost, ReplenishmentRule, PriceList, Package, Shipment, EtimsStockSubmission, Lead, CrmAccount, Contact, Deal, Pipeline, Campaign, CaseModel, DealStage, Activity, Communication, Workflow, SlaPolicy, CustomFieldDefinition, LeadScoringRule, LeadAssignment, Territory, PriceBook, KnowledgeArticle, Sequence, PurchaseRequisition, Rfq, Tender, SupplierInvoice, ThreeWayMatch, PaymentVoucher, SupplierPayment, PaymentReconciliation, ProcurementContract, ApprovalRule } from '@soko/domain-types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
const DEVICE_ID = process.env.NEXT_PUBLIC_DEVICE_ID || 'pos-device-1';
const BRANCH_ID = process.env.NEXT_PUBLIC_BRANCH_ID || 'branch-1';

export function useSokoQueryClient() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
        retry: (failureCount, error) => {
          if (error instanceof Error && error.message.includes('401')) return false;
          return failureCount < 3;
        },
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: false,
      },
    },
  }));
  return queryClient;
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const queryClient = useSokoQueryClient();
  return (
    <TanStackQueryProvider client={queryClient}>
      {children}
    </TanStackQueryProvider>
  );
}

export function useProducts() {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.products.list(),
    queryFn: () => getProducts(() => token, API_BASE_URL),
    enabled: !!token,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: Partial<Product>) => createProduct(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
}

export function useSales(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.sales.list(params),
    queryFn: () => getSales(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => createSale(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sales.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.shifts.current });
    },
  });
}

// Carts
export function useCarts(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['carts', params],
    queryFn: () => getCarts(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useCart(id: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['carts', id],
    queryFn: () => getCart(() => token, API_BASE_URL, id),
    enabled: !!token && !!id,
  });
}

export function useCreateCart() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => createCart(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carts'] });
    },
  });
}

export function useHoldCart() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => holdCart(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carts'] });
    },
  });
}

export function useRecallCart() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => recallCart(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carts'] });
    },
  });
}

export function useUpdateCart() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => updateCart(() => token, API_BASE_URL, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carts'] });
    },
  });
}

export function useDeleteCart() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteCart(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carts'] });
    },
  });
}

// Price Overrides
export function usePriceOverrides(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['price-overrides', params],
    queryFn: () => getPriceOverrides(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useCreatePriceOverride() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => createPriceOverride(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-overrides'] });
    },
  });
}

export function useApprovePriceOverride() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => approvePriceOverride(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-overrides'] });
    },
  });
}

// Cash Movements
export function useCashMovements(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['cash-movements', params],
    queryFn: () => getCashMovements(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useCreateCashMovement() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => createCashMovement(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-movements'] });
    },
  });
}

// Loyalty
export function useLoyalty(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['loyalty', params],
    queryFn: () => getLoyalty(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useEarnLoyalty() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ customerId, data }: { customerId: string; data: Record<string, unknown> }) =>
      earnLoyalty(() => token, API_BASE_URL, customerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyalty'] });
    },
  });
}

export function useRedeemLoyalty() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ customerId, data }: { customerId: string; data: Record<string, unknown> }) =>
      redeemLoyalty(() => token, API_BASE_URL, customerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyalty'] });
    },
  });
}

// Store Credits
export function useStoreCredits(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['store-credits', params],
    queryFn: () => getStoreCredits(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useCreateStoreCredit() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => createStoreCredit(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-credits'] });
    },
  });
}

// Quick Keys
export function useQuickKeys(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['quick-keys', params],
    queryFn: () => getQuickKeys(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useCreateQuickKey() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => createQuickKey(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quick-keys'] });
    },
  });
}

export function useUpdateQuickKey() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => updateQuickKey(() => token, API_BASE_URL, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quick-keys'] });
    },
  });
}

export function useDeleteQuickKey() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteQuickKey(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quick-keys'] });
    },
  });
}

export function useDashboard() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi(() => token, API_BASE_URL),
    enabled: !!token,
  });
}

export function useCustomers() {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.customers.list(),
    queryFn: () => getCustomers(() => token, API_BASE_URL),
    enabled: !!token,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: Partial<Customer>) => createCustomer(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
    },
  });
}

export function useCurrentShift() {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.shifts.current,
    queryFn: () => getCurrentShift(() => token, API_BASE_URL),
    enabled: !!token,
  });
}

export function useOpenShift() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: { opening_float_minor: number; notes?: string }) =>
      openShift(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shifts.current });
    },
  });
}

export function useCloseShift() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: { actual_cash_minor: number; notes?: string }) =>
      closeShift(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shifts.current });
    },
  });
}

export function usePosXRead(enabled = true) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['pos-reports', 'x-read'],
    queryFn: () => fetch(`${API_BASE_URL}/api/v1/pos/reports/x-read`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => res.json()),
    enabled: enabled && !!token,
  });
}

export function usePosZRead(enabled = true) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['pos-reports', 'z-read'],
    queryFn: () => fetch(`${API_BASE_URL}/api/v1/pos/reports/z-read`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => res.json()),
    enabled: enabled && !!token,
  });
}

export function usePosTopProducts(enabled = true) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['pos-reports', 'top-products'],
    queryFn: () => fetch(`${API_BASE_URL}/api/v1/pos/reports/top-products`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => res.json()),
    enabled: enabled && !!token,
  });
}

export function usePushSync() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: (payload: SyncPushPayload) => pushSync(() => token, API_BASE_URL, payload),
  });
}

export function usePullSync() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: (payload: { since_cursor: string }) =>
      pullSync(() => token, API_BASE_URL, {
        ...payload,
        device_id: DEVICE_ID,
        branch_id: BRANCH_ID,
      }),
  });
}

export function useLogin() {
  const { login } = useAuth();
  return useMutation({
    mutationFn: (credentials: { email: string; password: string; device_uuid?: string }) =>
      login(credentials.email, credentials.password, credentials.device_uuid),
  });
}

export function useLogout() {
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

export function useReturns(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.returns.list(params),
    queryFn: () => getReturns(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useCreateReturn() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => createReturn(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.returns.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.sales.all });
    },
  });
}

export function useRefunds(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.refunds.list(params),
    queryFn: () => getRefunds(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useCreateRefund() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => createRefund(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.refunds.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.sales.all });
    },
  });
}

export function useCompleteRefund() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => completeRefund(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.refunds.all });
    },
  });
}

export function usePayments(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.payments.list(params),
    queryFn: () => getPayments(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useProductSearch(query: string, limit = 20) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['products', 'search', query, limit],
    queryFn: () => searchProducts(() => token, API_BASE_URL, query, limit),
    enabled: !!token && query.length >= 2,
  });
}

export function useTerminals() {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.terminals.list(),
    queryFn: () => getTerminals(() => token, API_BASE_URL),
    enabled: !!token,
  });
}

export function useSuppliers() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: () => getSuppliers(() => token, API_BASE_URL),
    enabled: !!token,
  });
}

export function useReceipt(saleId: string, format: 'html' | 'escpos' = 'html') {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['sales', saleId, 'receipt', format],
    queryFn: () => getReceipt(() => token, API_BASE_URL, saleId, format),
    enabled: !!token && !!saleId,
  });
}

// Accounts
export function useAccounts(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.accounts.list(params),
    queryFn: () => getAccounts(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: Partial<Account>) => createAccount(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Account> }) =>
      updateAccount(() => token, API_BASE_URL, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
    },
  });
}

// Journal entries
export function useJournalEntries(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.journalEntries.list(params),
    queryFn: () => getJournalEntries(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useJournalEntry(id: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.journalEntries.detail(id),
    queryFn: () => getJournalEntry(() => token, API_BASE_URL, id),
    enabled: !!token && !!id,
  });
}

export function useCreateJournalEntry() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: unknown) => createJournalEntry(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.journalEntries.all });
    },
  });
}

export function usePostJournalEntry() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => postJournalEntry(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.journalEntries.all });
    },
  });
}

export function useReverseJournalEntry() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => reverseJournalEntry(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.journalEntries.all });
    },
  });
}

// Reports
export function useLedger(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.reports.ledger,
    queryFn: () => getLedger(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useTrialBalance(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.reports.trialBalance,
    queryFn: () => getTrialBalance(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useProfitLoss(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.reports.profitLoss,
    queryFn: () => getProfitLoss(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useBalanceSheet(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.reports.balanceSheet,
    queryFn: () => getBalanceSheet(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

// Invoices
export function useInvoices(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.invoices.list(params),
    queryFn: () => getInvoices(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useInvoice(id: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.invoices.detail(id),
    queryFn: () => getInvoice(() => token, API_BASE_URL, id),
    enabled: !!token && !!id,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: unknown) => createInvoice(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all });
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      updateInvoice(() => token, API_BASE_URL, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all });
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteInvoice(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all });
    },
  });
}

export function useIssueInvoice() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => issueInvoice(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all });
    },
  });
}

// Bills
export function useBills(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.bills.list(params),
    queryFn: () => getBills(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useBill(id: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.bills.detail(id),
    queryFn: () => getBill(() => token, API_BASE_URL, id),
    enabled: !!token && !!id,
  });
}

export function useCreateBill() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: unknown) => createBill(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bills.all });
    },
  });
}

export function useUpdateBill() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      updateBill(() => token, API_BASE_URL, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bills.all });
    },
  });
}

export function useDeleteBill() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteBill(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bills.all });
    },
  });
}

export function useApproveBill() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => approveBill(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bills.all });
    },
  });
}

// Expenses
export function useExpenses(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.expenses.list(params),
    queryFn: () => getExpenses(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useExpense(id: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.expenses.detail(id),
    queryFn: () => getExpense(() => token, API_BASE_URL, id),
    enabled: !!token && !!id,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: unknown) => createExpense(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      updateExpense(() => token, API_BASE_URL, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteExpense(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
    },
  });
}

export function useApproveExpense() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => approveExpense(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
    },
  });
}

// Bank accounts
export function useBankAccounts(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.bankAccounts.list(params),
    queryFn: () => getBankAccounts(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useCreateBankAccount() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: unknown) => createBankAccount(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bankAccounts.all });
    },
  });
}

export function useUpdateBankAccount() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      updateBankAccount(() => token, API_BASE_URL, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bankAccounts.all });
    },
  });
}

export function useDeleteBankAccount() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteBankAccount(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bankAccounts.all });
    },
  });
}

// Bank transactions
export function useBankTransactions(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.bankTransactions.list(params),
    queryFn: () => getBankTransactions(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useCreateBankTransaction() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: unknown) => createBankTransaction(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bankTransactions.all });
    },
  });
}

// Bank reconciliations
export function useBankReconciliations(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['bank-reconciliations', params],
    queryFn: () => getBankReconciliations(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useCreateBankReconciliation() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: unknown) => createBankReconciliation(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-reconciliations'] });
    },
  });
}

// Fiscal years
export function useFiscalYears(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.fiscalYears.list(params),
    queryFn: () => getFiscalYears(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useCreateFiscalYear() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: unknown) => createFiscalYear(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fiscalYears.all });
    },
  });
}

export function useUpdateFiscalYear() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      updateFiscalYear(() => token, API_BASE_URL, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fiscalYears.all });
    },
  });
}

export function useDeleteFiscalYear() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteFiscalYear(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fiscalYears.all });
    },
  });
}

// Accounting periods
export function useAccountingPeriods(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.accountingPeriods.list(params),
    queryFn: () => getAccountingPeriods(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useCreateAccountingPeriod() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: unknown) => createAccountingPeriod(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accountingPeriods.all });
    },
  });
}

// Tax rates
export function useTaxRates(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.taxRates.list(params),
    queryFn: () => getTaxRates(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useCreateTaxRate() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: unknown) => createTaxRate(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.taxRates.all });
    },
  });
}

export function useUpdateTaxRate() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      updateTaxRate(() => token, API_BASE_URL, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.taxRates.all });
    },
  });
}

export function useDeleteTaxRate() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteTaxRate(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.taxRates.all });
    },
  });
}

// Expense categories
export function useExpenseCategories(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['expense-categories', params],
    queryFn: () => getExpenseCategories(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useCreateExpenseCategory() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: unknown) => createExpenseCategory(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
    },
  });
}

export function useUpdateExpenseCategory() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      updateExpenseCategory(() => token, API_BASE_URL, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
    },
  });
}

export function useDeleteExpenseCategory() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteExpenseCategory(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
    },
  });
}

// Quotes
export function useQuotes(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['quotes', params],
    queryFn: () => getQuotes(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useQuote(id: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['quotes', id],
    queryFn: () => getQuote(() => token, API_BASE_URL, id),
    enabled: !!token && !!id,
  });
}

export function useCreateQuote() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: unknown) => createQuote(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
  });
}

export function useUpdateQuote() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      updateQuote(() => token, API_BASE_URL, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
  });
}

export function useDeleteQuote() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteQuote(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
  });
}

// Sales Orders
export function useSalesOrders(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['sales-orders', params],
    queryFn: () => getSalesOrders(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useSalesOrder(id: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['sales-orders', id],
    queryFn: () => getSalesOrder(() => token, API_BASE_URL, id),
    enabled: !!token && !!id,
  });
}

export function useCreateSalesOrder() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: unknown) => createSalesOrder(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-orders'] });
    },
  });
}

export function useUpdateSalesOrder() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      updateSalesOrder(() => token, API_BASE_URL, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-orders'] });
    },
  });
}

export function useDeleteSalesOrder() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteSalesOrder(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-orders'] });
    },
  });
}

// Credit Notes
export function useCreditNotes(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['credit-notes', params],
    queryFn: () => getCreditNotes(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useCreditNote(id: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['credit-notes', id],
    queryFn: () => getCreditNote(() => token, API_BASE_URL, id),
    enabled: !!token && !!id,
  });
}

export function useCreateCreditNote() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: unknown) => createCreditNote(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-notes'] });
    },
  });
}

export function useUpdateCreditNote() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      updateCreditNote(() => token, API_BASE_URL, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-notes'] });
    },
  });
}

export function useDeleteCreditNote() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteCreditNote(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-notes'] });
    },
  });
}

export function useIssueCreditNote() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => issueCreditNote(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-notes'] });
    },
  });
}

// Debit Notes
export function useDebitNotes(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['debit-notes', params],
    queryFn: () => getDebitNotes(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useDebitNote(id: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['debit-notes', id],
    queryFn: () => getDebitNote(() => token, API_BASE_URL, id),
    enabled: !!token && !!id,
  });
}

export function useCreateDebitNote() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: unknown) => createDebitNote(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debit-notes'] });
    },
  });
}

export function useUpdateDebitNote() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      updateDebitNote(() => token, API_BASE_URL, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debit-notes'] });
    },
  });
}

export function useDeleteDebitNote() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteDebitNote(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debit-notes'] });
    },
  });
}

export function useApproveDebitNote() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => approveDebitNote(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debit-notes'] });
    },
  });
}

// Projects
export function useProjects(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => getProjects(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useProject(id: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => getProject(() => token, API_BASE_URL, id),
    enabled: !!token && !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: unknown) => createProject(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      updateProject(() => token, API_BASE_URL, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteProject(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

// Tasks
export function useTasks(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: () => getTasks(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useTask(id: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: () => getTask(() => token, API_BASE_URL, id),
    enabled: !!token && !!id,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: unknown) => createTask(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      updateTask(() => token, API_BASE_URL, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteTask(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

// Timesheets
export function useTimesheets(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['timesheets', params],
    queryFn: () => getTimesheets(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useTimesheet(id: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['timesheets', id],
    queryFn: () => getTimesheet(() => token, API_BASE_URL, id),
    enabled: !!token && !!id,
  });
}

export function useCreateTimesheet() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: unknown) => createTimesheet(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheets'] });
    },
  });
}

export function useUpdateTimesheet() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      updateTimesheet(() => token, API_BASE_URL, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheets'] });
    },
  });
}

export function useDeleteTimesheet() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteTimesheet(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheets'] });
    },
  });
}

// Project Expenses
export function useProjectExpenses(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['project-expenses', params],
    queryFn: () => getProjectExpenses(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useProjectExpense(id: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['project-expenses', id],
    queryFn: () => getProjectExpense(() => token, API_BASE_URL, id),
    enabled: !!token && !!id,
  });
}

export function useCreateProjectExpense() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: unknown) => createProjectExpense(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-expenses'] });
    },
  });
}

export function useUpdateProjectExpense() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      updateProjectExpense(() => token, API_BASE_URL, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-expenses'] });
    },
  });
}

export function useDeleteProjectExpense() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteProjectExpense(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-expenses'] });
    },
  });
}

// Retainer Invoices
export function useRetainerInvoices(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['retainer-invoices', params],
    queryFn: () => getRetainerInvoices(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useRetainerInvoice(id: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['retainer-invoices', id],
    queryFn: () => getRetainerInvoice(() => token, API_BASE_URL, id),
    enabled: !!token && !!id,
  });
}

export function useCreateRetainerInvoice() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: unknown) => createRetainerInvoice(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retainer-invoices'] });
    },
  });
}

export function useUpdateRetainerInvoice() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      updateRetainerInvoice(() => token, API_BASE_URL, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retainer-invoices'] });
    },
  });
}

export function useDeleteRetainerInvoice() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteRetainerInvoice(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retainer-invoices'] });
    },
  });
}

// Accounting Payments
export function useAccountingPayments(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['accounting-payments', params],
    queryFn: () => getAccountingPayments(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useAccountingPayment(id: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['accounting-payments', id],
    queryFn: () => getAccountingPayment(() => token, API_BASE_URL, id),
    enabled: !!token && !!id,
  });
}

export function useCreateAccountingPayment() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: unknown) => createAccountingPayment(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounting-payments'] });
    },
  });
}

export function useUpdateAccountingPayment() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      updateAccountingPayment(() => token, API_BASE_URL, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounting-payments'] });
    },
  });
}

export function useDeleteAccountingPayment() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteAccountingPayment(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounting-payments'] });
    },
  });
}

// Payment Allocations
export function usePaymentAllocations(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['payment-allocations', params],
    queryFn: () => getPaymentAllocations(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function usePaymentAllocation(id: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['payment-allocations', id],
    queryFn: () => getPaymentAllocation(() => token, API_BASE_URL, id),
    enabled: !!token && !!id,
  });
}

export function useCreatePaymentAllocation() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: unknown) => createPaymentAllocation(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-allocations'] });
    },
  });
}

export function useUpdatePaymentAllocation() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      updatePaymentAllocation(() => token, API_BASE_URL, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-allocations'] });
    },
  });
}

export function useDeletePaymentAllocation() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deletePaymentAllocation(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-allocations'] });
    },
  });
}

// Accounting period lock check
export function useIsPeriodLocked(date?: string) {
  const { token } = useAuth();
  const { data: periodsData } = useAccountingPeriods();

  const periods = periodsData?.data ?? [];

  return {
    isLocked: date ? periods.some((p: AccountingPeriod) => {
      if (!date || !p.start_date || !p.end_date) return false;
      return (p.status === 'closed' || p.status === 'locked') && date >= p.start_date && date <= p.end_date;
    }) : false,
    lockedPeriod: date ? periods.find((p: AccountingPeriod) => {
      if (!date || !p.start_date || !p.end_date) return false;
      return (p.status === 'closed' || p.status === 'locked') && date >= p.start_date && date <= p.end_date;
    }) : undefined,
  };
}

// Units
export function useUnits(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['units', params],
    queryFn: () => getUnits(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useCreateUnit() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => createUnit(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
    },
  });
}

// Product Variants
export function useProductVariants(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['product-variants', params],
    queryFn: () => getProductVariants(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useCreateProductVariant() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => createProductVariant(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-variants'] });
    },
  });
}

// Batches
export function useBatches(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['batches', params],
    queryFn: () => getBatches(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useCreateBatch() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => createBatch(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
    },
  });
}

// Serial Numbers
export function useSerialNumbers(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['serial-numbers', params],
    queryFn: () => getSerialNumbers(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useCreateSerialNumber() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => createSerialNumber(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serial-numbers'] });
    },
  });
}

// Bins
export function useBins(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['bins', params],
    queryFn: () => getBins(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useCreateBin() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => createBin(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bins'] });
    },
  });
}

// Inventory Adjustments
export function useInventoryAdjustments(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['inventory-adjustments', params],
    queryFn: () => getInventoryAdjustments(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useCreateInventoryAdjustment() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => createInventoryAdjustment(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-adjustments'] });
    },
  });
}

export function useApproveInventoryAdjustment() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => approveInventoryAdjustment(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-adjustments'] });
    },
  });
}

// Stocktakes
export function useStocktakes(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['stocktakes', params],
    queryFn: () => getStocktakes(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useCreateStocktake() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => createStocktake(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stocktakes'] });
    },
  });
}

export function useApproveStocktake() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => approveStocktake(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stocktakes'] });
    },
  });
}

// Transfers
export function useTransfers(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['transfers', params],
    queryFn: () => getTransfers(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useCreateTransfer() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => createTransfer(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
    },
  });
}

export function useApproveTransfer() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => approveTransfer(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
    },
  });
}

export function useDispatchTransfer() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => dispatchTransfer(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
    },
  });
}

export function useReceiveTransfer() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => receiveTransfer(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
    },
  });
}

// Assemblies
export function useAssemblies(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['assemblies', params],
    queryFn: () => getAssemblies(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useCreateAssembly() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => createAssembly(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assemblies'] });
    },
  });
}

export function useCompleteAssembly() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => completeAssembly(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assemblies'] });
    },
  });
}

// Landed Costs
export function useLandedCosts(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['landed-costs', params],
    queryFn: () => getLandedCosts(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useCreateLandedCost() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => createLandedCost(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landed-costs'] });
    },
  });
}

// Replenishment
export function useReplenishmentRules() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['replenishment-rules'],
    queryFn: () => getReplenishmentRules(() => token, API_BASE_URL),
    enabled: !!token,
  });
}

export function useReplenishmentSuggestions() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['replenishment-suggestions'],
    queryFn: () => getReplenishmentSuggestions(() => token, API_BASE_URL),
    enabled: !!token,
  });
}

// Price Lists
export function usePriceLists(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['price-lists', params],
    queryFn: () => getPriceLists(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useCreatePriceList() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => createPriceList(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-lists'] });
    },
  });
}

// Packages
export function usePackages(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['packages', params],
    queryFn: () => getPackages(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useCreatePackage() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => createPackage(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    },
  });
}

// Shipments
export function useShipments(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['shipments', params],
    queryFn: () => getShipments(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useCreateShipment() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => createShipment(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
    },
  });
}

export function useUpdateShipment() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => updateShipment(() => token, API_BASE_URL, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
    },
  });
}

// eTIMS
export function useEtimsSubmissions(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['etims', params],
    queryFn: () => getEtimsSubmissions(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useRetryEtimsSubmission() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => retryEtimsSubmission(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['etims'] });
    },
  });
}

export function useWarehouses() {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.warehouses.all,
    queryFn: () => getWarehouses(() => token, API_BASE_URL),
    enabled: !!token,
  });
}

export function useInventoryMovements(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['inventory-movements', params],
    queryFn: () => getInventoryMovements(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function usePurchaseOrders(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['purchase-orders', params],
    queryFn: () => getPurchaseOrders(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

// CRM - Leads
export function useLeads(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.leads.list(params),
    queryFn: () => getLeads(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useLead(id: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.leads.detail(id),
    queryFn: () => getLead(() => token, API_BASE_URL, id),
    enabled: !!token && !!id,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: Partial<Lead>) => createLead(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.all });
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Lead> }) => updateLead(() => token, API_BASE_URL, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.all });
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteLead(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.all });
    },
  });
}

export function useConvertLead() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: Record<string, unknown> }) => convertLead(() => token, API_BASE_URL, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.all });
    },
  });
}

// CRM - Accounts
export function useCrmAccounts(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.crmAccounts.list(params),
    queryFn: () => getCrmAccounts(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useCrmAccount(id: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.crmAccounts.detail(id),
    queryFn: () => getCrmAccount(() => token, API_BASE_URL, id),
    enabled: !!token && !!id,
  });
}

export function useCreateCrmAccount() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: Partial<CrmAccount>) => createCrmAccount(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.crmAccounts.all });
    },
  });
}

export function useUpdateCrmAccount() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CrmAccount> }) => updateCrmAccount(() => token, API_BASE_URL, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.crmAccounts.all });
    },
  });
}

export function useDeleteCrmAccount() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteCrmAccount(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.crmAccounts.all });
    },
  });
}

// CRM - Contacts
export function useContacts(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.contacts.list(params),
    queryFn: () => getContacts(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useContact(id: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.contacts.detail(id),
    queryFn: () => getContact(() => token, API_BASE_URL, id),
    enabled: !!token && !!id,
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: Partial<Contact>) => createContact(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all });
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Contact> }) => updateContact(() => token, API_BASE_URL, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteContact(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all });
    },
  });
}

// CRM - Deals
export function useDeals(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.deals.list(params),
    queryFn: () => getDeals(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useDeal(id: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.deals.detail(id),
    queryFn: () => getDeal(() => token, API_BASE_URL, id),
    enabled: !!token && !!id,
  });
}

export function useCreateDeal() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: Partial<Deal>) => createDeal(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.deals.all });
    },
  });
}

export function useUpdateDeal() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Deal> }) => updateDeal(() => token, API_BASE_URL, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.deals.all });
    },
  });
}

export function useDeleteDeal() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteDeal(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.deals.all });
    },
  });
}

// CRM - Pipelines
export function usePipelines(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.pipelines.list(params),
    queryFn: () => getPipelines(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function usePipeline(id: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.pipelines.detail(id),
    queryFn: () => getPipeline(() => token, API_BASE_URL, id),
    enabled: !!token && !!id,
  });
}

export function useCreatePipeline() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: Partial<Pipeline>) => createPipeline(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pipelines.all });
    },
  });
}

export function useUpdatePipeline() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Pipeline> }) => updatePipeline(() => token, API_BASE_URL, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pipelines.all });
    },
  });
}

export function useDeletePipeline() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deletePipeline(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pipelines.all });
    },
  });
}

// CRM - Campaigns
export function useCampaigns(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.campaigns.list(params),
    queryFn: () => getCampaigns(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useCampaign(id: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.campaigns.detail(id),
    queryFn: () => getCampaign(() => token, API_BASE_URL, id),
    enabled: !!token && !!id,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: Partial<Campaign>) => createCampaign(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.all });
    },
  });
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Campaign> }) => updateCampaign(() => token, API_BASE_URL, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.all });
    },
  });
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteCampaign(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.all });
    },
  });
}

// CRM - Cases
export function useCases(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.cases.list(params),
    queryFn: () => getCases(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useCase(id: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.cases.detail(id),
    queryFn: () => getCase(() => token, API_BASE_URL, id),
    enabled: !!token && !!id,
  });
}

export function useCreateCase() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: Partial<CaseModel>) => createCase(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cases.all });
    },
  });
}

export function useUpdateCase() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CaseModel> }) => updateCase(() => token, API_BASE_URL, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cases.all });
    },
  });
}

export function useDeleteCase() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteCase(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cases.all });
    },
  });
}

// CRM - Deal Stages
export function useDealStages(pipelineId: string, params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.dealStages.list(params),
    queryFn: () => getDealStages(() => token, API_BASE_URL, pipelineId, params),
    enabled: !!token && !!pipelineId,
  });
}

export function useDealStage(pipelineId: string, id: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.dealStages.detail(id),
    queryFn: () => getDealStage(() => token, API_BASE_URL, pipelineId, id),
    enabled: !!token && !!pipelineId && !!id,
  });
}

export function useCreateDealStage() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ pipelineId, data }: { pipelineId: string; data: Partial<DealStage> }) => createDealStage(() => token, API_BASE_URL, pipelineId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dealStages.all });
    },
  });
}

export function useUpdateDealStage() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ pipelineId, id, data }: { pipelineId: string; id: string; data: Partial<DealStage> }) => updateDealStage(() => token, API_BASE_URL, pipelineId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dealStages.all });
    },
  });
}

export function useDeleteDealStage() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ pipelineId, id }: { pipelineId: string; id: string }) => deleteDealStage(() => token, API_BASE_URL, pipelineId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dealStages.all });
    },
  });
}

// CRM - Activities
export function useActivities(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.activities.list(params),
    queryFn: () => getActivities(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useActivity(id: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.activities.detail(id),
    queryFn: () => getActivity(() => token, API_BASE_URL, id),
    enabled: !!token && !!id,
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: Partial<Activity>) => createActivity(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.activities.all });
    },
  });
}

export function useUpdateActivity() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Activity> }) => updateActivity(() => token, API_BASE_URL, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.activities.all });
    },
  });
}

export function useDeleteActivity() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteActivity(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.activities.all });
    },
  });
}

// CRM - Communications
export function useCommunications(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.communications.list(params),
    queryFn: () => getCommunications(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useCommunication(id: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.communications.detail(id),
    queryFn: () => getCommunication(() => token, API_BASE_URL, id),
    enabled: !!token && !!id,
  });
}

export function useCreateCommunication() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: Partial<Communication>) => createCommunication(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.communications.all });
    },
  });
}

// CRM - Workflows
export function useWorkflows(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.workflows.list(params),
    queryFn: () => getWorkflows(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useWorkflow(id: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.workflows.detail(id),
    queryFn: () => getWorkflow(() => token, API_BASE_URL, id),
    enabled: !!token && !!id,
  });
}

export function useCreateWorkflow() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: Partial<Workflow>) => createWorkflow(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows.all });
    },
  });
}

export function useUpdateWorkflow() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Workflow> }) => updateWorkflow(() => token, API_BASE_URL, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows.all });
    },
  });
}

export function useDeleteWorkflow() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteWorkflow(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows.all });
    },
  });
}

// CRM - SLA Policies
export function useSlas(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.slas.list(params),
    queryFn: () => getSlas(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useSla(id: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.slas.detail(id),
    queryFn: () => getSla(() => token, API_BASE_URL, id),
    enabled: !!token && !!id,
  });
}

export function useCreateSla() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: Partial<SlaPolicy>) => createSla(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.slas.all });
    },
  });
}

export function useUpdateSla() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SlaPolicy> }) => updateSla(() => token, API_BASE_URL, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.slas.all });
    },
  });
}

export function useDeleteSla() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteSla(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.slas.all });
    },
  });
}

// CRM - Custom Fields
export function useCustomFields(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.customFields.list(params),
    queryFn: () => getCustomFields(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useCustomField(id: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.customFields.detail(id),
    queryFn: () => getCustomField(() => token, API_BASE_URL, id),
    enabled: !!token && !!id,
  });
}

export function useCreateCustomField() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: Partial<CustomFieldDefinition>) => createCustomField(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customFields.all });
    },
  });
}

export function useUpdateCustomField() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CustomFieldDefinition> }) => updateCustomField(() => token, API_BASE_URL, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customFields.all });
    },
  });
}

export function useDeleteCustomField() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteCustomField(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customFields.all });
    },
  });
}

// CRM - Territories
export function useTerritories(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.territories.list(params),
    queryFn: () => getTerritories(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useTerritory(id: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.territories.detail(id),
    queryFn: () => getTerritory(() => token, API_BASE_URL, id),
    enabled: !!token && !!id,
  });
}

export function useCreateTerritory() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: Partial<Territory>) => createTerritory(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.territories.all });
    },
  });
}

export function useUpdateTerritory() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Territory> }) => updateTerritory(() => token, API_BASE_URL, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.territories.all });
    },
  });
}

export function useDeleteTerritory() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteTerritory(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.territories.all });
    },
  });
}

// CRM - Price Books
export function usePriceBooks(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.priceBooks.list(params),
    queryFn: () => getPriceBooks(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function usePriceBook(id: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.priceBooks.detail(id),
    queryFn: () => getPriceBook(() => token, API_BASE_URL, id),
    enabled: !!token && !!id,
  });
}

export function useCreatePriceBook() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: Partial<PriceBook>) => createPriceBook(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.priceBooks.all });
    },
  });
}

export function useUpdatePriceBook() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PriceBook> }) => updatePriceBook(() => token, API_BASE_URL, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.priceBooks.all });
    },
  });
}

export function useDeletePriceBook() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deletePriceBook(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.priceBooks.all });
    },
  });
}

// CRM - Knowledge Articles
export function useKnowledgeArticles(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.knowledgeArticles.list(params),
    queryFn: () => getKnowledgeArticles(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useKnowledgeArticle(id: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.knowledgeArticles.detail(id),
    queryFn: () => getKnowledgeArticle(() => token, API_BASE_URL, id),
    enabled: !!token && !!id,
  });
}

export function useCreateKnowledgeArticle() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: Partial<KnowledgeArticle>) => createKnowledgeArticle(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.knowledgeArticles.all });
    },
  });
}

export function useUpdateKnowledgeArticle() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<KnowledgeArticle> }) => updateKnowledgeArticle(() => token, API_BASE_URL, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.knowledgeArticles.all });
    },
  });
}

export function useDeleteKnowledgeArticle() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteKnowledgeArticle(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.knowledgeArticles.all });
    },
  });
}

// CRM - Sequences
export function useSequences(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.sequences.list(params),
    queryFn: () => getSequences(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useSequence(id: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.sequences.detail(id),
    queryFn: () => getSequence(() => token, API_BASE_URL, id),
    enabled: !!token && !!id,
  });
}

export function useCreateSequence() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: Partial<Sequence>) => createSequence(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sequences.all });
    },
  });
}

export function useUpdateSequence() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Sequence> }) => updateSequence(() => token, API_BASE_URL, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sequences.all });
    },
  });
}

export function useDeleteSequence() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteSequence(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sequences.all });
    },
  });
}

// CRM - Lead Scoring Rules
export function useLeadScoringRules(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.leadScoringRules.list(params),
    queryFn: () => getLeadScoringRules(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useLeadScoringRule(id: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.leadScoringRules.detail(id),
    queryFn: () => getLeadScoringRule(() => token, API_BASE_URL, id),
    enabled: !!token && !!id,
  });
}

export function useCreateLeadScoringRule() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: Partial<LeadScoringRule>) => createLeadScoringRule(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leadScoringRules.all });
    },
  });
}

export function useUpdateLeadScoringRule() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LeadScoringRule> }) => updateLeadScoringRule(() => token, API_BASE_URL, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leadScoringRules.all });
    },
  });
}

export function useDeleteLeadScoringRule() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteLeadScoringRule(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leadScoringRules.all });
    },
  });
}

// CRM - Lead Assignments
export function useLeadAssignments(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.leadAssignments.list(params),
    queryFn: () => getLeadAssignments(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useLeadAssignment(id: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.leadAssignments.detail(id),
    queryFn: () => getLeadAssignment(() => token, API_BASE_URL, id),
    enabled: !!token && !!id,
  });
}

export function useCreateLeadAssignment() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: Partial<LeadAssignment>) => createLeadAssignment(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leadAssignments.all });
    },
  });
}

export function useUpdateLeadAssignment() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LeadAssignment> }) => updateLeadAssignment(() => token, API_BASE_URL, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leadAssignments.all });
    },
  });
}

export function useDeleteLeadAssignment() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteLeadAssignment(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leadAssignments.all });
    },
  });
}

// Procurement - Purchase Requisitions
export function usePurchaseRequisitions(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.procurement.requisitions.list(params),
    queryFn: () => getPurchaseRequisitions(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function usePurchaseRequisition(id: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.procurement.requisitions.detail(id),
    queryFn: () => getPurchaseRequisition(() => token, API_BASE_URL, id),
    enabled: !!token && !!id,
  });
}

export function useCreatePurchaseRequisition() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: Partial<PurchaseRequisition>) => createPurchaseRequisition(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.procurement.requisitions.all });
    },
  });
}

export function useUpdatePurchaseRequisition() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PurchaseRequisition> }) =>
      updatePurchaseRequisition(() => token, API_BASE_URL, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.procurement.requisitions.all });
    },
  });
}

export function useDeletePurchaseRequisition() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deletePurchaseRequisition(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.procurement.requisitions.all });
    },
  });
}

// Procurement - RFQs
export function useRfqs(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.procurement.rfqs.list(params),
    queryFn: () => getRfqs(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useRfq(id: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.procurement.rfqs.detail(id),
    queryFn: () => getRfq(() => token, API_BASE_URL, id),
    enabled: !!token && !!id,
  });
}

export function useCreateRfq() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: Partial<Rfq>) => createRfq(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.procurement.rfqs.all });
    },
  });
}

export function useUpdateRfq() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Rfq> }) =>
      updateRfq(() => token, API_BASE_URL, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.procurement.rfqs.all });
    },
  });
}

export function useDeleteRfq() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteRfq(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.procurement.rfqs.all });
    },
  });
}

export function usePublishRfq() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => publishRfq(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.procurement.rfqs.all });
    },
  });
}

export function useCloseRfq() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => closeRfq(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.procurement.rfqs.all });
    },
  });
}

// Procurement - Tenders
export function useTenders(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.procurement.tenders.list(params),
    queryFn: () => getTenders(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useTender(id: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.procurement.tenders.detail(id),
    queryFn: () => getTender(() => token, API_BASE_URL, id),
    enabled: !!token && !!id,
  });
}

export function useCreateTender() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: Partial<Tender>) => createTender(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.procurement.tenders.all });
    },
  });
}

export function useUpdateTender() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Tender> }) =>
      updateTender(() => token, API_BASE_URL, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.procurement.tenders.all });
    },
  });
}

export function useDeleteTender() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteTender(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.procurement.tenders.all });
    },
  });
}

// Procurement - Supplier Invoices
export function useSupplierInvoices(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.procurement.invoices.list(params),
    queryFn: () => getSupplierInvoices(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useSupplierInvoice(id: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.procurement.invoices.detail(id),
    queryFn: () => getSupplierInvoice(() => token, API_BASE_URL, id),
    enabled: !!token && !!id,
  });
}

export function useCreateSupplierInvoice() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: Partial<SupplierInvoice>) => createSupplierInvoice(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.procurement.invoices.all });
    },
  });
}

export function useUpdateSupplierInvoice() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SupplierInvoice> }) =>
      updateSupplierInvoice(() => token, API_BASE_URL, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.procurement.invoices.all });
    },
  });
}

export function useDeleteSupplierInvoice() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteSupplierInvoice(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.procurement.invoices.all });
    },
  });
}

// Procurement - Three Way Matches
export function useThreeWayMatches(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.procurement.matches.list(params),
    queryFn: () => getThreeWayMatches(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useThreeWayMatch(id: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.procurement.matches.detail(id),
    queryFn: () => getThreeWayMatch(() => token, API_BASE_URL, id),
    enabled: !!token && !!id,
  });
}

export function useCreateThreeWayMatch() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: Partial<ThreeWayMatch>) => createThreeWayMatch(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.procurement.matches.all });
    },
  });
}

export function useUpdateThreeWayMatch() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ThreeWayMatch> }) =>
      updateThreeWayMatch(() => token, API_BASE_URL, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.procurement.matches.all });
    },
  });
}

export function useDeleteThreeWayMatch() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteThreeWayMatch(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.procurement.matches.all });
    },
  });
}

// Procurement - Payment Vouchers
export function usePaymentVouchers(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.procurement.paymentVouchers.list(params),
    queryFn: () => getPaymentVouchers(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function usePaymentVoucher(id: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.procurement.paymentVouchers.detail(id),
    queryFn: () => getPaymentVoucher(() => token, API_BASE_URL, id),
    enabled: !!token && !!id,
  });
}

export function useCreatePaymentVoucher() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: Partial<PaymentVoucher>) => createPaymentVoucher(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.procurement.paymentVouchers.all });
    },
  });
}

export function useUpdatePaymentVoucher() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PaymentVoucher> }) =>
      updatePaymentVoucher(() => token, API_BASE_URL, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.procurement.paymentVouchers.all });
    },
  });
}

export function useDeletePaymentVoucher() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deletePaymentVoucher(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.procurement.paymentVouchers.all });
    },
  });
}

// Procurement - Supplier Payments
export function useSupplierPayments(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.procurement.payments.list(params),
    queryFn: () => getSupplierPayments(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useSupplierPayment(id: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.procurement.payments.detail(id),
    queryFn: () => getSupplierPayment(() => token, API_BASE_URL, id),
    enabled: !!token && !!id,
  });
}

export function useCreateSupplierPayment() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: Partial<SupplierPayment>) => createSupplierPayment(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.procurement.payments.all });
    },
  });
}

export function useUpdateSupplierPayment() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SupplierPayment> }) =>
      updateSupplierPayment(() => token, API_BASE_URL, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.procurement.payments.all });
    },
  });
}

export function useDeleteSupplierPayment() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteSupplierPayment(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.procurement.payments.all });
    },
  });
}

// Procurement - Payment Reconciliations
export function usePaymentReconciliations(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.procurement.reconciliations.list(params),
    queryFn: () => getPaymentReconciliations(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function usePaymentReconciliation(id: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.procurement.reconciliations.detail(id),
    queryFn: () => getPaymentReconciliation(() => token, API_BASE_URL, id),
    enabled: !!token && !!id,
  });
}

export function useCreatePaymentReconciliation() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: Partial<PaymentReconciliation>) => createPaymentReconciliation(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.procurement.reconciliations.all });
    },
  });
}

export function useUpdatePaymentReconciliation() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PaymentReconciliation> }) =>
      updatePaymentReconciliation(() => token, API_BASE_URL, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.procurement.reconciliations.all });
    },
  });
}

export function useDeletePaymentReconciliation() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deletePaymentReconciliation(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.procurement.reconciliations.all });
    },
  });
}

// Procurement - Contracts
export function useProcurementContracts(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.procurement.contracts.list(params),
    queryFn: () => getProcurementContracts(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useProcurementContract(id: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.procurement.contracts.detail(id),
    queryFn: () => getProcurementContract(() => token, API_BASE_URL, id),
    enabled: !!token && !!id,
  });
}

export function useCreateProcurementContract() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: Partial<ProcurementContract>) => createProcurementContract(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.procurement.contracts.all });
    },
  });
}

export function useUpdateProcurementContract() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProcurementContract> }) =>
      updateProcurementContract(() => token, API_BASE_URL, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.procurement.contracts.all });
    },
  });
}

export function useDeleteProcurementContract() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteProcurementContract(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.procurement.contracts.all });
    },
  });
}

// Procurement - Approval Rules
export function useApprovalRules(params?: Record<string, string>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.procurement.approvalRules.list(params),
    queryFn: () => getApprovalRules(() => token, API_BASE_URL, params),
    enabled: !!token,
  });
}

export function useApprovalRule(id: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.procurement.approvalRules.detail(id),
    queryFn: () => getApprovalRule(() => token, API_BASE_URL, id),
    enabled: !!token && !!id,
  });
}

export function useCreateApprovalRule() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: Partial<ApprovalRule>) => createApprovalRule(() => token, API_BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.procurement.approvalRules.all });
    },
  });
}

export function useUpdateApprovalRule() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ApprovalRule> }) =>
      updateApprovalRule(() => token, API_BASE_URL, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.procurement.approvalRules.all });
    },
  });
}

export function useDeleteApprovalRule() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteApprovalRule(() => token, API_BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.procurement.approvalRules.all });
    },
  });
}
