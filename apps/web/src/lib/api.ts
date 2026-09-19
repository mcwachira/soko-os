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
  Payment,
  PaymentAllocation,
  Quote,
  SalesOrder,
  CreditNote,
  DebitNote,
  Project,
  Task,
  Timesheet,
  ProjectExpense,
  RetainerInvoice,
  Lead,
  CrmAccount,
  Contact,
  Deal,
  Pipeline,
  Campaign,
  CaseModel,
  DealStage,
  Activity,
  Communication,
  Workflow,
  SlaPolicy,
  CustomFieldDefinition,
  LeadScoringRule,
  LeadAssignment,
  Territory,
  PriceBook,
  KnowledgeArticle,
  Sequence,
  PurchaseRequisition,
  Rfq,
  Tender,
  SupplierInvoice,
  ThreeWayMatch,
  PaymentVoucher,
  SupplierPayment,
  PaymentReconciliation,
  ProcurementContract,
  ApprovalRule,
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

export async function dashboardApi(getToken: () => string | null, baseUrl: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.dashboard();
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

// Carts
export async function getCarts(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getCarts(params);
}

export async function getCart(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getCart(id);
}

export async function createCart(getToken: () => string | null, baseUrl: string, data: Record<string, unknown>) {
  const client = getApiClient(baseUrl, getToken);
  return client.createCart(data);
}

export async function updateCart(getToken: () => string | null, baseUrl: string, id: string, data: Record<string, unknown>) {
  const client = getApiClient(baseUrl, getToken);
  return client.updateCart(id, data);
}

export async function holdCart(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.holdCart(id);
}

export async function recallCart(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.recallCart(id);
}

export async function deleteCart(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.deleteCart(id);
}

// Price Overrides
export async function getPriceOverrides(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getPriceOverrides(params);
}

export async function createPriceOverride(getToken: () => string | null, baseUrl: string, data: Record<string, unknown>) {
  const client = getApiClient(baseUrl, getToken);
  return client.createPriceOverride(data);
}

export async function approvePriceOverride(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.approvePriceOverride(id);
}

// Cash Movements
export async function getCashMovements(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getCashMovements(params);
}

export async function createCashMovement(getToken: () => string | null, baseUrl: string, data: Record<string, unknown>) {
  const client = getApiClient(baseUrl, getToken);
  return client.createCashMovement(data);
}

// Loyalty
export async function getLoyalty(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getLoyalty(params);
}

export async function earnLoyalty(getToken: () => string | null, baseUrl: string, customerId: string, data: Record<string, unknown>) {
  const client = getApiClient(baseUrl, getToken);
  return client.earnLoyalty(customerId, data);
}

export async function redeemLoyalty(getToken: () => string | null, baseUrl: string, customerId: string, data: Record<string, unknown>) {
  const client = getApiClient(baseUrl, getToken);
  return client.redeemLoyalty(customerId, data);
}

// Store Credits
export async function getStoreCredits(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getStoreCredits(params);
}

export async function createStoreCredit(getToken: () => string | null, baseUrl: string, data: Record<string, unknown>) {
  const client = getApiClient(baseUrl, getToken);
  return client.createStoreCredit(data);
}

// Quick Keys
export async function getQuickKeys(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getQuickKeys(params);
}

export async function createQuickKey(getToken: () => string | null, baseUrl: string, data: Record<string, unknown>) {
  const client = getApiClient(baseUrl, getToken);
  return client.createQuickKey(data);
}

export async function updateQuickKey(getToken: () => string | null, baseUrl: string, id: string, data: Record<string, unknown>) {
  const client = getApiClient(baseUrl, getToken);
  return client.updateQuickKey(id, data);
}

export async function deleteQuickKey(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.deleteQuickKey(id);
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

export async function issueInvoice(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.request(`/api/v1/invoices/${id}/issue`, { method: 'POST' });
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

export async function approveBill(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.request(`/api/v1/bills/${id}/approve`, { method: 'POST' });
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

export async function approveExpense(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.request(`/api/v1/expenses/${id}/approve`, { method: 'POST' });
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

// Quotes
export async function getQuotes(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getQuotes(params);
}

export async function getQuote(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getQuote(id);
}

export async function createQuote(getToken: () => string | null, baseUrl: string, data: unknown) {
  const client = getApiClient(baseUrl, getToken);
  return client.createQuote(data);
}

export async function updateQuote(getToken: () => string | null, baseUrl: string, id: string, data: unknown) {
  const client = getApiClient(baseUrl, getToken);
  return client.updateQuote(id, data);
}

export async function deleteQuote(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.deleteQuote(id);
}

// Sales Orders
export async function getSalesOrders(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getSalesOrders(params);
}

export async function getSalesOrder(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getSalesOrder(id);
}

export async function createSalesOrder(getToken: () => string | null, baseUrl: string, data: unknown) {
  const client = getApiClient(baseUrl, getToken);
  return client.createSalesOrder(data);
}

export async function updateSalesOrder(getToken: () => string | null, baseUrl: string, id: string, data: unknown) {
  const client = getApiClient(baseUrl, getToken);
  return client.updateSalesOrder(id, data);
}

export async function deleteSalesOrder(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.deleteSalesOrder(id);
}

// Projects
export async function getProjects(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getProjects(params);
}

export async function getProject(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getProject(id);
}

export async function createProject(getToken: () => string | null, baseUrl: string, data: unknown) {
  const client = getApiClient(baseUrl, getToken);
  return client.createProject(data);
}

export async function updateProject(getToken: () => string | null, baseUrl: string, id: string, data: unknown) {
  const client = getApiClient(baseUrl, getToken);
  return client.updateProject(id, data);
}

export async function deleteProject(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.deleteProject(id);
}

export async function getTasks(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getTasks(params);
}

export async function getTask(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getTask(id);
}

export async function createTask(getToken: () => string | null, baseUrl: string, data: unknown) {
  const client = getApiClient(baseUrl, getToken);
  return client.createTask(data);
}

export async function updateTask(getToken: () => string | null, baseUrl: string, id: string, data: unknown) {
  const client = getApiClient(baseUrl, getToken);
  return client.updateTask(id, data);
}

export async function deleteTask(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.deleteTask(id);
}

export async function getTimesheets(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getTimesheets(params);
}

export async function getTimesheet(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getTimesheet(id);
}

export async function createTimesheet(getToken: () => string | null, baseUrl: string, data: unknown) {
  const client = getApiClient(baseUrl, getToken);
  return client.createTimesheet(data);
}

export async function updateTimesheet(getToken: () => string | null, baseUrl: string, id: string, data: unknown) {
  const client = getApiClient(baseUrl, getToken);
  return client.updateTimesheet(id, data);
}

export async function deleteTimesheet(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.deleteTimesheet(id);
}

export async function getProjectExpenses(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getProjectExpenses(params);
}

export async function getProjectExpense(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getProjectExpense(id);
}

export async function createProjectExpense(getToken: () => string | null, baseUrl: string, data: unknown) {
  const client = getApiClient(baseUrl, getToken);
  return client.createProjectExpense(data);
}

export async function updateProjectExpense(getToken: () => string | null, baseUrl: string, id: string, data: unknown) {
  const client = getApiClient(baseUrl, getToken);
  return client.updateProjectExpense(id, data);
}

export async function deleteProjectExpense(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.deleteProjectExpense(id);
}

export async function getRetainerInvoices(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getRetainerInvoices(params);
}

export async function getRetainerInvoice(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getRetainerInvoice(id);
}

export async function createRetainerInvoice(getToken: () => string | null, baseUrl: string, data: unknown) {
  const client = getApiClient(baseUrl, getToken);
  return client.createRetainerInvoice(data);
}

export async function updateRetainerInvoice(getToken: () => string | null, baseUrl: string, id: string, data: unknown) {
  const client = getApiClient(baseUrl, getToken);
  return client.updateRetainerInvoice(id, data);
}

export async function deleteRetainerInvoice(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.deleteRetainerInvoice(id);
}

// Credit Notes
export async function getCreditNotes(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getCreditNotes(params);
}

export async function getCreditNote(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getCreditNote(id);
}

export async function createCreditNote(getToken: () => string | null, baseUrl: string, data: unknown) {
  const client = getApiClient(baseUrl, getToken);
  return client.createCreditNote(data);
}

export async function updateCreditNote(getToken: () => string | null, baseUrl: string, id: string, data: unknown) {
  const client = getApiClient(baseUrl, getToken);
  return client.updateCreditNote(id, data);
}

export async function deleteCreditNote(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.deleteCreditNote(id);
}

export async function issueCreditNote(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.issueCreditNote(id);
}

// Debit Notes
export async function getDebitNotes(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getDebitNotes(params);
}

export async function getDebitNote(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getDebitNote(id);
}

export async function createDebitNote(getToken: () => string | null, baseUrl: string, data: unknown) {
  const client = getApiClient(baseUrl, getToken);
  return client.createDebitNote(data);
}

export async function updateDebitNote(getToken: () => string | null, baseUrl: string, id: string, data: unknown) {
  const client = getApiClient(baseUrl, getToken);
  return client.updateDebitNote(id, data);
}

export async function deleteDebitNote(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.deleteDebitNote(id);
}

export async function approveDebitNote(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.approveDebitNote(id);
}

// Accounting Payments
export async function getAccountingPayments(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getAccountingPayments(params);
}

export async function getAccountingPayment(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getAccountingPayment(id);
}

export async function createAccountingPayment(getToken: () => string | null, baseUrl: string, data: unknown) {
  const client = getApiClient(baseUrl, getToken);
  return client.createAccountingPayment(data);
}

export async function updateAccountingPayment(getToken: () => string | null, baseUrl: string, id: string, data: unknown) {
  const client = getApiClient(baseUrl, getToken);
  return client.updateAccountingPayment(id, data);
}

export async function deleteAccountingPayment(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.deleteAccountingPayment(id);
}

// Payment Allocations
export async function getPaymentAllocations(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getPaymentAllocations(params);
}

export async function getPaymentAllocation(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getPaymentAllocation(id);
}

export async function createPaymentAllocation(getToken: () => string | null, baseUrl: string, data: unknown) {
  const client = getApiClient(baseUrl, getToken);
  return client.createPaymentAllocation(data);
}

export async function updatePaymentAllocation(getToken: () => string | null, baseUrl: string, id: string, data: unknown) {
  const client = getApiClient(baseUrl, getToken);
  return client.updatePaymentAllocation(id, data);
}

export async function deletePaymentAllocation(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.deletePaymentAllocation(id);
}

// Expense Categories
export async function createExpenseCategory(getToken: () => string | null, baseUrl: string, data: unknown) {
  const client = getApiClient(baseUrl, getToken);
  return client.createExpenseCategory(data);
}

export async function updateExpenseCategory(getToken: () => string | null, baseUrl: string, id: string, data: unknown) {
  const client = getApiClient(baseUrl, getToken);
  return client.updateExpenseCategory(id, data);
}

export async function deleteExpenseCategory(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.deleteExpenseCategory(id);
}

// Units
export async function getUnits(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getUnits(params);
}

export async function createUnit(getToken: () => string | null, baseUrl: string, data: unknown) {
  const client = getApiClient(baseUrl, getToken);
  return client.createUnit(data);
}

// Product Variants
export async function getProductVariants(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getProductVariants(params);
}

export async function createProductVariant(getToken: () => string | null, baseUrl: string, data: unknown) {
  const client = getApiClient(baseUrl, getToken);
  return client.createProductVariant(data);
}

// Batches
export async function getBatches(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getBatches(params);
}

export async function createBatch(getToken: () => string | null, baseUrl: string, data: unknown) {
  const client = getApiClient(baseUrl, getToken);
  return client.createBatch(data);
}

// Serial Numbers
export async function getSerialNumbers(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getSerialNumbers(params);
}

export async function createSerialNumber(getToken: () => string | null, baseUrl: string, data: unknown) {
  const client = getApiClient(baseUrl, getToken);
  return client.createSerialNumber(data);
}

// Bins
export async function getBins(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getBins(params);
}

export async function createBin(getToken: () => string | null, baseUrl: string, data: unknown) {
  const client = getApiClient(baseUrl, getToken);
  return client.createBin(data);
}

// Inventory Adjustments
export async function getInventoryAdjustments(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getInventoryAdjustments(params);
}

export async function createInventoryAdjustment(getToken: () => string | null, baseUrl: string, data: unknown) {
  const client = getApiClient(baseUrl, getToken);
  return client.createInventoryAdjustment(data);
}

export async function approveInventoryAdjustment(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.approveInventoryAdjustment(id);
}

// Stocktakes
export async function getStocktakes(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getStocktakes(params);
}

export async function createStocktake(getToken: () => string | null, baseUrl: string, data: unknown) {
  const client = getApiClient(baseUrl, getToken);
  return client.createStocktake(data);
}

export async function approveStocktake(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.approveStocktake(id);
}

// Transfers
export async function getTransfers(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getTransfers(params);
}

export async function createTransfer(getToken: () => string | null, baseUrl: string, data: unknown) {
  const client = getApiClient(baseUrl, getToken);
  return client.createTransfer(data);
}

export async function approveTransfer(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.approveTransfer(id);
}

export async function dispatchTransfer(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.dispatchTransfer(id);
}

export async function receiveTransfer(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.receiveTransfer(id);
}

// Assemblies
export async function getAssemblies(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getAssemblies(params);
}

export async function createAssembly(getToken: () => string | null, baseUrl: string, data: unknown) {
  const client = getApiClient(baseUrl, getToken);
  return client.createAssembly(data);
}

export async function completeAssembly(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.completeAssembly(id);
}

// Landed Costs
export async function getLandedCosts(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getLandedCosts(params);
}

export async function createLandedCost(getToken: () => string | null, baseUrl: string, data: unknown) {
  const client = getApiClient(baseUrl, getToken);
  return client.createLandedCost(data);
}

// Replenishment
export async function getReplenishmentRules(getToken: () => string | null, baseUrl: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getReplenishmentRules();
}

export async function getReplenishmentSuggestions(getToken: () => string | null, baseUrl: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getReplenishmentSuggestions();
}

// Price Lists
export async function getPriceLists(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getPriceLists(params);
}

export async function createPriceList(getToken: () => string | null, baseUrl: string, data: unknown) {
  const client = getApiClient(baseUrl, getToken);
  return client.createPriceList(data);
}

// Packages
export async function getPackages(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getPackages(params);
}

export async function createPackage(getToken: () => string | null, baseUrl: string, data: unknown) {
  const client = getApiClient(baseUrl, getToken);
  return client.createPackage(data);
}

// Shipments
export async function getShipments(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getShipments(params);
}

export async function createShipment(getToken: () => string | null, baseUrl: string, data: unknown) {
  const client = getApiClient(baseUrl, getToken);
  return client.createShipment(data);
}

export async function updateShipment(getToken: () => string | null, baseUrl: string, id: string, data: unknown) {
  const client = getApiClient(baseUrl, getToken);
  return client.updateShipment(id, data);
}

// eTIMS
export async function getEtimsSubmissions(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getEtimsSubmissions(params);
}

export async function retryEtimsSubmission(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.retryEtimsSubmission(id);
}

// Warehouses
export async function getWarehouses(getToken: () => string | null, baseUrl: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getWarehouses();
}

// Inventory Movements
export async function getInventoryMovements(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getInventoryMovements(params);
}

// Purchase Orders
export async function getPurchaseOrders(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getPurchaseOrders(params);
}

// CRM - Leads
export async function getLeads(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getLeads(params);
}

export async function getLead(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getLead(id);
}

export async function createLead(getToken: () => string | null, baseUrl: string, data: Partial<Lead>) {
  const client = getApiClient(baseUrl, getToken);
  return client.createLead(data);
}

export async function updateLead(getToken: () => string | null, baseUrl: string, id: string, data: Partial<Lead>) {
  const client = getApiClient(baseUrl, getToken);
  return client.updateLead(id, data);
}

export async function deleteLead(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.deleteLead(id);
}

export async function convertLead(getToken: () => string | null, baseUrl: string, id: string, data?: Record<string, unknown>) {
  const client = getApiClient(baseUrl, getToken);
  return client.convertLead(id, data);
}

// CRM - Accounts
export async function getCrmAccounts(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getCrmAccounts(params);
}

export async function getCrmAccount(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getCrmAccount(id);
}

export async function createCrmAccount(getToken: () => string | null, baseUrl: string, data: Partial<CrmAccount>) {
  const client = getApiClient(baseUrl, getToken);
  return client.createCrmAccount(data);
}

export async function updateCrmAccount(getToken: () => string | null, baseUrl: string, id: string, data: Partial<CrmAccount>) {
  const client = getApiClient(baseUrl, getToken);
  return client.updateCrmAccount(id, data);
}

export async function deleteCrmAccount(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.deleteCrmAccount(id);
}

// CRM - Contacts
export async function getContacts(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getContacts(params);
}

export async function getContact(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getContact(id);
}

export async function createContact(getToken: () => string | null, baseUrl: string, data: Partial<Contact>) {
  const client = getApiClient(baseUrl, getToken);
  return client.createContact(data);
}

export async function updateContact(getToken: () => string | null, baseUrl: string, id: string, data: Partial<Contact>) {
  const client = getApiClient(baseUrl, getToken);
  return client.updateContact(id, data);
}

export async function deleteContact(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.deleteContact(id);
}

// CRM - Deals
export async function getDeals(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getDeals(params);
}

export async function getDeal(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getDeal(id);
}

export async function createDeal(getToken: () => string | null, baseUrl: string, data: Partial<Deal>) {
  const client = getApiClient(baseUrl, getToken);
  return client.createDeal(data);
}

export async function updateDeal(getToken: () => string | null, baseUrl: string, id: string, data: Partial<Deal>) {
  const client = getApiClient(baseUrl, getToken);
  return client.updateDeal(id, data);
}

export async function deleteDeal(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.deleteDeal(id);
}

// CRM - Pipelines
export async function getPipelines(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getPipelines(params);
}

export async function getPipeline(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getPipeline(id);
}

export async function createPipeline(getToken: () => string | null, baseUrl: string, data: Partial<Pipeline>) {
  const client = getApiClient(baseUrl, getToken);
  return client.createPipeline(data);
}

export async function updatePipeline(getToken: () => string | null, baseUrl: string, id: string, data: Partial<Pipeline>) {
  const client = getApiClient(baseUrl, getToken);
  return client.updatePipeline(id, data);
}

export async function deletePipeline(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.deletePipeline(id);
}

// CRM - Campaigns
export async function getCampaigns(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getCampaigns(params);
}

export async function getCampaign(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getCampaign(id);
}

export async function createCampaign(getToken: () => string | null, baseUrl: string, data: Partial<Campaign>) {
  const client = getApiClient(baseUrl, getToken);
  return client.createCampaign(data);
}

export async function updateCampaign(getToken: () => string | null, baseUrl: string, id: string, data: Partial<Campaign>) {
  const client = getApiClient(baseUrl, getToken);
  return client.updateCampaign(id, data);
}

export async function deleteCampaign(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.deleteCampaign(id);
}

// CRM - Cases
export async function getCases(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getCases(params);
}

export async function getCase(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getCase(id);
}

export async function createCase(getToken: () => string | null, baseUrl: string, data: Partial<CaseModel>) {
  const client = getApiClient(baseUrl, getToken);
  return client.createCase(data);
}

export async function updateCase(getToken: () => string | null, baseUrl: string, id: string, data: Partial<CaseModel>) {
  const client = getApiClient(baseUrl, getToken);
  return client.updateCase(id, data);
}

export async function deleteCase(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.deleteCase(id);
}

// CRM - Deal Stages
export async function getDealStages(getToken: () => string | null, baseUrl: string, pipelineId: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getDealStages(pipelineId, params);
}

export async function getDealStage(getToken: () => string | null, baseUrl: string, pipelineId: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getDealStage(pipelineId, id);
}

export async function createDealStage(getToken: () => string | null, baseUrl: string, pipelineId: string, data: Partial<DealStage>) {
  const client = getApiClient(baseUrl, getToken);
  return client.createDealStage(pipelineId, data);
}

export async function updateDealStage(getToken: () => string | null, baseUrl: string, pipelineId: string, id: string, data: Partial<DealStage>) {
  const client = getApiClient(baseUrl, getToken);
  return client.updateDealStage(pipelineId, id, data);
}

export async function deleteDealStage(getToken: () => string | null, baseUrl: string, pipelineId: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.deleteDealStage(pipelineId, id);
}

// CRM - Activities
export async function getActivities(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getActivities(params);
}

export async function getActivity(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getActivity(id);
}

export async function createActivity(getToken: () => string | null, baseUrl: string, data: Partial<Activity>) {
  const client = getApiClient(baseUrl, getToken);
  return client.createActivity(data);
}

export async function updateActivity(getToken: () => string | null, baseUrl: string, id: string, data: Partial<Activity>) {
  const client = getApiClient(baseUrl, getToken);
  return client.updateActivity(id, data);
}

export async function deleteActivity(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.deleteActivity(id);
}

// CRM - Communications
export async function getCommunications(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getCommunications(params);
}

export async function getCommunication(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getCommunication(id);
}

export async function createCommunication(getToken: () => string | null, baseUrl: string, data: Partial<Communication>) {
  const client = getApiClient(baseUrl, getToken);
  return client.createCommunication(data);
}

// CRM - Workflows
export async function getWorkflows(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getWorkflows(params);
}

export async function getWorkflow(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getWorkflow(id);
}

export async function createWorkflow(getToken: () => string | null, baseUrl: string, data: Partial<Workflow>) {
  const client = getApiClient(baseUrl, getToken);
  return client.createWorkflow(data);
}

export async function updateWorkflow(getToken: () => string | null, baseUrl: string, id: string, data: Partial<Workflow>) {
  const client = getApiClient(baseUrl, getToken);
  return client.updateWorkflow(id, data);
}

export async function deleteWorkflow(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.deleteWorkflow(id);
}

// CRM - SLA Policies
export async function getSlas(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getSlas(params);
}

export async function getSla(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getSla(id);
}

export async function createSla(getToken: () => string | null, baseUrl: string, data: Partial<SlaPolicy>) {
  const client = getApiClient(baseUrl, getToken);
  return client.createSla(data);
}

export async function updateSla(getToken: () => string | null, baseUrl: string, id: string, data: Partial<SlaPolicy>) {
  const client = getApiClient(baseUrl, getToken);
  return client.updateSla(id, data);
}

export async function deleteSla(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.deleteSla(id);
}

// CRM - Custom Fields
export async function getCustomFields(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getCustomFields(params);
}

export async function getCustomField(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getCustomField(id);
}

export async function createCustomField(getToken: () => string | null, baseUrl: string, data: Partial<CustomFieldDefinition>) {
  const client = getApiClient(baseUrl, getToken);
  return client.createCustomField(data);
}

export async function updateCustomField(getToken: () => string | null, baseUrl: string, id: string, data: Partial<CustomFieldDefinition>) {
  const client = getApiClient(baseUrl, getToken);
  return client.updateCustomField(id, data);
}

export async function deleteCustomField(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.deleteCustomField(id);
}

// CRM - Territories
export async function getTerritories(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getTerritories(params);
}

export async function getTerritory(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getTerritory(id);
}

export async function createTerritory(getToken: () => string | null, baseUrl: string, data: Partial<Territory>) {
  const client = getApiClient(baseUrl, getToken);
  return client.createTerritory(data);
}

export async function updateTerritory(getToken: () => string | null, baseUrl: string, id: string, data: Partial<Territory>) {
  const client = getApiClient(baseUrl, getToken);
  return client.updateTerritory(id, data);
}

export async function deleteTerritory(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.deleteTerritory(id);
}

// CRM - Price Books
export async function getPriceBooks(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getPriceBooks(params);
}

export async function getPriceBook(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getPriceBook(id);
}

export async function createPriceBook(getToken: () => string | null, baseUrl: string, data: Partial<PriceBook>) {
  const client = getApiClient(baseUrl, getToken);
  return client.createPriceBook(data);
}

export async function updatePriceBook(getToken: () => string | null, baseUrl: string, id: string, data: Partial<PriceBook>) {
  const client = getApiClient(baseUrl, getToken);
  return client.updatePriceBook(id, data);
}

export async function deletePriceBook(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.deletePriceBook(id);
}

// CRM - Knowledge Articles
export async function getKnowledgeArticles(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getKnowledgeArticles(params);
}

export async function getKnowledgeArticle(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getKnowledgeArticle(id);
}

export async function createKnowledgeArticle(getToken: () => string | null, baseUrl: string, data: Partial<KnowledgeArticle>) {
  const client = getApiClient(baseUrl, getToken);
  return client.createKnowledgeArticle(data);
}

export async function updateKnowledgeArticle(getToken: () => string | null, baseUrl: string, id: string, data: Partial<KnowledgeArticle>) {
  const client = getApiClient(baseUrl, getToken);
  return client.updateKnowledgeArticle(id, data);
}

export async function deleteKnowledgeArticle(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.deleteKnowledgeArticle(id);
}

// CRM - Sequences
export async function getSequences(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getSequences(params);
}

export async function getSequence(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getSequence(id);
}

export async function createSequence(getToken: () => string | null, baseUrl: string, data: Partial<Sequence>) {
  const client = getApiClient(baseUrl, getToken);
  return client.createSequence(data);
}

export async function updateSequence(getToken: () => string | null, baseUrl: string, id: string, data: Partial<Sequence>) {
  const client = getApiClient(baseUrl, getToken);
  return client.updateSequence(id, data);
}

export async function deleteSequence(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.deleteSequence(id);
}

// CRM - Lead Scoring Rules
export async function getLeadScoringRules(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getLeadScoringRules(params);
}

export async function getLeadScoringRule(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getLeadScoringRule(id);
}

export async function createLeadScoringRule(getToken: () => string | null, baseUrl: string, data: Partial<LeadScoringRule>) {
  const client = getApiClient(baseUrl, getToken);
  return client.createLeadScoringRule(data);
}

export async function updateLeadScoringRule(getToken: () => string | null, baseUrl: string, id: string, data: Partial<LeadScoringRule>) {
  const client = getApiClient(baseUrl, getToken);
  return client.updateLeadScoringRule(id, data);
}

export async function deleteLeadScoringRule(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.deleteLeadScoringRule(id);
}

// CRM - Lead Assignments
export async function getLeadAssignments(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getLeadAssignments(params);
}

export async function getLeadAssignment(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getLeadAssignment(id);
}

export async function createLeadAssignment(getToken: () => string | null, baseUrl: string, data: Partial<LeadAssignment>) {
  const client = getApiClient(baseUrl, getToken);
  return client.createLeadAssignment(data);
}

export async function updateLeadAssignment(getToken: () => string | null, baseUrl: string, id: string, data: Partial<LeadAssignment>) {
  const client = getApiClient(baseUrl, getToken);
  return client.updateLeadAssignment(id, data);
}

export async function deleteLeadAssignment(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.deleteLeadAssignment(id);
}

// Procurement - Purchase Requisitions
export async function getPurchaseRequisitions(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getPurchaseRequisitions(params);
}

export async function getPurchaseRequisition(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getPurchaseRequisition(id);
}

export async function createPurchaseRequisition(getToken: () => string | null, baseUrl: string, data: Partial<PurchaseRequisition>) {
  const client = getApiClient(baseUrl, getToken);
  return client.createPurchaseRequisition(data);
}

export async function updatePurchaseRequisition(getToken: () => string | null, baseUrl: string, id: string, data: Partial<PurchaseRequisition>) {
  const client = getApiClient(baseUrl, getToken);
  return client.updatePurchaseRequisition(id, data);
}

export async function deletePurchaseRequisition(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.deletePurchaseRequisition(id);
}

// Procurement - RFQs
export async function getRfqs(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getRfqs(params);
}

export async function getRfq(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getRfq(id);
}

export async function createRfq(getToken: () => string | null, baseUrl: string, data: Partial<Rfq>) {
  const client = getApiClient(baseUrl, getToken);
  return client.createRfq(data);
}

export async function updateRfq(getToken: () => string | null, baseUrl: string, id: string, data: Partial<Rfq>) {
  const client = getApiClient(baseUrl, getToken);
  return client.updateRfq(id, data);
}

export async function deleteRfq(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.deleteRfq(id);
}

export async function publishRfq(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.publishRfq(id);
}

export async function closeRfq(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.closeRfq(id);
}

// Procurement - Tenders
export async function getTenders(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getTenders(params);
}

export async function getTender(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getTender(id);
}

export async function createTender(getToken: () => string | null, baseUrl: string, data: Partial<Tender>) {
  const client = getApiClient(baseUrl, getToken);
  return client.createTender(data);
}

export async function updateTender(getToken: () => string | null, baseUrl: string, id: string, data: Partial<Tender>) {
  const client = getApiClient(baseUrl, getToken);
  return client.updateTender(id, data);
}

export async function deleteTender(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.deleteTender(id);
}

// Procurement - Supplier Invoices
export async function getSupplierInvoices(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getSupplierInvoices(params);
}

export async function getSupplierInvoice(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getSupplierInvoice(id);
}

export async function createSupplierInvoice(getToken: () => string | null, baseUrl: string, data: Partial<SupplierInvoice>) {
  const client = getApiClient(baseUrl, getToken);
  return client.createSupplierInvoice(data);
}

export async function updateSupplierInvoice(getToken: () => string | null, baseUrl: string, id: string, data: Partial<SupplierInvoice>) {
  const client = getApiClient(baseUrl, getToken);
  return client.updateSupplierInvoice(id, data);
}

export async function deleteSupplierInvoice(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.deleteSupplierInvoice(id);
}

// Procurement - Three Way Matches
export async function getThreeWayMatches(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getThreeWayMatches(params);
}

export async function getThreeWayMatch(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getThreeWayMatch(id);
}

export async function createThreeWayMatch(getToken: () => string | null, baseUrl: string, data: Partial<ThreeWayMatch>) {
  const client = getApiClient(baseUrl, getToken);
  return client.createThreeWayMatch(data);
}

export async function updateThreeWayMatch(getToken: () => string | null, baseUrl: string, id: string, data: Partial<ThreeWayMatch>) {
  const client = getApiClient(baseUrl, getToken);
  return client.updateThreeWayMatch(id, data);
}

export async function deleteThreeWayMatch(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.deleteThreeWayMatch(id);
}

// Procurement - Payment Vouchers
export async function getPaymentVouchers(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getPaymentVouchers(params);
}

export async function getPaymentVoucher(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getPaymentVoucher(id);
}

export async function createPaymentVoucher(getToken: () => string | null, baseUrl: string, data: Partial<PaymentVoucher>) {
  const client = getApiClient(baseUrl, getToken);
  return client.createPaymentVoucher(data);
}

export async function updatePaymentVoucher(getToken: () => string | null, baseUrl: string, id: string, data: Partial<PaymentVoucher>) {
  const client = getApiClient(baseUrl, getToken);
  return client.updatePaymentVoucher(id, data);
}

export async function deletePaymentVoucher(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.deletePaymentVoucher(id);
}

// Procurement - Supplier Payments
export async function getSupplierPayments(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getSupplierPayments(params);
}

export async function getSupplierPayment(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getSupplierPayment(id);
}

export async function createSupplierPayment(getToken: () => string | null, baseUrl: string, data: Partial<SupplierPayment>) {
  const client = getApiClient(baseUrl, getToken);
  return client.createSupplierPayment(data);
}

export async function updateSupplierPayment(getToken: () => string | null, baseUrl: string, id: string, data: Partial<SupplierPayment>) {
  const client = getApiClient(baseUrl, getToken);
  return client.updateSupplierPayment(id, data);
}

export async function deleteSupplierPayment(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.deleteSupplierPayment(id);
}

// Procurement - Payment Reconciliations
export async function getPaymentReconciliations(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getPaymentReconciliations(params);
}

export async function getPaymentReconciliation(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getPaymentReconciliation(id);
}

export async function createPaymentReconciliation(getToken: () => string | null, baseUrl: string, data: Partial<PaymentReconciliation>) {
  const client = getApiClient(baseUrl, getToken);
  return client.createPaymentReconciliation(data);
}

export async function updatePaymentReconciliation(getToken: () => string | null, baseUrl: string, id: string, data: Partial<PaymentReconciliation>) {
  const client = getApiClient(baseUrl, getToken);
  return client.updatePaymentReconciliation(id, data);
}

export async function deletePaymentReconciliation(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.deletePaymentReconciliation(id);
}

// Procurement - Contracts
export async function getProcurementContracts(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getProcurementContracts(params);
}

export async function getProcurementContract(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getProcurementContract(id);
}

export async function createProcurementContract(getToken: () => string | null, baseUrl: string, data: Partial<ProcurementContract>) {
  const client = getApiClient(baseUrl, getToken);
  return client.createProcurementContract(data);
}

export async function updateProcurementContract(getToken: () => string | null, baseUrl: string, id: string, data: Partial<ProcurementContract>) {
  const client = getApiClient(baseUrl, getToken);
  return client.updateProcurementContract(id, data);
}

export async function deleteProcurementContract(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.deleteProcurementContract(id);
}

// Procurement - Approval Rules
export async function getApprovalRules(getToken: () => string | null, baseUrl: string, params?: Record<string, string>) {
  const client = getApiClient(baseUrl, getToken);
  return client.getApprovalRules(params);
}

export async function getApprovalRule(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.getApprovalRule(id);
}

export async function createApprovalRule(getToken: () => string | null, baseUrl: string, data: Partial<ApprovalRule>) {
  const client = getApiClient(baseUrl, getToken);
  return client.createApprovalRule(data);
}

export async function updateApprovalRule(getToken: () => string | null, baseUrl: string, id: string, data: Partial<ApprovalRule>) {
  const client = getApiClient(baseUrl, getToken);
  return client.updateApprovalRule(id, data);
}

export async function deleteApprovalRule(getToken: () => string | null, baseUrl: string, id: string) {
  const client = getApiClient(baseUrl, getToken);
  return client.deleteApprovalRule(id);
}
