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
  Terminal,
  Account,
  JournalEntry,
  Invoice,
  Bill,
  Expense,
  BankAccount,
  BankTransaction,
  BankReconciliation,
  FiscalYear,
  AccountingPeriod,
  TaxRate,
  Supplier,
  ExpenseCategory,
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

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
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

  async getSuppliers(): Promise<{ data: Supplier[] }> {
    return this.request('/api/v1/suppliers');
  }
}
