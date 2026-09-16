import { SokoApiClient } from '@soko/api-client';
import type {
  Product,
  Category,
  Customer,
  Sale,
  CashShift,
  Organization,
  Business,
  Branch,
  Warehouse,
  Terminal,
  Device,
  Supplier,
  PurchaseOrder,
  GoodsReceivedNote,
  Refund,
  ReturnModel,
  Account,
  JournalEntry,
  JournalLine,
  ReportData,
  Invoice,
  InvoiceItem,
  Bill,
  BillItem,
  Expense,
  ExpenseCategory,
  BankAccount,
  BankTransaction,
  BankReconciliation,
  FiscalYear,
  AccountingPeriod,
  TaxRate,
  LedgerLine,
  TrialBalanceRow,
  ProfitLossRow,
  BalanceSheetRow,
  SyncPushPayload,
  SyncPullPayload,
  SyncPullResponse,
  PaymentTransaction,
} from '@soko/domain-types';

let apiClient: SokoApiClient | null = null;

export function getApiClient(baseUrl: string, getToken: () => string | null, getDeviceId?: () => string | null): SokoApiClient {
  if (!apiClient) {
    apiClient = new SokoApiClient({
      baseUrl,
      getToken,
      getDeviceId,
    });
  }
  return apiClient;
}

export function setApiClient(client: SokoApiClient) {
  apiClient = client;
}

// Auth
export async function loginApi(baseUrl: string, credentials: { email: string; password: string; device_uuid?: string }) {
  const client = new SokoApiClient({ baseUrl });
  return client.login(credentials);
}

export async function meApi(getToken: () => string | null, baseUrl: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.me();
}

export async function logoutApi(getToken: () => string | null, baseUrl: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.logout();
}

export async function switchTenantApi(getToken: () => string | null, baseUrl: string, organizationId: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.switchTenant({ organization_id: organizationId });
}

// Subscriptions
export async function getSubscriptions(getToken: () => string | null, baseUrl: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getSubscriptions();
}

// Plans
export async function getPlans(getToken: () => string | null, baseUrl: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getPlans();
}

// Invitations
export async function getInvitations(getToken: () => string | null, baseUrl: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getInvitations();
}

export async function createInvitation(getToken: () => string | null, baseUrl: string, data: Record<string, unknown>) {
  const client = getApiClient(baseUrl, getToken);
  return client.createInvitation(data);
}

export async function acceptInvitation(getToken: () => string | null, baseUrl: string, token: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.acceptInvitation({ token });
}

// Products
export async function getProducts(getToken: () => string | null, baseUrl: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getProducts();
}

export async function createProduct(getToken: () => string | null, baseUrl: string, data: Partial<Product>) {
  const client = getApiClient(baseUrl, getToken);
  return client.createProduct(data);
}

// Sales
export async function getSales(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getSales(params);
}

export async function createSale(getToken: () => string | null, baseUrl: string, data: Record<string, unknown>) {
  const client = getApiClient(baseUrl, getToken);
  return client.createSale(data);
}

// Customers
export async function getCustomers(getToken: () => string | null, baseUrl: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getCustomers();
}

export async function createCustomer(getToken: () => string | null, baseUrl: string, data: Partial<Customer>) {
  const client = getApiClient(baseUrl, getToken);
  return client.createCustomer(data);
}

// Shifts
export async function getCurrentShift(getToken: () => string | null, baseUrl: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getCurrentShift();
}

export async function openShift(getToken: () => string | null, baseUrl: string, data: { opening_float_minor: number; notes?: string }) {
  const client = getApiClient(baseUrl, getToken);
  return client.openShift(data);
}

export async function closeShift(getToken: () => string | null, baseUrl: string, data: { actual_cash_minor: number; notes?: string }) {
  const client = getApiClient(baseUrl, getToken);
  return client.closeShift(data);
}

// Sync
export async function pushSync(getToken: () => string | null, baseUrl: string, payload: SyncPushPayload) {
  const client = getApiClient(baseUrl, getToken);
  return client.pushSync(payload);
}

export async function pullSync(getToken: () => string | null, baseUrl: string, payload: SyncPullPayload) {
  const client = getApiClient(baseUrl, getToken);
  return client.pullSync(payload);
}

// Returns
export async function getReturns(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getReturns(params);
}

export async function createReturn(getToken: () => string | null, baseUrl: string, data: Record<string, unknown>) {
  const client = getApiClient(baseUrl, getToken);
  return client.createReturn(data);
}

// Refunds
export async function getRefunds(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getRefunds(params);
}

export async function createRefund(getToken: () => string | null, baseUrl: string, data: Record<string, unknown>) {
  const client = getApiClient(baseUrl, getToken);
  return client.createRefund(data);
}

export async function completeRefund(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.completeRefund(id);
}

// Payments
export async function getPayments(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getPayments(params);
}

// Receipts
export async function getReceipt(getToken: () => string | null, baseUrl: string, saleId: string, format: 'html' | 'escpos' = 'html'): Promise<Blob> {
  const client = getApiClient(baseUrl, getToken);
  return client.getReceipt(saleId, format);
}

// Product search
export async function searchProducts(getToken: () => string | null, baseUrl: string, query: string, limit = 20) {
  const client = getApiClient(baseUrl, getToken);
  return client.searchProducts(query, limit);
}

// Terminals
export async function getTerminals(getToken: () => string | null, baseUrl: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getTerminals();
}

// Suppliers
export async function getSuppliers(getToken: () => string | null, baseUrl: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getSuppliers();
}

// Expense categories
export async function getExpenseCategories(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getExpenseCategories(params);
}

// Accounts
export async function getAccounts(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getAccounts(params);
}

export async function createAccount(getToken: () => string | null, baseUrl: string, data: Partial<Account>) {
  const client = getApiClient(baseUrl, getToken);
  return client.createAccount(data);
}

export async function updateAccount(getToken: () => string | null, baseUrl: string, id: string, data: Partial<Account>) {
  const client = getApiClient(baseUrl, getToken);
  return client.updateAccount(id, data);
}

// Journal entries
export async function getJournalEntries(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getJournalEntries(params);
}

export async function getJournalEntry(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getJournalEntry(id);
}

export async function createJournalEntry(getToken: () => string | null, baseUrl: string, data: unknown) {
  const client = getApiClient(baseUrl, getToken);
  return client.createJournalEntry(data);
}

export async function postJournalEntry(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.postJournalEntry(id);
}

export async function reverseJournalEntry(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.reverseJournalEntry(id);
}

// Reports
export async function getLedger(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getLedger(params);
}

export async function getTrialBalance(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getTrialBalance(params);
}

export async function getProfitLoss(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getProfitLoss(params);
}

export async function getBalanceSheet(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getBalanceSheet(params);
}

// Invoices
export async function getInvoices(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getInvoices(params);
}

export async function getInvoice(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getInvoice(id);
}

export async function createInvoice(getToken: () => string | null, baseUrl: string, data: unknown) {
  const client = getApiClient(baseUrl, getToken);
  return client.createInvoice(data);
}

export async function updateInvoice(getToken: () => string | null, baseUrl: string, id: string, data: unknown) {
  const client = getApiClient(baseUrl, getToken);
  return client.updateInvoice(id, data);
}

export async function deleteInvoice(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.deleteInvoice(id);
}

// Bills
export async function getBills(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getBills(params);
}

export async function getBill(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getBill(id);
}

export async function createBill(getToken: () => string | null, baseUrl: string, data: unknown) {
  const client = getApiClient(baseUrl, getToken);
  return client.createBill(data);
}

export async function updateBill(getToken: () => string | null, baseUrl: string, id: string, data: unknown) {
  const client = getApiClient(baseUrl, getToken);
  return client.updateBill(id, data);
}

export async function deleteBill(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.deleteBill(id);
}

// Expenses
export async function getExpenses(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getExpenses(params);
}

export async function getExpense(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getExpense(id);
}

export async function createExpense(getToken: () => string | null, baseUrl: string, data: unknown) {
  const client = getApiClient(baseUrl, getToken);
  return client.createExpense(data);
}

export async function updateExpense(getToken: () => string | null, baseUrl: string, id: string, data: unknown) {
  const client = getApiClient(baseUrl, getToken);
  return client.updateExpense(id, data);
}

export async function deleteExpense(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.deleteExpense(id);
}

// Bank accounts
export async function getBankAccounts(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getBankAccounts(params);
}

export async function createBankAccount(getToken: () => string | null, baseUrl: string, data: unknown) {
  const client = getApiClient(baseUrl, getToken);
  return client.createBankAccount(data);
}

export async function updateBankAccount(getToken: () => string | null, baseUrl: string, id: string, data: unknown) {
  const client = getApiClient(baseUrl, getToken);
  return client.updateBankAccount(id, data);
}

export async function deleteBankAccount(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.deleteBankAccount(id);
}

// Bank transactions
export async function getBankTransactions(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getBankTransactions(params);
}

export async function createBankTransaction(getToken: () => string | null, baseUrl: string, data: unknown) {
  const client = getApiClient(baseUrl, getToken);
  return client.createBankTransaction(data);
}

// Bank reconciliations
export async function getBankReconciliations(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getBankReconciliations(params);
}

export async function createBankReconciliation(getToken: () => string | null, baseUrl: string, data: unknown) {
  const client = getApiClient(baseUrl, getToken);
  return client.createBankReconciliation(data);
}

// Fiscal years
export async function getFiscalYears(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getFiscalYears(params);
}

export async function createFiscalYear(getToken: () => string | null, baseUrl: string, data: unknown) {
  const client = getApiClient(baseUrl, getToken);
  return client.createFiscalYear(data);
}

export async function updateFiscalYear(getToken: () => string | null, baseUrl: string, id: string, data: unknown) {
  const client = getApiClient(baseUrl, getToken);
  return client.updateFiscalYear(id, data);
}

export async function deleteFiscalYear(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.deleteFiscalYear(id);
}

// Accounting periods
export async function getAccountingPeriods(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getAccountingPeriods(params);
}

export async function createAccountingPeriod(getToken: () => string | null, baseUrl: string, data: unknown) {
  const client = getApiClient(baseUrl, getToken);
  return client.createAccountingPeriod(data);
}

// Tax rates
export async function getTaxRates(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getTaxRates(params);
}

export async function createTaxRate(getToken: () => string | null, baseUrl: string, data: unknown) {
  const client = getApiClient(baseUrl, getToken);
  return client.createTaxRate(data);
}

export async function updateTaxRate(getToken: () => string | null, baseUrl: string, id: string, data: unknown) {
  const client = getApiClient(baseUrl, getToken);
  return client.updateTaxRate(id, data);
}

export async function deleteTaxRate(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.deleteTaxRate(id);
}
