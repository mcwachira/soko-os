import {
  SyncPushPayload,
  SyncPushResponse,
  SyncPullPayload,
  SyncPullResponse,
  Sale,
  Product,
  Customer,
  CashShift,
  User,
  ReturnModel,
  Refund,
  PaymentTransaction,
  Payment,
  Terminal,
  Account,
  JournalEntry,
  Invoice,
  Bill,
  Quote,
  SalesOrder,
  CreditNote,
  DebitNote,
  Expense,
  BankAccount,
  BankTransaction,
  BankReconciliation,
  FiscalYear,
  AccountingPeriod,
  TaxRate,
  Cart,
  CartItem,
  PriceOverride,
  CashMovement,
  LoyaltyAccount,
  StoreCredit,
  QuickKey,
  Supplier,
  ExpenseCategory,
  PaymentAllocation,
  Project,
  Task,
  Timesheet,
  ProjectExpense,
  RetainerInvoice,
  Unit,
  UnitConversion,
  ProductVariant,
  Batch,
  SerialNumber,
  Zone,
  Bin,
  InventoryAdjustment,
  InventoryAdjustmentItem,
  Stocktake,
  StocktakeItem,
  TransferOrder,
  TransferOrderItem,
  Assembly,
  AssemblyItem,
  LandedCost,
  LandedCostAllocation,
  ReplenishmentRule,
  ReplenishmentSuggestion,
  PriceList,
  PriceListItem,
  Package,
  PackageItem,
  Shipment,
  ShipmentItem,
  EtimsStockSubmission,
  Warehouse,
  InventoryMovement,
  PurchaseOrder,
  PurchaseOrderItem,
  GoodsReceivedNote,
  GoodsReceivedNoteItem,
  SupplierContact,
  SupplierAddress,
  SupplierBankAccount,
  SupplierDocument,
  SupplierComplianceRecord,
  SupplierCategory,
  SupplierCategoryLink,
  SupplierRating,
  SupplierPerformanceRecord,
  PurchaseRequisition,
  PurchaseRequisitionLine,
  PurchaseRequisitionApproval,
  Rfq,
  RfqLine,
  RfqSupplier,
  RfqQuestion,
  RfqResponse,
  RfqResponseLine,
  RfqAttachment,
  Tender,
  TenderDocument,
  TenderBid,
  TenderBidLine,
  TenderEvaluation,
  TenderAward,
  SupplierInvoice,
  SupplierInvoiceLine,
  ThreeWayMatch,
  ThreeWayMatchLine,
  PaymentVoucher,
  PaymentVoucherLine,
  PaymentApproval,
  SupplierPayment,
  PaymentReconciliation,
  ProcurementContract,
  ContractLine,
  ContractRenewal,
  ApprovalRule,
  ApprovalStep,
  ProcurementAuditLog,
  Lead,
  CrmAccount,
  Contact,
  Deal,
  Pipeline,
  DealStage,
  Campaign,
  CaseModel,
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
} from '@soko/domain-types';

export interface ApiClientConfig {
  baseUrl: string;
  getToken?: () => string | null;
  getDeviceId?: () => string | null;
}

export class SokoApiClient {
  private baseUrl: string;
  private getToken?: () => string | null;
  private getDeviceId?: () => string | null;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.getToken = config.getToken;
    this.getDeviceId = config.getDeviceId;
  }

  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const token = this.getToken ? this.getToken() : null;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const deviceId = this.getDeviceId ? this.getDeviceId() : null;
    if (deviceId) {
      headers['X-Device-UUID'] = deviceId;
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${res.status}`);
    }

    return res.json();
  }

  // Auth endpoints
  async login(credentials: { email: string; password: string; device_uuid?: string }): Promise<{ data: { token: string; user: unknown }; message: string }> {
    return this.request('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async me(): Promise<{ data: Record<string, unknown> }> {
    return this.request('/api/v1/auth/me');
  }

  async dashboard(): Promise<{ data: Record<string, unknown> }> {
    return this.request('/api/v1/dashboard');
  }

  async logout(): Promise<void> {
    return this.request('/api/v1/auth/logout', { method: 'POST' });
  }

  async switchTenant(payload: { organization_id: string }): Promise<{ data: { user: Record<string, unknown> }; message: string }> {
    return this.request('/api/v1/auth/switch-tenant', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getSubscriptions(): Promise<{ data: { subscription: unknown; entitlements: string[] } }> {
    return this.request('/api/v1/subscriptions');
  }

  async getPlans(): Promise<{ data: unknown[] }> {
    return this.request('/api/v1/plans');
  }

  async getInvitations(): Promise<{ data: unknown[] }> {
    return this.request('/api/v1/invitations');
  }

  async createInvitation(data: Record<string, unknown>): Promise<{ data: unknown }> {
    return this.request('/api/v1/invitations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async acceptInvitation(data: { token: string }): Promise<{ data: unknown }> {
    return this.request('/api/v1/invitations/accept', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Sync endpoints
  async pushSync(payload: SyncPushPayload): Promise<SyncPushResponse> {
    return this.request('/api/v1/sync/push', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async pullSync(payload: SyncPullPayload): Promise<SyncPullResponse> {
    return this.request('/api/v1/sync/pull', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Sales endpoints
  async getSales(params?: Record<string, string>): Promise<{ data: Sale[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/sales${qs}`);
  }

  async createSale(data: unknown): Promise<{ data: Sale }> {
    return this.request('/api/v1/sales', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Carts
  async getCarts(params?: Record<string, string>): Promise<{ data: Cart[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/carts${qs}`);
  }

  async getCart(id: string): Promise<{ data: Cart }> {
    return this.request(`/api/v1/carts/${id}`);
  }

  async createCart(data: unknown): Promise<{ data: Cart }> {
    return this.request('/api/v1/carts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCart(id: string, data: unknown): Promise<{ data: Cart }> {
    return this.request(`/api/v1/carts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async holdCart(id: string): Promise<{ data: Cart }> {
    return this.request(`/api/v1/carts/${id}/hold`, { method: 'POST' });
  }

  async recallCart(id: string): Promise<{ data: Cart }> {
    return this.request(`/api/v1/carts/${id}/recall`, { method: 'POST' });
  }

  async deleteCart(id: string): Promise<void> {
    return this.request(`/api/v1/carts/${id}`, { method: 'DELETE' });
  }

  // Price Overrides
  async getPriceOverrides(params?: Record<string, string>): Promise<{ data: PriceOverride[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/price-overrides${qs}`);
  }

  async createPriceOverride(data: unknown): Promise<{ data: PriceOverride }> {
    return this.request('/api/v1/price-overrides', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async approvePriceOverride(id: string): Promise<{ data: PriceOverride }> {
    return this.request(`/api/v1/price-overrides/${id}/approve`, { method: 'POST' });
  }

  // Cash Movements
  async getCashMovements(params?: Record<string, string>): Promise<{ data: CashMovement[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/cash-movements${qs}`);
  }

  async createCashMovement(data: unknown): Promise<{ data: CashMovement }> {
    return this.request('/api/v1/cash-movements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Loyalty
  async getLoyalty(params?: Record<string, string>): Promise<{ data: LoyaltyAccount[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/loyalty${qs}`);
  }

  async earnLoyalty(customerId: string, data: unknown): Promise<{ data: LoyaltyAccount }> {
    return this.request(`/api/v1/loyalty/customers/${customerId}/earn`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async redeemLoyalty(customerId: string, data: unknown): Promise<{ data: LoyaltyAccount }> {
    return this.request(`/api/v1/loyalty/customers/${customerId}/redeem`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Store Credits
  async getStoreCredits(params?: Record<string, string>): Promise<{ data: StoreCredit[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/store-credits${qs}`);
  }

  async createStoreCredit(data: unknown): Promise<{ data: StoreCredit }> {
    return this.request('/api/v1/store-credits', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Quick Keys
  async getQuickKeys(params?: Record<string, string>): Promise<{ data: QuickKey[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/quick-keys${qs}`);
  }

  async createQuickKey(data: unknown): Promise<{ data: QuickKey }> {
    return this.request('/api/v1/quick-keys', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateQuickKey(id: string, data: unknown): Promise<{ data: QuickKey }> {
    return this.request(`/api/v1/quick-keys/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteQuickKey(id: string): Promise<void> {
    return this.request(`/api/v1/quick-keys/${id}`, { method: 'DELETE' });
  }

  // Products
  async getProducts(): Promise<{ data: Product[] }> {
    return this.request('/api/v1/products');
  }

  async createProduct(data: Partial<Product>): Promise<{ data: Product }> {
    return this.request('/api/v1/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Customers
  async getCustomers(): Promise<{ data: Customer[] }> {
    return this.request('/api/v1/customers');
  }

  async createCustomer(data: Partial<Customer>): Promise<{ data: Customer }> {
    return this.request('/api/v1/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Shifts
  async getCurrentShift(): Promise<{ data: CashShift | null }> {
    return this.request('/api/v1/shifts/current');
  }

  async openShift(data: { opening_float_minor: number; notes?: string }): Promise<{ data: CashShift }> {
    return this.request('/api/v1/shifts/open', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async closeShift(data: { actual_cash_minor: number; notes?: string }): Promise<{ data: CashShift }> {
    return this.request('/api/v1/shifts/close', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getReturns(params?: Record<string, string>): Promise<{ data: ReturnModel[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/returns${qs}`);
  }

  async createReturn(data: unknown): Promise<{ data: ReturnModel }> {
    return this.request('/api/v1/returns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getRefunds(params?: Record<string, string>): Promise<{ data: Refund[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/refunds${qs}`);
  }

  async createRefund(data: unknown): Promise<{ data: Refund }> {
    return this.request('/api/v1/refunds', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async completeRefund(id: string): Promise<{ data: Refund }> {
    return this.request(`/api/v1/refunds/${id}/complete`, {
      method: 'POST',
    });
  }

  async getPayments(params?: Record<string, string>): Promise<{ data: PaymentTransaction[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/payments${qs}`);
  }

  async getAccountingPayments(params?: Record<string, string>): Promise<{ data: Payment[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/payments${qs}`);
  }

  async getAccountingPayment(id: string): Promise<{ data: Payment }> {
    return this.request(`/api/v1/payments/${id}`);
  }

  async createAccountingPayment(data: unknown): Promise<{ data: Payment }> {
    return this.request('/api/v1/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAccountingPayment(id: string, data: unknown): Promise<{ data: Payment }> {
    return this.request(`/api/v1/payments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteAccountingPayment(id: string): Promise<void> {
    return this.request(`/api/v1/payments/${id}`, {
      method: 'DELETE',
    });
  }

  async getReceipt(saleId: string, format: 'html' | 'escpos' = 'html'): Promise<Blob> {
    const res = await fetch(`${this.baseUrl}/api/v1/sales/${saleId}/receipt?format=${format}`, {
      headers: {
        'Authorization': `Bearer ${this.getToken?.() || ''}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Receipt request failed with status ${res.status}`);
    }

    return res.blob();
  }

  async searchProducts(query: string, limit = 20): Promise<{ data: Product[] }> {
    return this.request(`/api/v1/products/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  }

  async getTerminals(): Promise<{ data: Terminal[] }> {
    return this.request('/api/v1/terminals');
  }

  // Accounts
  async getAccounts(params?: Record<string, string>): Promise<{ data: Account[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/accounts${qs}`);
  }

  async createAccount(data: Partial<Account>): Promise<{ data: Account }> {
    return this.request('/api/v1/accounts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAccount(id: string, data: Partial<Account>): Promise<{ data: Account }> {
    return this.request(`/api/v1/accounts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Journal entries
  async getJournalEntries(params?: Record<string, string>): Promise<{ data: JournalEntry[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/journal-entries${qs}`);
  }

  async getJournalEntry(id: string): Promise<{ data: JournalEntry }> {
    return this.request(`/api/v1/journal-entries/${id}`);
  }

  async createJournalEntry(data: unknown): Promise<{ data: JournalEntry }> {
    return this.request('/api/v1/journal-entries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async postJournalEntry(id: string): Promise<{ data: JournalEntry }> {
    return this.request(`/api/v1/journal-entries/${id}/post`, {
      method: 'POST',
    });
  }

  async reverseJournalEntry(id: string): Promise<{ data: JournalEntry }> {
    return this.request(`/api/v1/journal-entries/${id}/reverse`, {
      method: 'POST',
    });
  }

  // Reports
  async getLedger(params?: Record<string, string>): Promise<{ data: unknown[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/reports/ledger${qs}`);
  }

  async getTrialBalance(params?: Record<string, string>): Promise<{ data: unknown }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/reports/trial-balance${qs}`);
  }

  async getProfitLoss(params?: Record<string, string>): Promise<{ data: unknown }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/reports/profit-loss${qs}`);
  }

  async getBalanceSheet(params?: Record<string, string>): Promise<{ data: unknown }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/reports/balance-sheet${qs}`);
  }

  async getCashFlow(params?: Record<string, string>): Promise<{ data: unknown }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/reports/cash-flow${qs}`);
  }

  // Invoices
  async getInvoices(params?: Record<string, string>): Promise<{ data: Invoice[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/invoices${qs}`);
  }

  async getInvoice(id: string): Promise<{ data: Invoice }> {
    return this.request(`/api/v1/invoices/${id}`);
  }

  async createInvoice(data: unknown): Promise<{ data: Invoice }> {
    return this.request('/api/v1/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateInvoice(id: string, data: unknown): Promise<{ data: Invoice }> {
    return this.request(`/api/v1/invoices/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteInvoice(id: string): Promise<void> {
    return this.request(`/api/v1/invoices/${id}`, {
      method: 'DELETE',
    });
  }

  // Quotes
  async getQuotes(params?: Record<string, string>): Promise<{ data: Quote[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/quotes${qs}`);
  }

  async getQuote(id: string): Promise<{ data: Quote }> {
    return this.request(`/api/v1/quotes/${id}`);
  }

  async createQuote(data: unknown): Promise<{ data: Quote }> {
    return this.request('/api/v1/quotes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateQuote(id: string, data: unknown): Promise<{ data: Quote }> {
    return this.request(`/api/v1/quotes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteQuote(id: string): Promise<void> {
    return this.request(`/api/v1/quotes/${id}`, {
      method: 'DELETE',
    });
  }

  // Sales Orders
  async getSalesOrders(params?: Record<string, string>): Promise<{ data: SalesOrder[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/sales-orders${qs}`);
  }

  async getSalesOrder(id: string): Promise<{ data: SalesOrder }> {
    return this.request(`/api/v1/sales-orders/${id}`);
  }

  async createSalesOrder(data: unknown): Promise<{ data: SalesOrder }> {
    return this.request('/api/v1/sales-orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSalesOrder(id: string, data: unknown): Promise<{ data: SalesOrder }> {
    return this.request(`/api/v1/sales-orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteSalesOrder(id: string): Promise<void> {
    return this.request(`/api/v1/sales-orders/${id}`, {
      method: 'DELETE',
    });
  }

  // Projects
  async getProjects(params?: Record<string, string>): Promise<{ data: Project[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/projects${qs}`);
  }

  async getProject(id: string): Promise<{ data: Project }> {
    return this.request(`/api/v1/projects/${id}`);
  }

  async createProject(data: unknown): Promise<{ data: Project }> {
    return this.request('/api/v1/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProject(id: string, data: unknown): Promise<{ data: Project }> {
    return this.request(`/api/v1/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteProject(id: string): Promise<void> {
    return this.request(`/api/v1/projects/${id}`, {
      method: 'DELETE',
    });
  }

  async getTasks(params?: Record<string, string>): Promise<{ data: Task[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/tasks${qs}`);
  }

  async getTask(id: string): Promise<{ data: Task }> {
    return this.request(`/api/v1/tasks/${id}`);
  }

  async createTask(data: unknown): Promise<{ data: Task }> {
    return this.request('/api/v1/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTask(id: string, data: unknown): Promise<{ data: Task }> {
    return this.request(`/api/v1/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteTask(id: string): Promise<void> {
    return this.request(`/api/v1/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  async getTimesheets(params?: Record<string, string>): Promise<{ data: Timesheet[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/timesheets${qs}`);
  }

  async getTimesheet(id: string): Promise<{ data: Timesheet }> {
    return this.request(`/api/v1/timesheets/${id}`);
  }

  async createTimesheet(data: unknown): Promise<{ data: Timesheet }> {
    return this.request('/api/v1/timesheets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTimesheet(id: string, data: unknown): Promise<{ data: Timesheet }> {
    return this.request(`/api/v1/timesheets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteTimesheet(id: string): Promise<void> {
    return this.request(`/api/v1/timesheets/${id}`, {
      method: 'DELETE',
    });
  }

  async getProjectExpenses(params?: Record<string, string>): Promise<{ data: ProjectExpense[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/project-expenses${qs}`);
  }

  async getProjectExpense(id: string): Promise<{ data: ProjectExpense }> {
    return this.request(`/api/v1/project-expenses/${id}`);
  }

  async createProjectExpense(data: unknown): Promise<{ data: ProjectExpense }> {
    return this.request('/api/v1/project-expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProjectExpense(id: string, data: unknown): Promise<{ data: ProjectExpense }> {
    return this.request(`/api/v1/project-expenses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteProjectExpense(id: string): Promise<void> {
    return this.request(`/api/v1/project-expenses/${id}`, {
      method: 'DELETE',
    });
  }

  async getRetainerInvoices(params?: Record<string, string>): Promise<{ data: RetainerInvoice[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/retainer-invoices${qs}`);
  }

  async getRetainerInvoice(id: string): Promise<{ data: RetainerInvoice }> {
    return this.request(`/api/v1/retainer-invoices/${id}`);
  }

  async createRetainerInvoice(data: unknown): Promise<{ data: RetainerInvoice }> {
    return this.request('/api/v1/retainer-invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRetainerInvoice(id: string, data: unknown): Promise<{ data: RetainerInvoice }> {
    return this.request(`/api/v1/retainer-invoices/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteRetainerInvoice(id: string): Promise<void> {
    return this.request(`/api/v1/retainer-invoices/${id}`, {
      method: 'DELETE',
    });
  }

  // Credit Notes
  async getCreditNotes(params?: Record<string, string>): Promise<{ data: CreditNote[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/credit-notes${qs}`);
  }

  async getCreditNote(id: string): Promise<{ data: CreditNote }> {
    return this.request(`/api/v1/credit-notes/${id}`);
  }

  async createCreditNote(data: unknown): Promise<{ data: CreditNote }> {
    return this.request('/api/v1/credit-notes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCreditNote(id: string, data: unknown): Promise<{ data: CreditNote }> {
    return this.request(`/api/v1/credit-notes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCreditNote(id: string): Promise<void> {
    return this.request(`/api/v1/credit-notes/${id}`, {
      method: 'DELETE',
    });
  }

  async issueCreditNote(id: string): Promise<{ data: CreditNote }> {
    return this.request(`/api/v1/credit-notes/${id}/issue`, {
      method: 'POST',
    });
  }

  // Debit Notes
  async getDebitNotes(params?: Record<string, string>): Promise<{ data: DebitNote[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/debit-notes${qs}`);
  }

  async getDebitNote(id: string): Promise<{ data: DebitNote }> {
    return this.request(`/api/v1/debit-notes/${id}`);
  }

  async createDebitNote(data: unknown): Promise<{ data: DebitNote }> {
    return this.request('/api/v1/debit-notes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDebitNote(id: string, data: unknown): Promise<{ data: DebitNote }> {
    return this.request(`/api/v1/debit-notes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteDebitNote(id: string): Promise<void> {
    return this.request(`/api/v1/debit-notes/${id}`, {
      method: 'DELETE',
    });
  }

  async approveDebitNote(id: string): Promise<{ data: DebitNote }> {
    return this.request(`/api/v1/debit-notes/${id}/approve`, {
      method: 'POST',
    });
  }

  // Payment Allocations
  async getPaymentAllocations(params?: Record<string, string>): Promise<{ data: PaymentAllocation[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/payment-allocations${qs}`);
  }

  async createPaymentAllocation(data: unknown): Promise<{ data: PaymentAllocation }> {
    return this.request('/api/v1/payment-allocations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePaymentAllocation(id: string, data: unknown): Promise<{ data: PaymentAllocation }> {
    return this.request(`/api/v1/payment-allocations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deletePaymentAllocation(id: string): Promise<void> {
    return this.request(`/api/v1/payment-allocations/${id}`, {
      method: 'DELETE',
    });
  }

  // Bills
  async getBills(params?: Record<string, string>): Promise<{ data: Bill[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/bills${qs}`);
  }

  async getBill(id: string): Promise<{ data: Bill }> {
    return this.request(`/api/v1/bills/${id}`);
  }

  async createBill(data: unknown): Promise<{ data: Bill }> {
    return this.request('/api/v1/bills', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBill(id: string, data: unknown): Promise<{ data: Bill }> {
    return this.request(`/api/v1/bills/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteBill(id: string): Promise<void> {
    return this.request(`/api/v1/bills/${id}`, {
      method: 'DELETE',
    });
  }

  // Expenses
  async getExpenses(params?: Record<string, string>): Promise<{ data: Expense[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/expenses${qs}`);
  }

  async getExpense(id: string): Promise<{ data: Expense }> {
    return this.request(`/api/v1/expenses/${id}`);
  }

  async createExpense(data: unknown): Promise<{ data: Expense }> {
    return this.request('/api/v1/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateExpense(id: string, data: unknown): Promise<{ data: Expense }> {
    return this.request(`/api/v1/expenses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteExpense(id: string): Promise<void> {
    return this.request(`/api/v1/expenses/${id}`, {
      method: 'DELETE',
    });
  }

  // Bank accounts
  async getBankAccounts(params?: Record<string, string>): Promise<{ data: BankAccount[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/bank-accounts${qs}`);
  }

  async createBankAccount(data: unknown): Promise<{ data: BankAccount }> {
    return this.request('/api/v1/bank-accounts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBankAccount(id: string, data: unknown): Promise<{ data: BankAccount }> {
    return this.request(`/api/v1/bank-accounts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteBankAccount(id: string): Promise<void> {
    return this.request(`/api/v1/bank-accounts/${id}`, {
      method: 'DELETE',
    });
  }

  // Bank transactions
  async getBankTransactions(params?: Record<string, string>): Promise<{ data: BankTransaction[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/bank-transactions${qs}`);
  }

  async createBankTransaction(data: unknown): Promise<{ data: BankTransaction }> {
    return this.request('/api/v1/bank-transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBankTransaction(id: string, data: unknown): Promise<{ data: BankTransaction }> {
    return this.request(`/api/v1/bank-transactions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteBankTransaction(id: string): Promise<void> {
    return this.request(`/api/v1/bank-transactions/${id}`, {
      method: 'DELETE',
    });
  }

  // Bank reconciliations
  async getBankReconciliations(params?: Record<string, string>): Promise<{ data: BankReconciliation[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/bank-reconciliations${qs}`);
  }

  async createBankReconciliation(data: unknown): Promise<{ data: BankReconciliation }> {
    return this.request('/api/v1/bank-reconciliations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBankReconciliation(id: string, data: unknown): Promise<{ data: BankReconciliation }> {
    return this.request(`/api/v1/bank-reconciliations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteBankReconciliation(id: string): Promise<void> {
    return this.request(`/api/v1/bank-reconciliations/${id}`, {
      method: 'DELETE',
    });
  }

  // Fiscal years
  async getFiscalYears(params?: Record<string, string>): Promise<{ data: FiscalYear[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/fiscal-years${qs}`);
  }

  async createFiscalYear(data: unknown): Promise<{ data: FiscalYear }> {
    return this.request('/api/v1/fiscal-years', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateFiscalYear(id: string, data: unknown): Promise<{ data: FiscalYear }> {
    return this.request(`/api/v1/fiscal-years/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteFiscalYear(id: string): Promise<void> {
    return this.request(`/api/v1/fiscal-years/${id}`, {
      method: 'DELETE',
    });
  }

  // Accounting periods
  async getAccountingPeriods(params?: Record<string, string>): Promise<{ data: AccountingPeriod[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/accounting-periods${qs}`);
  }

  async createAccountingPeriod(data: unknown): Promise<{ data: AccountingPeriod }> {
    return this.request('/api/v1/accounting-periods', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAccountingPeriod(id: string, data: unknown): Promise<{ data: AccountingPeriod }> {
    return this.request(`/api/v1/accounting-periods/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteAccountingPeriod(id: string): Promise<void> {
    return this.request(`/api/v1/accounting-periods/${id}`, {
      method: 'DELETE',
    });
  }

  // Tax rates
  async getTaxRates(params?: Record<string, string>): Promise<{ data: TaxRate[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/tax-rates${qs}`);
  }

  async createTaxRate(data: unknown): Promise<{ data: TaxRate }> {
    return this.request('/api/v1/tax-rates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTaxRate(id: string, data: unknown): Promise<{ data: TaxRate }> {
    return this.request(`/api/v1/tax-rates/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteTaxRate(id: string): Promise<void> {
    return this.request(`/api/v1/tax-rates/${id}`, {
      method: 'DELETE',
    });
  }

  async getExpenseCategories(params?: Record<string, string>): Promise<{ data: ExpenseCategory[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/expense-categories${qs}`);
  }

  async createExpenseCategory(data: unknown): Promise<{ data: ExpenseCategory }> {
    return this.request('/api/v1/expense-categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateExpenseCategory(id: string, data: unknown): Promise<{ data: ExpenseCategory }> {
    return this.request(`/api/v1/expense-categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteExpenseCategory(id: string): Promise<void> {
    return this.request(`/api/v1/expense-categories/${id}`, {
      method: 'DELETE',
    });
  }

  async getPaymentAllocation(id: string): Promise<{ data: PaymentAllocation }> {
    return this.request(`/api/v1/payment-allocations/${id}`);
  }

  async getSuppliers(): Promise<{ data: Supplier[] }> {
    return this.request('/api/v1/suppliers');
  }

  async getUnits(params?: Record<string, string>): Promise<{ data: Unit[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/units${qs}`);
  }

  async createUnit(data: unknown): Promise<{ data: Unit }> {
    return this.request('/api/v1/units', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProductVariants(params?: Record<string, string>): Promise<{ data: ProductVariant[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/product-variants${qs}`);
  }

  async createProductVariant(data: unknown): Promise<{ data: ProductVariant }> {
    return this.request('/api/v1/product-variants', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBatches(params?: Record<string, string>): Promise<{ data: Batch[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/batches${qs}`);
  }

  async createBatch(data: unknown): Promise<{ data: Batch }> {
    return this.request('/api/v1/batches', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSerialNumbers(params?: Record<string, string>): Promise<{ data: SerialNumber[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/serial-numbers${qs}`);
  }

  async createSerialNumber(data: unknown): Promise<{ data: SerialNumber }> {
    return this.request('/api/v1/serial-numbers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBins(params?: Record<string, string>): Promise<{ data: Bin[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/bins${qs}`);
  }

  async createBin(data: unknown): Promise<{ data: Bin }> {
    return this.request('/api/v1/bins', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getInventoryAdjustments(params?: Record<string, string>): Promise<{ data: InventoryAdjustment[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/inventory-adjustments${qs}`);
  }

  async createInventoryAdjustment(data: unknown): Promise<{ data: InventoryAdjustment }> {
    return this.request('/api/v1/inventory-adjustments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async approveInventoryAdjustment(id: string): Promise<{ data: InventoryAdjustment }> {
    return this.request(`/api/v1/inventory-adjustments/${id}/approve`, {
      method: 'POST',
    });
  }

  async getStocktakes(params?: Record<string, string>): Promise<{ data: Stocktake[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/stocktakes${qs}`);
  }

  async createStocktake(data: unknown): Promise<{ data: Stocktake }> {
    return this.request('/api/v1/stocktakes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async approveStocktake(id: string): Promise<{ data: Stocktake }> {
    return this.request(`/api/v1/stocktakes/${id}/approve`, {
      method: 'POST',
    });
  }

  async getTransfers(params?: Record<string, string>): Promise<{ data: TransferOrder[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/transfers${qs}`);
  }

  async createTransfer(data: unknown): Promise<{ data: TransferOrder }> {
    return this.request('/api/v1/transfers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async approveTransfer(id: string): Promise<{ data: TransferOrder }> {
    return this.request(`/api/v1/transfers/${id}/approve`, {
      method: 'POST',
    });
  }

  async dispatchTransfer(id: string): Promise<{ data: TransferOrder }> {
    return this.request(`/api/v1/transfers/${id}/dispatch`, {
      method: 'POST',
    });
  }

  async receiveTransfer(id: string): Promise<{ data: TransferOrder }> {
    return this.request(`/api/v1/transfers/${id}/receive`, {
      method: 'POST',
    });
  }

  async getAssemblies(params?: Record<string, string>): Promise<{ data: Assembly[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/assemblies${qs}`);
  }

  async createAssembly(data: unknown): Promise<{ data: Assembly }> {
    return this.request('/api/v1/assemblies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async completeAssembly(id: string): Promise<{ data: Assembly }> {
    return this.request(`/api/v1/assemblies/${id}/complete`, {
      method: 'POST',
    });
  }

  async getLandedCosts(params?: Record<string, string>): Promise<{ data: LandedCost[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/landed-costs${qs}`);
  }

  async createLandedCost(data: unknown): Promise<{ data: LandedCost }> {
    return this.request('/api/v1/landed-costs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getReplenishmentRules(params?: Record<string, string>): Promise<{ data: ReplenishmentRule[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/replenishment/rules${qs}`);
  }

  async getReplenishmentSuggestions(params?: Record<string, string>): Promise<{ data: ReplenishmentSuggestion[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/replenishment/suggestions${qs}`);
  }

  async getPriceLists(params?: Record<string, string>): Promise<{ data: PriceList[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/price-lists${qs}`);
  }

  async createPriceList(data: unknown): Promise<{ data: PriceList }> {
    return this.request('/api/v1/price-lists', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPackages(params?: Record<string, string>): Promise<{ data: Package[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/packages${qs}`);
  }

  async createPackage(data: unknown): Promise<{ data: Package }> {
    return this.request('/api/v1/packages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getShipments(params?: Record<string, string>): Promise<{ data: Shipment[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/shipments${qs}`);
  }

  async createShipment(data: unknown): Promise<{ data: Shipment }> {
    return this.request('/api/v1/shipments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateShipment(id: string, data: unknown): Promise<{ data: Shipment }> {
    return this.request(`/api/v1/shipments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getEtimsSubmissions(params?: Record<string, string>): Promise<{ data: EtimsStockSubmission[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/etims${qs}`);
  }

  async retryEtimsSubmission(id: string): Promise<{ data: EtimsStockSubmission }> {
    return this.request(`/api/v1/etims/${id}/retry`, {
      method: 'POST',
    });
  }

  async getWarehouses(): Promise<{ data: Warehouse[] }> {
    return this.request('/api/v1/warehouses');
  }

  async getInventoryMovements(params?: Record<string, string>): Promise<{ data: InventoryMovement[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/reports/inventory${qs}`);
  }

  async getPurchaseOrders(params?: Record<string, string>): Promise<{ data: PurchaseOrder[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/purchase-orders${qs}`);
  }

  // CRM - Leads
  async getLeads(params?: Record<string, string>): Promise<{ data: Lead[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/crm/leads${qs}`);
  }

  async getLead(id: string): Promise<{ data: Lead }> {
    return this.request(`/api/v1/crm/leads/${id}`);
  }

  async createLead(data: Partial<Lead>): Promise<{ data: Lead }> {
    return this.request('/api/v1/crm/leads', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLead(id: string, data: Partial<Lead>): Promise<{ data: Lead }> {
    return this.request(`/api/v1/crm/leads/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteLead(id: string): Promise<void> {
    return this.request(`/api/v1/crm/leads/${id}`, { method: 'DELETE' });
  }

  async convertLead(id: string, data?: Record<string, unknown>): Promise<{ data: Lead }> {
    return this.request(`/api/v1/crm/leads/${id}/convert`, {
      method: 'POST',
      body: JSON.stringify(data ?? {}),
    });
  }

  // CRM - Accounts
  async getCrmAccounts(params?: Record<string, string>): Promise<{ data: CrmAccount[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/crm/accounts${qs}`);
  }

  async getCrmAccount(id: string): Promise<{ data: CrmAccount }> {
    return this.request(`/api/v1/crm/accounts/${id}`);
  }

  async createCrmAccount(data: Partial<CrmAccount>): Promise<{ data: CrmAccount }> {
    return this.request('/api/v1/crm/accounts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCrmAccount(id: string, data: Partial<CrmAccount>): Promise<{ data: CrmAccount }> {
    return this.request(`/api/v1/crm/accounts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCrmAccount(id: string): Promise<void> {
    return this.request(`/api/v1/crm/accounts/${id}`, { method: 'DELETE' });
  }

  // CRM - Contacts
  async getContacts(params?: Record<string, string>): Promise<{ data: Contact[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/crm/contacts${qs}`);
  }

  async getContact(id: string): Promise<{ data: Contact }> {
    return this.request(`/api/v1/crm/contacts/${id}`);
  }

  async createContact(data: Partial<Contact>): Promise<{ data: Contact }> {
    return this.request('/api/v1/crm/contacts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateContact(id: string, data: Partial<Contact>): Promise<{ data: Contact }> {
    return this.request(`/api/v1/crm/contacts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteContact(id: string): Promise<void> {
    return this.request(`/api/v1/crm/contacts/${id}`, { method: 'DELETE' });
  }

  // CRM - Deals
  async getDeals(params?: Record<string, string>): Promise<{ data: Deal[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/crm/deals${qs}`);
  }

  async getDeal(id: string): Promise<{ data: Deal }> {
    return this.request(`/api/v1/crm/deals/${id}`);
  }

  async createDeal(data: Partial<Deal>): Promise<{ data: Deal }> {
    return this.request('/api/v1/crm/deals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDeal(id: string, data: Partial<Deal>): Promise<{ data: Deal }> {
    return this.request(`/api/v1/crm/deals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteDeal(id: string): Promise<void> {
    return this.request(`/api/v1/crm/deals/${id}`, { method: 'DELETE' });
  }

  // CRM - Pipelines
  async getPipelines(params?: Record<string, string>): Promise<{ data: Pipeline[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/crm/pipelines${qs}`);
  }

  async getPipeline(id: string): Promise<{ data: Pipeline }> {
    return this.request(`/api/v1/crm/pipelines/${id}`);
  }

  async createPipeline(data: Partial<Pipeline>): Promise<{ data: Pipeline }> {
    return this.request('/api/v1/crm/pipelines', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePipeline(id: string, data: Partial<Pipeline>): Promise<{ data: Pipeline }> {
    return this.request(`/api/v1/crm/pipelines/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deletePipeline(id: string): Promise<void> {
    return this.request(`/api/v1/crm/pipelines/${id}`, { method: 'DELETE' });
  }

  // CRM - Campaigns
  async getCampaigns(params?: Record<string, string>): Promise<{ data: Campaign[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/crm/campaigns${qs}`);
  }

  async getCampaign(id: string): Promise<{ data: Campaign }> {
    return this.request(`/api/v1/crm/campaigns/${id}`);
  }

  async createCampaign(data: Partial<Campaign>): Promise<{ data: Campaign }> {
    return this.request('/api/v1/crm/campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCampaign(id: string, data: Partial<Campaign>): Promise<{ data: Campaign }> {
    return this.request(`/api/v1/crm/campaigns/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCampaign(id: string): Promise<void> {
    return this.request(`/api/v1/crm/campaigns/${id}`, { method: 'DELETE' });
  }

  // CRM - Cases
  async getCases(params?: Record<string, string>): Promise<{ data: CaseModel[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/crm/cases${qs}`);
  }

  async getCase(id: string): Promise<{ data: CaseModel }> {
    return this.request(`/api/v1/crm/cases/${id}`);
  }

  async createCase(data: Partial<CaseModel>): Promise<{ data: CaseModel }> {
    return this.request('/api/v1/crm/cases', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCase(id: string, data: Partial<CaseModel>): Promise<{ data: CaseModel }> {
    return this.request(`/api/v1/crm/cases/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCase(id: string): Promise<void> {
    return this.request(`/api/v1/crm/cases/${id}`, { method: 'DELETE' });
  }

  // CRM - Deal Stages
  async getDealStages(pipelineId: string, params?: Record<string, string>): Promise<{ data: DealStage[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/pipelines/${pipelineId}/stages${qs}`);
  }

  async getDealStage(pipelineId: string, id: string): Promise<{ data: DealStage }> {
    return this.request(`/api/v1/pipelines/${pipelineId}/stages/${id}`);
  }

  async createDealStage(pipelineId: string, data: Partial<DealStage>): Promise<{ data: DealStage }> {
    return this.request(`/api/v1/pipelines/${pipelineId}/stages`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDealStage(pipelineId: string, id: string, data: Partial<DealStage>): Promise<{ data: DealStage }> {
    return this.request(`/api/v1/pipelines/${pipelineId}/stages/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteDealStage(pipelineId: string, id: string): Promise<void> {
    return this.request(`/api/v1/pipelines/${pipelineId}/stages/${id}`, { method: 'DELETE' });
  }

  // CRM - Activities
  async getActivities(params?: Record<string, string>): Promise<{ data: Activity[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/activities${qs}`);
  }

  async getActivity(id: string): Promise<{ data: Activity }> {
    return this.request(`/api/v1/activities/${id}`);
  }

  async createActivity(data: Partial<Activity>): Promise<{ data: Activity }> {
    return this.request('/api/v1/activities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateActivity(id: string, data: Partial<Activity>): Promise<{ data: Activity }> {
    return this.request(`/api/v1/activities/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteActivity(id: string): Promise<void> {
    return this.request(`/api/v1/activities/${id}`, { method: 'DELETE' });
  }

  // CRM - Communications
  async getCommunications(params?: Record<string, string>): Promise<{ data: Communication[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/communications${qs}`);
  }

  async getCommunication(id: string): Promise<{ data: Communication }> {
    return this.request(`/api/v1/communications/${id}`);
  }

  async createCommunication(data: Partial<Communication>): Promise<{ data: Communication }> {
    return this.request('/api/v1/communications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // CRM - Workflows
  async getWorkflows(params?: Record<string, string>): Promise<{ data: Workflow[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/workflows${qs}`);
  }

  async getWorkflow(id: string): Promise<{ data: Workflow }> {
    return this.request(`/api/v1/workflows/${id}`);
  }

  async createWorkflow(data: Partial<Workflow>): Promise<{ data: Workflow }> {
    return this.request('/api/v1/workflows', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateWorkflow(id: string, data: Partial<Workflow>): Promise<{ data: Workflow }> {
    return this.request(`/api/v1/workflows/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteWorkflow(id: string): Promise<void> {
    return this.request(`/api/v1/workflows/${id}`, { method: 'DELETE' });
  }

  // CRM - SLA Policies
  async getSlas(params?: Record<string, string>): Promise<{ data: SlaPolicy[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/slas${qs}`);
  }

  async getSla(id: string): Promise<{ data: SlaPolicy }> {
    return this.request(`/api/v1/slas/${id}`);
  }

  async createSla(data: Partial<SlaPolicy>): Promise<{ data: SlaPolicy }> {
    return this.request('/api/v1/slas', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSla(id: string, data: Partial<SlaPolicy>): Promise<{ data: SlaPolicy }> {
    return this.request(`/api/v1/slas/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteSla(id: string): Promise<void> {
    return this.request(`/api/v1/slas/${id}`, { method: 'DELETE' });
  }

  // CRM - Custom Fields
  async getCustomFields(params?: Record<string, string>): Promise<{ data: CustomFieldDefinition[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/custom-fields${qs}`);
  }

  async getCustomField(id: string): Promise<{ data: CustomFieldDefinition }> {
    return this.request(`/api/v1/custom-fields/${id}`);
  }

  async createCustomField(data: Partial<CustomFieldDefinition>): Promise<{ data: CustomFieldDefinition }> {
    return this.request('/api/v1/custom-fields', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCustomField(id: string, data: Partial<CustomFieldDefinition>): Promise<{ data: CustomFieldDefinition }> {
    return this.request(`/api/v1/custom-fields/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCustomField(id: string): Promise<void> {
    return this.request(`/api/v1/custom-fields/${id}`, { method: 'DELETE' });
  }

  // CRM - Territories
  async getTerritories(params?: Record<string, string>): Promise<{ data: Territory[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/territories${qs}`);
  }

  async getTerritory(id: string): Promise<{ data: Territory }> {
    return this.request(`/api/v1/territories/${id}`);
  }

  async createTerritory(data: Partial<Territory>): Promise<{ data: Territory }> {
    return this.request('/api/v1/territories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTerritory(id: string, data: Partial<Territory>): Promise<{ data: Territory }> {
    return this.request(`/api/v1/territories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteTerritory(id: string): Promise<void> {
    return this.request(`/api/v1/territories/${id}`, { method: 'DELETE' });
  }

  // CRM - Price Books
  async getPriceBooks(params?: Record<string, string>): Promise<{ data: PriceBook[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/price-books${qs}`);
  }

  async getPriceBook(id: string): Promise<{ data: PriceBook }> {
    return this.request(`/api/v1/price-books/${id}`);
  }

  async createPriceBook(data: Partial<PriceBook>): Promise<{ data: PriceBook }> {
    return this.request('/api/v1/price-books', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePriceBook(id: string, data: Partial<PriceBook>): Promise<{ data: PriceBook }> {
    return this.request(`/api/v1/price-books/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deletePriceBook(id: string): Promise<void> {
    return this.request(`/api/v1/price-books/${id}`, { method: 'DELETE' });
  }

  // CRM - Knowledge Articles
  async getKnowledgeArticles(params?: Record<string, string>): Promise<{ data: KnowledgeArticle[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/knowledge${qs}`);
  }

  async getKnowledgeArticle(id: string): Promise<{ data: KnowledgeArticle }> {
    return this.request(`/api/v1/knowledge/${id}`);
  }

  async createKnowledgeArticle(data: Partial<KnowledgeArticle>): Promise<{ data: KnowledgeArticle }> {
    return this.request('/api/v1/knowledge', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateKnowledgeArticle(id: string, data: Partial<KnowledgeArticle>): Promise<{ data: KnowledgeArticle }> {
    return this.request(`/api/v1/knowledge/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteKnowledgeArticle(id: string): Promise<void> {
    return this.request(`/api/v1/knowledge/${id}`, { method: 'DELETE' });
  }

  // CRM - Sequences
  async getSequences(params?: Record<string, string>): Promise<{ data: Sequence[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/sequences${qs}`);
  }

  async getSequence(id: string): Promise<{ data: Sequence }> {
    return this.request(`/api/v1/sequences/${id}`);
  }

  async createSequence(data: Partial<Sequence>): Promise<{ data: Sequence }> {
    return this.request('/api/v1/sequences', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSequence(id: string, data: Partial<Sequence>): Promise<{ data: Sequence }> {
    return this.request(`/api/v1/sequences/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteSequence(id: string): Promise<void> {
    return this.request(`/api/v1/sequences/${id}`, { method: 'DELETE' });
  }

  // CRM - Lead Scoring Rules
  async getLeadScoringRules(params?: Record<string, string>): Promise<{ data: LeadScoringRule[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/lead-scoring-rules${qs}`);
  }

  async getLeadScoringRule(id: string): Promise<{ data: LeadScoringRule }> {
    return this.request(`/api/v1/lead-scoring-rules/${id}`);
  }

  async createLeadScoringRule(data: Partial<LeadScoringRule>): Promise<{ data: LeadScoringRule }> {
    return this.request('/api/v1/lead-scoring-rules', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLeadScoringRule(id: string, data: Partial<LeadScoringRule>): Promise<{ data: LeadScoringRule }> {
    return this.request(`/api/v1/lead-scoring-rules/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteLeadScoringRule(id: string): Promise<void> {
    return this.request(`/api/v1/lead-scoring-rules/${id}`, { method: 'DELETE' });
  }

  // CRM - Lead Assignments
  async getLeadAssignments(params?: Record<string, string>): Promise<{ data: LeadAssignment[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/lead-assignments${qs}`);
  }

  async getLeadAssignment(id: string): Promise<{ data: LeadAssignment }> {
    return this.request(`/api/v1/lead-assignments/${id}`);
  }

  async createLeadAssignment(data: Partial<LeadAssignment>): Promise<{ data: LeadAssignment }> {
    return this.request('/api/v1/lead-assignments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLeadAssignment(id: string, data: Partial<LeadAssignment>): Promise<{ data: LeadAssignment }> {
    return this.request(`/api/v1/lead-assignments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteLeadAssignment(id: string): Promise<void> {
    return this.request(`/api/v1/lead-assignments/${id}`, { method: 'DELETE' });
  }

  // Procurement - Purchase Requisitions
  async getPurchaseRequisitions(params?: Record<string, string>): Promise<{ data: PurchaseRequisition[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/procurement/requisitions${qs}`);
  }

  async getPurchaseRequisition(id: string): Promise<{ data: PurchaseRequisition }> {
    return this.request(`/api/v1/procurement/requisitions/${id}`);
  }

  async createPurchaseRequisition(data: Partial<PurchaseRequisition>): Promise<{ data: PurchaseRequisition }> {
    return this.request('/api/v1/procurement/requisitions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePurchaseRequisition(id: string, data: Partial<PurchaseRequisition>): Promise<{ data: PurchaseRequisition }> {
    return this.request(`/api/v1/procurement/requisitions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deletePurchaseRequisition(id: string): Promise<void> {
    return this.request(`/api/v1/procurement/requisitions/${id}`, { method: 'DELETE' });
  }

  // Procurement - RFQs
  async getRfqs(params?: Record<string, string>): Promise<{ data: Rfq[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/procurement/rfqs${qs}`);
  }

  async getRfq(id: string): Promise<{ data: Rfq }> {
    return this.request(`/api/v1/procurement/rfqs/${id}`);
  }

  async createRfq(data: Partial<Rfq>): Promise<{ data: Rfq }> {
    return this.request('/api/v1/procurement/rfqs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRfq(id: string, data: Partial<Rfq>): Promise<{ data: Rfq }> {
    return this.request(`/api/v1/procurement/rfqs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteRfq(id: string): Promise<void> {
    return this.request(`/api/v1/procurement/rfqs/${id}`, { method: 'DELETE' });
  }

  async publishRfq(id: string): Promise<{ data: Rfq }> {
    return this.request(`/api/v1/procurement/rfqs/${id}/publish`, {
      method: 'POST',
    });
  }

  async closeRfq(id: string): Promise<{ data: Rfq }> {
    return this.request(`/api/v1/procurement/rfqs/${id}/close`, {
      method: 'POST',
    });
  }

  // Procurement - Tenders
  async getTenders(params?: Record<string, string>): Promise<{ data: Tender[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/procurement/tenders${qs}`);
  }

  async getTender(id: string): Promise<{ data: Tender }> {
    return this.request(`/api/v1/procurement/tenders/${id}`);
  }

  async createTender(data: Partial<Tender>): Promise<{ data: Tender }> {
    return this.request('/api/v1/procurement/tenders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTender(id: string, data: Partial<Tender>): Promise<{ data: Tender }> {
    return this.request(`/api/v1/procurement/tenders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteTender(id: string): Promise<void> {
    return this.request(`/api/v1/procurement/tenders/${id}`, { method: 'DELETE' });
  }

  // Procurement - Supplier Invoices
  async getSupplierInvoices(params?: Record<string, string>): Promise<{ data: SupplierInvoice[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/procurement/invoices${qs}`);
  }

  async getSupplierInvoice(id: string): Promise<{ data: SupplierInvoice }> {
    return this.request(`/api/v1/procurement/invoices/${id}`);
  }

  async createSupplierInvoice(data: Partial<SupplierInvoice>): Promise<{ data: SupplierInvoice }> {
    return this.request('/api/v1/procurement/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSupplierInvoice(id: string, data: Partial<SupplierInvoice>): Promise<{ data: SupplierInvoice }> {
    return this.request(`/api/v1/procurement/invoices/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteSupplierInvoice(id: string): Promise<void> {
    return this.request(`/api/v1/procurement/invoices/${id}`, { method: 'DELETE' });
  }

  // Procurement - Three Way Matches
  async getThreeWayMatches(params?: Record<string, string>): Promise<{ data: ThreeWayMatch[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/procurement/matches${qs}`);
  }

  async getThreeWayMatch(id: string): Promise<{ data: ThreeWayMatch }> {
    return this.request(`/api/v1/procurement/matches/${id}`);
  }

  async createThreeWayMatch(data: Partial<ThreeWayMatch>): Promise<{ data: ThreeWayMatch }> {
    return this.request('/api/v1/procurement/matches', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateThreeWayMatch(id: string, data: Partial<ThreeWayMatch>): Promise<{ data: ThreeWayMatch }> {
    return this.request(`/api/v1/procurement/matches/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteThreeWayMatch(id: string): Promise<void> {
    return this.request(`/api/v1/procurement/matches/${id}`, { method: 'DELETE' });
  }

  // Procurement - Payment Vouchers
  async getPaymentVouchers(params?: Record<string, string>): Promise<{ data: PaymentVoucher[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/procurement/payment-vouchers${qs}`);
  }

  async getPaymentVoucher(id: string): Promise<{ data: PaymentVoucher }> {
    return this.request(`/api/v1/procurement/payment-vouchers/${id}`);
  }

  async createPaymentVoucher(data: Partial<PaymentVoucher>): Promise<{ data: PaymentVoucher }> {
    return this.request('/api/v1/procurement/payment-vouchers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePaymentVoucher(id: string, data: Partial<PaymentVoucher>): Promise<{ data: PaymentVoucher }> {
    return this.request(`/api/v1/procurement/payment-vouchers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deletePaymentVoucher(id: string): Promise<void> {
    return this.request(`/api/v1/procurement/payment-vouchers/${id}`, { method: 'DELETE' });
  }

  // Procurement - Supplier Payments
  async getSupplierPayments(params?: Record<string, string>): Promise<{ data: SupplierPayment[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/procurement/payments${qs}`);
  }

  async getSupplierPayment(id: string): Promise<{ data: SupplierPayment }> {
    return this.request(`/api/v1/procurement/payments/${id}`);
  }

  async createSupplierPayment(data: Partial<SupplierPayment>): Promise<{ data: SupplierPayment }> {
    return this.request('/api/v1/procurement/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSupplierPayment(id: string, data: Partial<SupplierPayment>): Promise<{ data: SupplierPayment }> {
    return this.request(`/api/v1/procurement/payments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteSupplierPayment(id: string): Promise<void> {
    return this.request(`/api/v1/procurement/payments/${id}`, { method: 'DELETE' });
  }

  // Procurement - Payment Reconciliations
  async getPaymentReconciliations(params?: Record<string, string>): Promise<{ data: PaymentReconciliation[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/procurement/reconciliations${qs}`);
  }

  async getPaymentReconciliation(id: string): Promise<{ data: PaymentReconciliation }> {
    return this.request(`/api/v1/procurement/reconciliations/${id}`);
  }

  async createPaymentReconciliation(data: Partial<PaymentReconciliation>): Promise<{ data: PaymentReconciliation }> {
    return this.request('/api/v1/procurement/reconciliations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePaymentReconciliation(id: string, data: Partial<PaymentReconciliation>): Promise<{ data: PaymentReconciliation }> {
    return this.request(`/api/v1/procurement/reconciliations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deletePaymentReconciliation(id: string): Promise<void> {
    return this.request(`/api/v1/procurement/reconciliations/${id}`, { method: 'DELETE' });
  }

  // Procurement - Contracts
  async getProcurementContracts(params?: Record<string, string>): Promise<{ data: ProcurementContract[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/procurement/contracts${qs}`);
  }

  async getProcurementContract(id: string): Promise<{ data: ProcurementContract }> {
    return this.request(`/api/v1/procurement/contracts/${id}`);
  }

  async createProcurementContract(data: Partial<ProcurementContract>): Promise<{ data: ProcurementContract }> {
    return this.request('/api/v1/procurement/contracts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProcurementContract(id: string, data: Partial<ProcurementContract>): Promise<{ data: ProcurementContract }> {
    return this.request(`/api/v1/procurement/contracts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteProcurementContract(id: string): Promise<void> {
    return this.request(`/api/v1/procurement/contracts/${id}`, { method: 'DELETE' });
  }

  // Procurement - Approval Rules
  async getApprovalRules(params?: Record<string, string>): Promise<{ data: ApprovalRule[] }> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/v1/procurement/approval-rules${qs}`);
  }

  async getApprovalRule(id: string): Promise<{ data: ApprovalRule }> {
    return this.request(`/api/v1/procurement/approval-rules/${id}`);
  }

  async createApprovalRule(data: Partial<ApprovalRule>): Promise<{ data: ApprovalRule }> {
    return this.request('/api/v1/procurement/approval-rules', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateApprovalRule(id: string, data: Partial<ApprovalRule>): Promise<{ data: ApprovalRule }> {
    return this.request(`/api/v1/procurement/approval-rules/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteApprovalRule(id: string): Promise<void> {
    return this.request(`/api/v1/procurement/approval-rules/${id}`, { method: 'DELETE' });
  }
}
