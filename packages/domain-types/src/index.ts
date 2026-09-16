export type UUID = string;
export type ISODateString = string;

export type SyncStatus = 'synced' | 'pending' | 'conflict' | 'failed';

export interface BaseEntity {
  id: UUID;
  organization_id: UUID;
  business_id: UUID;
  created_at: ISODateString;
  updated_at: ISODateString;
  deleted_at?: ISODateString | null;
}

export interface OfflineTrackable {
  local_id?: string;
  server_id?: string;
  device_id?: string;
  version: number;
  sync_status: SyncStatus;
}

export interface Organization {
  id: UUID;
  name: string;
  slug: string;
  tax_number?: string;
  country_code: string;
  currency: string;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface Business {
  id: UUID;
  organization_id: UUID;
  name: string;
  business_type: 'retail' | 'supermarket' | 'restaurant' | 'pharmacy' | 'wholesale' | 'services' | 'general';
  tax_pin?: string;
  currency: string;
  is_active: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface Branch {
  id: UUID;
  organization_id: UUID;
  business_id: UUID;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  is_active: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface Warehouse {
  id: UUID;
  organization_id: UUID;
  business_id: UUID;
  branch_id?: UUID | null;
  name: string;
  code: string;
  is_active: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface Terminal {
  id: UUID;
  organization_id: UUID;
  business_id: UUID;
  branch_id: UUID;
  name: string;
  terminal_code: string;
  is_active: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface Device {
  id: UUID;
  organization_id: UUID;
  business_id: UUID;
  branch_id: UUID;
  terminal_id?: UUID | null;
  device_uuid: string;
  device_name: string;
  status: 'pending' | 'approved' | 'disabled' | 'revoked';
  last_seen_at?: ISODateString | null;
  last_sync_at?: ISODateString | null;
  app_version?: string;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface User {
  id: UUID;
  organization_id: UUID;
  business_id?: UUID;
  name: string;
  email: string;
  phone?: string;
  role: 'owner' | 'admin' | 'branch_manager' | 'cashier' | 'accountant' | 'inventory_manager' | 'supervisor' | 'super-admin';
  permissions: string[];
  is_active: boolean;
  is_super_admin?: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface Membership {
  organization_id: UUID;
  organization_name: string;
  role_id?: UUID;
  role_slug: string;
  status: string;
}

export interface SubscriptionSummary {
  id: UUID;
  status: string;
  plan_name?: string;
  current_period_ends_at?: ISODateString;
}

export interface ProductEntitlement {
  products: Record<string, boolean>;
}

export interface AuthContext {
  user: User;
  organization: Organization | null;
  business: { id: UUID; name: string } | null;
  subscription: SubscriptionSummary | null;
  entitlements: ProductEntitlement;
  memberships: Membership[];
}

export interface ProductCategory {
  id: UUID;
  organization_id: UUID;
  business_id: UUID;
  name: string;
  slug: string;
  parent_id?: UUID | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export type Category = ProductCategory;

export interface ProductPrice {
  price_type: 'retail' | 'wholesale' | 'distributor' | 'branch';
  branch_id?: UUID | null;
  amount_minor: number; // In cents / minor units
  currency: string;
}

export interface Product extends BaseEntity, OfflineTrackable {
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  category_id?: UUID | null;
  tax_category_code: string; // e.g. "A" (16% VAT), "B" (0%), "E" (Exempt)
  unit: string;
  cost_price_minor: number;
  selling_price_minor: number;
  prices?: ProductPrice[];
  reorder_level: number;
  track_inventory: boolean;
  is_active: boolean;
}

export interface InventoryMovement {
  id: UUID;
  organization_id: UUID;
  business_id: UUID;
  branch_id: UUID;
  warehouse_id?: UUID | null;
  product_id: UUID;
  movement_type: 'purchase' | 'sale' | 'return' | 'damage' | 'transfer' | 'adjustment';
  quantity_change: number; // positive or negative
  balance_after: number;
  reference_type: string; // e.g. "sale", "purchase_order", "stock_adjustment"
  reference_id: string;
  notes?: string;
  created_by_user_id: UUID;
  created_at: ISODateString;
}

export interface Customer extends BaseEntity, OfflineTrackable {
  code?: string;
  name: string;
  phone?: string;
  email?: string;
  tax_pin?: string;
  credit_limit_minor: number;
  current_balance_minor: number;
  loyalty_points: number;
  price_level: 'retail' | 'wholesale' | 'distributor';
}

export interface Supplier extends BaseEntity {
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  tax_pin?: string;
  current_balance_minor: number;
}

export interface SaleItem {
  id: UUID;
  sale_id: UUID;
  product_id: UUID;
  sku: string;
  name: string;
  quantity: number;
  unit_price_minor: number;
  discount_minor: number;
  tax_rate_percentage: number;
  tax_amount_minor: number;
  subtotal_minor: number;
  total_minor: number;
}

export interface SaleItemInput {
  product_id: UUID;
  sku: string;
  name: string;
  quantity: number;
  unit_price_minor: number;
  discount_minor: number;
  tax_rate_percentage: number;
}

export type PaymentMethod = 'cash' | 'card' | 'mpesa' | 'airtel' | 'bank' | 'credit' | 'points';

export interface PaymentTransaction {
  id: UUID;
  sale_id: UUID;
  amount_minor: number;
  currency: string;
  payment_method: PaymentMethod;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  reference?: string;
  external_transaction_id?: string;
  provider_response?: Record<string, unknown>;
  created_at: ISODateString;
}

export type SaleStatus = 'draft' | 'completed' | 'cancelled' | 'refunded' | 'partially_refunded';

export interface Sale extends BaseEntity, OfflineTrackable {
  branch_id: UUID;
  terminal_id?: UUID | null;
  cashier_user_id: UUID;
  shift_id?: UUID | null;
  customer_id?: UUID | null;
  receipt_number: string;
  invoice_number?: string;
  status: SaleStatus;
  subtotal_minor: number;
  discount_minor: number;
  tax_total_minor: number;
  grand_total_minor: number;
  paid_total_minor: number;
  change_due_minor: number;
  items: SaleItem[];
  payments: PaymentTransaction[];
  tax_submission_status?: 'pending' | 'submitted' | 'accepted' | 'rejected' | 'failed';
  accounting_sync_status?: 'pending' | 'synced' | 'failed' | 'ignored';
  notes?: string;
}

export interface CashShift {
  id: UUID;
  organization_id: UUID;
  business_id: UUID;
  branch_id: UUID;
  terminal_id: UUID;
  cashier_user_id: UUID;
  status: 'open' | 'closed';
  opened_at: ISODateString;
  closed_at?: ISODateString | null;
  opening_float_minor: number;
  expected_cash_minor?: number;
  actual_cash_minor?: number;
  variance_minor?: number;
  cash_sales_minor: number;
  cash_in_minor: number;
  cash_out_minor: number;
  cash_refunds_minor: number;
  notes?: string;
}

export interface SyncPushPayload {
  device_id: string;
  branch_id: string;
  cursor: string;
  operations: Array<{
    operation_id: string;
    idempotency_key: string;
    entity_name: 'sales' | 'payments' | 'customers' | 'inventory_movements' | 'cash_shifts';
    action: 'create' | 'update' | 'delete';
    local_id: string;
    data: Record<string, unknown>;
    created_at: ISODateString;
  }>;
}

export interface SyncPushResponse {
  cursor: string;
  accepted: Array<{ operation_id: string; local_id: string; server_id: string }>;
  rejected: Array<{ operation_id: string; local_id: string; reason: string }>;
  conflicts: Array<{ operation_id: string; local_id: string; server_version: unknown }>;
}

export interface SyncPullPayload {
  device_id: string;
  branch_id: string;
  since_cursor?: string | null;
  entities?: string[];
}

export interface SyncPullResponse {
  next_cursor: string;
  has_more: boolean;
  changes: {
    products?: Product[];
    categories?: ProductCategory[];
    customers?: Customer[];
    tax_rules?: unknown[];
    branch_config?: Record<string, unknown>;
  };
}

export interface PurchaseOrder {
  id: UUID;
  organization_id: UUID;
  business_id: UUID;
  branch_id: UUID;
  supplier_id: UUID;
  order_number: string;
  status: 'draft' | 'approved' | 'ordered' | 'received' | 'cancelled';
  subtotal_minor: number;
  tax_total_minor: number;
  grand_total_minor: number;
  notes?: string;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface PurchaseOrderItem {
  id: UUID;
  purchase_order_id: UUID;
  product_id: UUID;
  quantity: number;
  unit_cost_minor: number;
  total_minor: number;
  created_at: ISODateString;
}

export interface GoodsReceivedNote {
  id: UUID;
  organization_id: UUID;
  business_id: UUID;
  branch_id: UUID;
  purchase_order_id: UUID;
  grn_number: string;
  received_at: ISODateString;
  notes?: string;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface GoodsReceivedNoteItem {
  id: UUID;
  grn_id: UUID;
  product_id: UUID;
  quantity_received: number;
  created_at: ISODateString;
}

export interface Refund {
  id: UUID;
  organization_id: UUID;
  business_id: UUID;
  sale_id: UUID;
  refund_number: string;
  reason: string;
  status: 'pending' | 'completed' | 'cancelled';
  refund_amount_minor: number;
  notes?: string;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface RefundItem {
  id: UUID;
  refund_id: UUID;
  sale_item_id: UUID;
  product_id: UUID;
  quantity: number;
  unit_price_minor: number;
  total_minor: number;
  created_at: ISODateString;
}

export interface ReturnModel {
  id: UUID;
  organization_id: UUID;
  business_id: UUID;
  sale_id: UUID;
  return_number: string;
  reason: string;
  status: 'pending' | 'received' | 'completed' | 'cancelled';
  notes?: string;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface ReturnItem {
  id: UUID;
  return_id: UUID;
  sale_item_id: UUID;
  product_id: UUID;
  quantity: number;
  unit_price_minor: number;
  total_minor: number;
  created_at: ISODateString;
}

export interface Account {
  id: UUID;
  organization_id: UUID;
  business_id: UUID;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  currency: string;
  is_active: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface JournalEntry {
  id: UUID;
  organization_id: UUID;
  business_id: UUID;
  reference_type: string;
  reference_id: string;
  entry_date: string;
  notes?: string;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface JournalLine {
  id: UUID;
  journal_entry_id: UUID;
  account_id: UUID;
  description?: string;
  debit_minor: number;
  credit_minor: number;
  created_at: ISODateString;
}

export interface ReportData {
  generated_at: ISODateString;
  filters: Record<string, unknown>;
  data: Record<string, unknown>;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'void';
export type BillStatus = 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled' | 'void';
export type ExpenseStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid' | 'reimbursed';
export type PaymentDirection = 'in' | 'out';
export type BankTransactionType = 'deposit' | 'withdrawal' | 'transfer' | 'fee' | 'interest' | 'other';
export type BankReconciliationStatus = 'draft' | 'in_progress' | 'completed' | 'discrepancy';
export type AccountingPeriodStatus = 'open' | 'closed' | 'locked';
export type JournalEntryStatus = 'draft' | 'posted' | 'void';

export interface TaxRate {
  id: UUID;
  organization_id: UUID;
  business_id: UUID;
  name: string;
  code: string;
  percentage: number;
  is_active: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface FiscalYear {
  id: UUID;
  organization_id: UUID;
  business_id: UUID;
  name: string;
  start_date: string;
  end_date: string;
  is_closed: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface AccountingPeriod {
  id: UUID;
  organization_id: UUID;
  business_id: UUID;
  fiscal_year_id: UUID;
  name: string;
  start_date: string;
  end_date: string;
  status: AccountingPeriodStatus;
  is_closed: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface BankAccount {
  id: UUID;
  organization_id: UUID;
  business_id: UUID;
  branch_id?: UUID | null;
  account_name: string;
  account_number: string;
  bank_name: string;
  currency: string;
  opening_balance_minor: number;
  current_balance_minor: number;
  is_active: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface BankTransaction {
  id: UUID;
  organization_id: UUID;
  business_id: UUID;
  bank_account_id: UUID;
  transaction_type: BankTransactionType;
  direction: PaymentDirection;
  amount_minor: number;
  currency: string;
  reference?: string;
  description?: string;
  transaction_date: string;
  reconciled: boolean;
  bank_reconciliation_id?: UUID | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface BankReconciliation {
  id: UUID;
  organization_id: UUID;
  business_id: UUID;
  bank_account_id: UUID;
  fiscal_year_id?: UUID | null;
  accounting_period_id?: UUID | null;
  start_date: string;
  end_date: string;
  statement_opening_balance_minor: number;
  statement_closing_balance_minor: number;
  book_closing_balance_minor: number;
  status: BankReconciliationStatus;
  notes?: string;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface BankReconciliationItem {
  id: UUID;
  bank_reconciliation_id: UUID;
  bank_transaction_id: UUID;
  amount_minor: number;
  currency: string;
  direction: PaymentDirection;
  reference?: string;
  description?: string;
  transaction_date: string;
  is_cleared: boolean;
  created_at: ISODateString;
}

export interface ExpenseCategory {
  id: UUID;
  organization_id: UUID;
  business_id: UUID;
  name: string;
  code: string;
  description?: string;
  is_active: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface Expense {
  id: UUID;
  organization_id: UUID;
  business_id: UUID;
  branch_id?: UUID | null;
  expense_category_id: UUID;
  reference_number: string;
  description: string;
  amount_minor: number;
  currency: string;
  expense_date: string;
  payment_method: PaymentMethod;
  payment_reference?: string;
  status: ExpenseStatus;
  receipt_url?: string;
  notes?: string;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface Invoice {
  id: UUID;
  organization_id: UUID;
  business_id: UUID;
  branch_id?: UUID | null;
  invoice_number: string;
  customer_id?: UUID | null;
  customer_name: string;
  invoice_date: string;
  due_date: string;
  currency: string;
  subtotal_minor: number;
  tax_total_minor: number;
  grand_total_minor: number;
  paid_total_minor: number;
  balance_minor: number;
  status: InvoiceStatus;
  notes?: string;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface InvoiceItem {
  id: UUID;
  invoice_id: UUID;
  description: string;
  quantity: number;
  unit_price_minor: number;
  discount_minor: number;
  tax_rate_code: string;
  tax_rate_percentage: number;
  tax_amount_minor: number;
  subtotal_minor: number;
  total_minor: number;
  created_at: ISODateString;
}

export interface Bill {
  id: UUID;
  organization_id: UUID;
  business_id: UUID;
  branch_id?: UUID | null;
  bill_number: string;
  supplier_id?: UUID | null;
  supplier_name: string;
  bill_date: string;
  due_date: string;
  currency: string;
  subtotal_minor: number;
  tax_total_minor: number;
  grand_total_minor: number;
  paid_total_minor: number;
  balance_minor: number;
  status: BillStatus;
  notes?: string;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface BillItem {
  id: UUID;
  bill_id: UUID;
  description: string;
  quantity: number;
  unit_cost_minor: number;
  discount_minor: number;
  tax_rate_code: string;
  tax_rate_percentage: number;
  tax_amount_minor: number;
  subtotal_minor: number;
  total_minor: number;
  created_at: ISODateString;
}

export interface LedgerLine {
  id: UUID;
  organization_id: UUID;
  business_id: UUID;
  journal_entry_id: UUID;
  journal_line_id: UUID;
  account_id: UUID;
  account_code: string;
  account_name: string;
  description?: string;
  debit_minor: number;
  credit_minor: number;
  transaction_date: string;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface TrialBalanceRow {
  account_id: UUID;
  account_code: string;
  account_name: string;
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  opening_balance_minor: number;
  debit_minor: number;
  credit_minor: number;
  closing_balance_minor: number;
}

export interface ProfitLossRow {
  account_id: UUID;
  account_code: string;
  account_name: string;
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  amount_minor: number;
  is_subtotal: boolean;
  parent_account_code?: string;
  level: number;
}

export interface BalanceSheetRow {
  account_id: UUID;
  account_code: string;
  account_name: string;
  account_type: 'asset' | 'liability' | 'equity';
  amount_minor: number;
  is_subtotal: boolean;
  parent_account_code?: string;
  level: number;
}
