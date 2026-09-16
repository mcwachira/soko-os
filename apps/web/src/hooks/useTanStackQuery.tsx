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
  getApiClient,
} from '@/lib/api';
import type { Product, Customer, SyncPushPayload, ReturnModel, Refund, PaymentTransaction, Account, JournalEntry, Invoice, Bill, Expense, BankAccount, BankTransaction, FiscalYear, AccountingPeriod, TaxRate, ExpenseCategory } from '@soko/domain-types';

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
