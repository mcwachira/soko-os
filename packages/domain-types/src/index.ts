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

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'void';
export type BillStatus = 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled' | 'void';
export type ExpenseStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid' | 'reimbursed';
export type PaymentDirection = 'in' | 'out';
export type BankTransactionType = 'deposit' | 'withdrawal' | 'transfer' | 'fee' | 'interest' | 'other';
export type BankReconciliationStatus = 'draft' | 'in_progress' | 'completed' | 'discrepancy';
export type AccountingPeriodStatus = 'open' | 'closed' | 'locked';
export type JournalEntryStatus = 'draft' | 'posted' | 'void';

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'cancelled';
export type SalesOrderStatus = 'draft' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type CreditNoteStatus = 'draft' | 'issued' | 'applied' | 'cancelled' | 'void';
export type DebitNoteStatus = 'draft' | 'issued' | 'applied' | 'cancelled' | 'void';

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

export interface Payment {
  id: UUID;
  organization_id: UUID;
  business_id: UUID;
  customer_id?: UUID | null;
  sale_id?: UUID | null;
  payment_type: string;
  reference_type?: string;
  reference_id?: UUID | null;
  amount_minor: number;
  currency: string;
  payment_method: string;
  reference?: string;
  external_transaction_id?: string;
  provider_response?: Record<string, unknown>;
  notes?: string;
  status: string;
  created_at: ISODateString;
  updated_at: ISODateString;
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

export interface Cart {
  id: UUID;
  organization_id: UUID;
  business_id: UUID;
  branch_id: UUID;
  terminal_id?: UUID | null;
  user_id: UUID;
  customer_id?: UUID | null;
  status: 'active' | 'held' | 'completed' | 'abandoned';
  subtotal_minor: number;
  discount_minor: number;
  tax_total_minor: number;
  grand_total_minor: number;
  notes?: string;
  held_at?: ISODateString | null;
  completed_at?: ISODateString | null;
  items: CartItem[];
  customer?: Customer | null;
}

export interface CartItem {
  id: UUID;
  cart_id: UUID;
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

export interface PriceOverride {
  id: UUID;
  organization_id: UUID;
  business_id: UUID;
  sale_id?: UUID | null;
  sale_item_id?: UUID | null;
  product_id: UUID;
  user_id: UUID;
  approved_by_user_id?: UUID | null;
  original_price_minor: number;
  new_price_minor: number;
  difference_minor: number;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_at?: ISODateString | null;
}

export interface CashMovement {
  id: UUID;
  organization_id: UUID;
  business_id: UUID;
  branch_id: UUID;
  terminal_id?: UUID | null;
  shift_id?: UUID | null;
  user_id: UUID;
  movement_type: 'cash_in' | 'cash_out' | 'safe_drop' | 'float';
  amount_minor: number;
  currency: string;
  reference?: string;
  notes?: string;
}

export interface LoyaltyAccount {
  id: UUID;
  organization_id: UUID;
  customer_id: UUID;
  tier: 'bronze' | 'silver' | 'gold';
  points_balance: number;
  total_earned: number;
  total_redeemed: number;
  customer?: Customer;
}

export interface StoreCredit {
  id: UUID;
  organization_id: UUID;
  customer_id: UUID;
  amount_minor: number;
  currency: string;
  type: 'issued' | 'redeemed' | 'refunded' | 'adjusted';
  reference_type?: string;
  reference_id?: string;
  notes?: string;
  customer?: Customer;
}

export interface QuickKey {
  id: UUID;
  organization_id: UUID;
  business_id: UUID;
  branch_id?: UUID | null;
  terminal_id?: UUID | null;
  name: string;
  action_type: 'product' | 'variant' | 'service' | 'custom';
  action_data: Record<string, unknown>;
  color: string;
  position: number;
  is_active: boolean;
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
  warehouse_id: UUID;
  supplier_id: UUID;
  user_id: UUID;
  po_number: string;
  status: 'draft' | 'approved' | 'ordered' | 'partial_received' | 'received' | 'cancelled';
  subtotal_minor: number;
  tax_total_minor: number;
  grand_total_minor: number;
  expected_date?: ISODateString;
  received_date?: ISODateString;
  notes?: string;
  created_at: ISODateString;
  updated_at: ISODateString;
  supplier?: { id: UUID; name: string };
  warehouse?: { id: UUID; name: string };
}

export interface PurchaseOrderItem {
  id: UUID;
  purchase_order_id: UUID;
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
  received_quantity: number;
  created_at: ISODateString;
}

export interface GoodsReceivedNote {
  id: UUID;
  organization_id: UUID;
  business_id: UUID;
  branch_id: UUID;
  warehouse_id: UUID;
  purchase_order_id: UUID;
  supplier_id: UUID;
  grn_number: string;
  received_by_user_id: UUID;
  notes?: string;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface GoodsReceivedNoteItem {
  id: UUID;
  grn_id: UUID;
  purchase_order_item_id: UUID;
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
  sale_receipt_number?: string | null;
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

export interface PaymentAllocation {
  id: UUID;
  organization_id: UUID;
  payment_id: UUID;
  allocatable_type: string;
  allocatable_id: UUID;
  allocated_minor: number;
  created_at: ISODateString;
  updated_at: ISODateString;
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

export interface Quote {
  id: UUID;
  organization_id: UUID;
  business_id: UUID;
  branch_id?: UUID | null;
  customer_id?: UUID | null;
  customer_name?: string | null;
  quote_number: string;
  status: QuoteStatus;
  quote_date: string;
  expiry_date: string;
  currency: string;
  subtotal_minor: number;
  discount_minor: number;
  tax_total_minor: number;
  grand_total_minor: number;
  terms?: string;
  notes?: string;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface SalesOrder {
  id: UUID;
  organization_id: UUID;
  business_id: UUID;
  branch_id?: UUID | null;
  customer_id?: UUID | null;
  customer_name?: string | null;
  quote_id?: UUID | null;
  sales_order_number: string;
  status: SalesOrderStatus;
  order_date: string;
  expected_delivery_date: string;
  currency: string;
  subtotal_minor: number;
  discount_minor: number;
  tax_total_minor: number;
  grand_total_minor: number;
  notes?: string;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface CreditNote {
  id: UUID;
  organization_id: UUID;
  business_id: UUID;
  branch_id?: UUID | null;
  customer_id?: UUID | null;
  customer_name?: string | null;
  invoice_id?: UUID | null;
  credit_note_number: string;
  status: CreditNoteStatus;
  credit_date: string;
  currency: string;
  subtotal_minor: number;
  tax_total_minor: number;
  total_minor: number;
  reason?: string;
  notes?: string;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface DebitNote {
  id: UUID;
  organization_id: UUID;
  business_id: UUID;
  branch_id?: UUID | null;
  supplier_id?: UUID | null;
  supplier_name?: string | null;
  bill_id?: UUID | null;
  debit_note_number: string;
  status: DebitNoteStatus;
  debit_date: string;
  currency: string;
  subtotal_minor: number;
  tax_total_minor: number;
  total_minor: number;
  reason?: string;
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

export interface Project {
  id: UUID;
  organization_id: UUID;
  business_id: UUID;
  customer_id?: UUID | null;
  customer_name?: string | null;
  name: string;
  description?: string | null;
  status: 'active' | 'completed' | 'on_hold' | 'cancelled';
  start_date?: string | null;
  end_date?: string | null;
  budget_minor: number;
  billed_minor: number;
  cost_minor: number;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface Task {
  id: UUID;
  organization_id: UUID;
  business_id: UUID;
  project_id: UUID;
  project_name?: string;
  name: string;
  description?: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assigned_to_user_id?: UUID | null;
  assigned_to_name?: string | null;
  due_date?: string | null;
  estimated_minor: number;
  actual_minor: number;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface Timesheet {
  id: UUID;
  organization_id: UUID;
  business_id: UUID;
  project_id: UUID;
  project_name?: string;
  task_id?: UUID | null;
  task_name?: string | null;
  user_id: UUID;
  user_name?: string;
  date: string;
  hours: number;
  is_billable: boolean;
  rate_minor: number;
  notes?: string | null;
  status: 'draft' | 'submitted' | 'approved';
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface ProjectExpense {
  id: UUID;
  organization_id: UUID;
  business_id: UUID;
  project_id: UUID;
  project_name?: string;
  task_id?: UUID | null;
  task_name?: string | null;
  name: string;
  description?: string | null;
  amount_minor: number;
  currency: string;
  is_billable: boolean;
  receipt_path?: string | null;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface RetainerInvoice {
  id: UUID;
  organization_id: UUID;
  business_id: UUID;
  customer_id: UUID;
  customer_name?: string;
  project_id?: UUID | null;
  project_name?: string | null;
  retainer_number: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  amount_minor: number;
  currency: string;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  start_date: string;
  end_date?: string | null;
  remaining_minor: number;
  notes?: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface Unit {
  id: UUID;
  organization_id: UUID;
  name: string;
  symbol: string;
  type: 'base' | 'purchase' | 'warehouse' | 'sales';
  is_base: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface UnitConversion {
  id: UUID;
  organization_id: UUID;
  from_unit_id: UUID;
  to_unit_id: UUID;
  conversion_factor: number;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface ProductVariant {
  id: UUID;
  organization_id: UUID;
  business_id: UUID;
  product_id: UUID;
  sku: string;
  barcode?: string;
  attributes: Record<string, unknown>;
  cost_price_minor: number;
  selling_price_minor: number;
  is_active: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface Batch {
  id: UUID;
  organization_id: UUID;
  business_id: UUID;
  warehouse_id: UUID;
  product_id: UUID;
  batch_number: string;
  manufacture_date?: string;
  expiry_date?: string;
  supplier?: string;
  quantity: number;
  unit_cost_minor: number;
  status: 'active' | 'expired' | 'recalled' | 'quarantined';
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface SerialNumber {
  id: UUID;
  organization_id: UUID;
  business_id: UUID;
  warehouse_id: UUID;
  product_id: UUID;
  serial_number: string;
  status: 'in_stock' | 'reserved' | 'sold' | 'returned' | 'repaired' | 'written_off' | 'disposed';
  metadata?: Record<string, unknown>;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface Zone {
  id: UUID;
  organization_id: UUID;
  business_id: UUID;
  warehouse_id: UUID;
  name: string;
  code?: string;
  description?: string;
  is_active: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface Bin {
  id: UUID;
  organization_id: UUID;
  business_id: UUID;
  warehouse_id: UUID;
  zone_id?: UUID;
  name: string;
  code?: string;
  aisle?: string;
  rack?: string;
  shelf?: string;
  capacity?: number;
  status: 'active' | 'inactive' | 'blocked';
  pick_priority: number;
  putaway_priority: number;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface InventoryAdjustment {
  id: UUID;
  organization_id: UUID;
  business_id: UUID;
  branch_id: UUID;
  warehouse_id: UUID;
  user_id: UUID;
  adjustment_number: string;
  type: 'positive' | 'negative' | 'damage' | 'loss' | 'expiry' | 'theft' | 'stocktake' | 'found' | 'write_off';
  reason: string;
  status: 'pending' | 'approved' | 'posted' | 'cancelled';
  approved_by_user_id?: UUID;
  approved_at?: string;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface InventoryAdjustmentItem {
  id: UUID;
  adjustment_id: UUID;
  product_id: UUID;
  bin_id?: UUID;
  quantity_before: number;
  quantity_change: number;
  quantity_after: number;
  unit_cost_minor: number;
  notes?: string;
  created_at: ISODateString;
}

export interface Stocktake {
  id: UUID;
  organization_id: UUID;
  business_id: UUID;
  branch_id: UUID;
  warehouse_id: UUID;
  user_id: UUID;
  stocktake_number: string;
  type: 'full' | 'zone' | 'category' | 'product' | 'cycle';
  scope?: Record<string, unknown>;
  freeze_stock: boolean;
  blind_count: boolean;
  status: 'draft' | 'in_progress' | 'completed' | 'approved' | 'posted' | 'cancelled';
  started_at?: string;
  completed_at?: string;
  approved_by_user_id?: UUID;
  approved_at?: string;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface StocktakeItem {
  id: UUID;
  stocktake_id: UUID;
  product_id: UUID;
  bin_id?: UUID;
  system_quantity: number;
  counted_quantity?: number;
  variance?: number;
  status: 'pending' | 'counted' | 'recounted' | 'approved' | 'posted';
  notes?: string;
  created_at: ISODateString;
}

export interface TransferOrder {
  id: UUID;
  organization_id: UUID;
  business_id: UUID;
  branch_id: UUID;
  source_warehouse_id: UUID;
  destination_warehouse_id: UUID;
  user_id: UUID;
  transfer_number: string;
  status: 'draft' | 'approved' | 'dispatched' | 'in_transit' | 'received' | 'completed' | 'cancelled';
  notes?: string;
  dispatched_at?: string;
  received_at?: string;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface TransferOrderItem {
  id: UUID;
  transfer_order_id: UUID;
  product_id: UUID;
  quantity_requested: number;
  quantity_dispatched: number;
  quantity_received: number;
  notes?: string;
  created_at: ISODateString;
}

export interface Assembly {
  id: UUID;
  organization_id: UUID;
  business_id: UUID;
  warehouse_id: UUID;
  finished_product_id: UUID;
  user_id: UUID;
  assembly_number: string;
  type: 'assembly' | 'disassembly' | 'kit';
  quantity: number;
  status: 'draft' | 'completed' | 'reversed';
  notes?: string;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface AssemblyItem {
  id: UUID;
  assembly_id: UUID;
  product_id: UUID;
  quantity: number;
  unit_cost_minor: number;
  created_at: ISODateString;
}

export interface LandedCost {
  id: UUID;
  organization_id: UUID;
  business_id: UUID;
  purchase_order_id: UUID;
  grn_id: UUID;
  user_id: UUID;
  landed_cost_number: string;
  costs: Record<string, number>;
  total_cost_minor: number;
  allocation_method: 'quantity' | 'value' | 'weight' | 'volume' | 'manual';
  status: 'draft' | 'allocated' | 'posted';
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface LandedCostAllocation {
  id: UUID;
  landed_cost_id: UUID;
  product_id: UUID;
  purchase_order_item_id: UUID;
  allocated_cost_minor: number;
  created_at: ISODateString;
}

export interface ReplenishmentRule {
  id: UUID;
  organization_id: UUID;
  business_id: UUID;
  product_id: UUID;
  warehouse_id: UUID;
  preferred_supplier_id?: UUID;
  reorder_point: number;
  reorder_quantity: number;
  minimum_stock: number;
  maximum_stock: number;
  safety_stock: number;
  lead_time_days: number;
  status: 'active' | 'inactive';
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface ReplenishmentSuggestion {
  id: UUID;
  organization_id: UUID;
  product_id: UUID;
  warehouse_id: UUID;
  preferred_supplier_id?: UUID;
  suggested_quantity: number;
  reason: string;
  status: 'pending' | 'converted' | 'dismissed';
  created_at: ISODateString;
}

export interface PriceList {
  id: UUID;
  organization_id: UUID;
  business_id: UUID;
  name: string;
  type: 'retail' | 'wholesale' | 'vip' | 'customer_specific' | 'vendor';
  currency: string;
  is_active: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface PriceListItem {
  id: UUID;
  price_list_id: UUID;
  product_id: UUID;
  min_quantity?: number;
  max_quantity?: number;
  unit_price_minor: number;
  created_at: ISODateString;
}

export interface Package {
  id: UUID;
  organization_id: UUID;
  business_id: UUID;
  sale_id?: UUID;
  sales_order_id?: UUID;
  warehouse_id: UUID;
  package_number: string;
  status: 'pending' | 'packed' | 'shipped' | 'delivered';
  weight?: number;
  dimensions?: string;
  notes?: string;
  created_at: ISODateString;
}

export interface PackageItem {
  id: UUID;
  package_id: UUID;
  product_id: UUID;
  quantity: number;
  created_at: ISODateString;
}

export interface Shipment {
  id: UUID;
  organization_id: UUID;
  business_id: UUID;
  sale_id?: UUID;
  sales_order_id?: UUID;
  warehouse_id: UUID;
  shipment_number: string;
  carrier?: string;
  tracking_number?: string;
  status: 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned';
  shipping_label_url?: string;
  notes?: string;
  created_at: ISODateString;
}

export interface ShipmentItem {
  id: UUID;
  shipment_id: UUID;
  package_id?: UUID;
  product_id: UUID;
  quantity: number;
  created_at: ISODateString;
}

export interface EtimsStockSubmission {
  id: UUID;
  organization_id: UUID;
  event_type: string;
  inventory_event_id: UUID;
  payload: Record<string, unknown>;
  hash: string;
  submission_status: 'queued' | 'submitted' | 'accepted' | 'rejected' | 'retrying' | 'failed' | 'blocked_external';
  attempt_count: number;
  last_attempt_at?: string;
  next_retry_at?: string;
  external_reference?: string;
  response_code?: string;
  response_payload?: Record<string, unknown>;
  error_message?: string;
  submitted_at?: string;
  accepted_at?: string;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted' | 'discarded';
export type LeadLifecycleStage = 'lead' | 'marketing_qualified' | 'sales_qualified' | 'opportunity' | 'customer';

export interface Lead {
  id: UUID;
  organization_id: UUID;
  business_id?: UUID | null;
  branch_id?: UUID | null;
  assigned_to_user_id?: UUID | null;
  first_name?: string | null;
  last_name?: string | null;
  company_name?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp_phone?: string | null;
  source?: string | null;
  status: LeadStatus;
  lifecycle_stage: LeadLifecycleStage;
  score: number;
  custom_fields?: Record<string, unknown> | null;
  notes?: string | null;
  last_contacted_at?: string | null;
  converted_at?: string | null;
  converted_by_user_id?: UUID | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export type CrmAccountType = 'customer' | 'prospect' | 'partner' | 'distributor' | 'reseller' | 'government' | 'ngo';

export interface CrmAccount {
  id: UUID;
  organization_id: UUID;
  business_id?: UUID | null;
  parent_account_id?: UUID | null;
  owner_user_id?: UUID | null;
  account_type: CrmAccountType;
  legal_name?: string | null;
  trading_name?: string | null;
  registration_number?: string | null;
  kra_pin?: string | null;
  industry?: string | null;
  country_code: string;
  county?: string | null;
  city?: string | null;
  address?: string | null;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  credit_limit_minor: number;
  payment_terms?: string | null;
  price_list?: string | null;
  custom_fields?: Record<string, unknown> | null;
  notes?: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface Contact {
  id: UUID;
  organization_id: UUID;
  business_id?: UUID | null;
  account_id?: UUID | null;
  lead_id?: UUID | null;
  first_name?: string | null;
  last_name?: string | null;
  job_title?: string | null;
  department?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp_phone?: string | null;
  preferred_channel?: string | null;
  is_decision_maker: boolean;
  is_billing_contact: boolean;
  is_technical_contact: boolean;
  custom_fields?: Record<string, unknown> | null;
  notes?: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export type PipelineType = 'sales' | 'retail' | 'enterprise' | 'services' | 'renewals' | 'partnerships';

export interface Pipeline {
  id: UUID;
  organization_id: UUID;
  business_id?: UUID | null;
  name: string;
  slug?: string | null;
  description?: string | null;
  type: PipelineType;
  is_active: boolean;
  is_default: boolean;
  settings?: Record<string, unknown> | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface DealStage {
  id: UUID;
  pipeline_id: UUID;
  name: string;
  slug?: string | null;
  description?: string | null;
  position: number;
  probability_percentage: number;
  required_fields?: Record<string, unknown> | null;
  allowed_next_stages?: Record<string, unknown> | null;
  rotting_threshold_days?: number | null;
  automation?: Record<string, unknown> | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export type DealStatus = 'open' | 'won' | 'lost' | 'abandoned' | 'cancelled';

export interface Deal {
  id: UUID;
  organization_id: UUID;
  business_id?: UUID | null;
  account_id?: UUID | null;
  contact_id?: UUID | null;
  pipeline_id: UUID;
  stage_id: UUID;
  owner_user_id?: UUID | null;
  lead_id?: UUID | null;
  deal_name: string;
  description?: string | null;
  currency: string;
  value_minor: number;
  probability_minor: number;
  expected_close_date?: string | null;
  actual_close_date?: string | null;
  status: DealStatus;
  lost_reason?: string | null;
  competitors?: string | null;
  source_campaign?: string | null;
  custom_fields?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  notes?: string | null;
  stage_entered_at?: string | null;
  stage_exited_at?: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export type ActivityType = 'task' | 'call' | 'meeting' | 'email' | 'note' | 'visit' | 'follow_up' | 'whatsapp' | 'sms';
export type ActivityStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type ActivityPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Activity {
  id: UUID;
  organization_id: UUID;
  business_id?: UUID | null;
  user_id?: UUID | null;
  activity_type: ActivityType;
  subject?: string | null;
  description?: string | null;
  status: ActivityStatus;
  priority: ActivityPriority;
  due_date?: string | null;
  completed_at?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface Communication {
  id: UUID;
  organization_id: UUID;
  business_id?: UUID | null;
  channel: string;
  direction: string;
  status: string;
  from_address?: string | null;
  to_address?: string | null;
  subject?: string | null;
  body?: string | null;
  attachments?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  external_id?: string | null;
  sent_at?: string | null;
  delivered_at?: string | null;
  read_at?: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export type CasePriority = 'low' | 'medium' | 'high' | 'urgent';
export type CaseStatus = 'new' | 'open' | 'pending' | 'resolved' | 'closed' | 'cancelled';

export interface CaseModel {
  id: UUID;
  organization_id: UUID;
  business_id?: UUID | null;
  account_id?: UUID | null;
  contact_id?: UUID | null;
  deal_id?: UUID | null;
  assigned_to_user_id?: UUID | null;
  case_number?: string | null;
  subject: string;
  description?: string | null;
  priority: CasePriority;
  status: CaseStatus;
  category?: string | null;
  channel?: string | null;
  first_response_at?: string | null;
  resolved_at?: string | null;
  closed_at?: string | null;
  custom_fields?: Record<string, unknown> | null;
  resolution?: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export type CampaignType = 'marketing' | 'sales' | 'nurture' | 'event';
export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled';

export interface Campaign {
  id: UUID;
  organization_id: UUID;
  business_id?: UUID | null;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  channel?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  budget_minor: number;
  currency: string;
  utm_parameters?: Record<string, unknown> | null;
  target_audience?: Record<string, unknown> | null;
  description?: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface Workflow {
  id: UUID;
  organization_id: UUID;
  business_id?: UUID | null;
  name: string;
  description?: string | null;
  trigger_entity?: string | null;
  trigger_event?: string | null;
  trigger_conditions?: Record<string, unknown> | null;
  actions?: Record<string, unknown> | null;
  is_active: boolean;
  priority: number;
  metadata?: Record<string, unknown> | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export type SlaType = 'first_response' | 'next_response' | 'resolution' | 'follow_up';

export interface SlaPolicy {
  id: UUID;
  organization_id: UUID;
  business_id?: UUID | null;
  name: string;
  description?: string | null;
  applies_to_entity?: string | null;
  sla_type: SlaType;
  threshold_minutes?: number | null;
  threshold_hours?: number | null;
  threshold_days?: number | null;
  business_hours?: Record<string, unknown> | null;
  escalation_rules?: Record<string, unknown> | null;
  is_active: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface CustomFieldDefinition {
  id: UUID;
  organization_id: UUID;
  entity_type: string;
  field_name: string;
  field_label: string;
  field_type: string;
  options?: Record<string, unknown> | null;
  is_required: boolean;
  is_unique: boolean;
  default_value?: Record<string, unknown> | null;
  validation_rules?: Record<string, unknown> | null;
  position: number;
  is_active: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface LeadScoringRule {
  id: UUID;
  organization_id: UUID;
  name: string;
  condition_type: string;
  condition_field?: string | null;
  condition_operator?: string | null;
  condition_value?: Record<string, unknown> | null;
  score_change: number;
  is_decay: boolean;
  decay_after_hours?: number | null;
  decay_amount?: number | null;
  is_active: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface LeadAssignment {
  id: UUID;
  organization_id: UUID;
  rule_name: string;
  assignment_type: string;
  criteria?: Record<string, unknown> | null;
  assignees?: Record<string, unknown> | null;
  is_active: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface Territory {
  id: UUID;
  organization_id: UUID;
  name: string;
  code?: string | null;
  type: string;
  country_code: string;
  parent_territory_id?: UUID | null;
  metadata?: Record<string, unknown> | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface PriceBook {
  id: UUID;
  organization_id: UUID;
  business_id?: UUID | null;
  name: string;
  type: string;
  currency: string;
  is_active: boolean;
  is_default: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface KnowledgeArticle {
  id: UUID;
  organization_id: UUID;
  title: string;
  slug?: string | null;
  content?: string | null;
  category?: string | null;
  tags?: Record<string, unknown> | null;
  status: string;
  author_user_id?: UUID | null;
  published_at?: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface Sequence {
  id: UUID;
  organization_id: UUID;
  name: string;
  description?: string | null;
  target_entity?: string | null;
  status: string;
  total_steps: number;
  steps?: Record<string, unknown>[] | null;
  settings?: Record<string, unknown> | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export type SupplierStatus = 'prospect' | 'pending_verification' | 'active' | 'suspended' | 'blocked' | 'inactive' | 'archived';
export type SupplierType = 'individual' | 'sole_proprietor' | 'sme' | 'company' | 'corporation' | 'manufacturer' | 'distributor' | 'wholesaler' | 'retailer' | 'service_provider' | 'contractor' | 'consultant' | 'government_supplier' | 'ngo_supplier' | 'international';

export interface Supplier {
  id: UUID;
  organization_id: UUID;
  business_id?: UUID | null;
  supplier_code?: string | null;
  supplier_type: SupplierType;
  legal_name: string;
  trading_name?: string | null;
  registration_number?: string | null;
  kra_pin?: string | null;
  vat_status?: string | null;
  tax_country_code?: string | null;
  country_code: string;
  county?: string | null;
  city?: string | null;
  physical_address?: string | null;
  postal_address?: string | null;
  website?: string | null;
  primary_contact_name?: string | null;
  finance_contact_name?: string | null;
  procurement_contact_name?: string | null;
  phone?: string | null;
  email?: string | null;
  whatsapp_phone?: string | null;
  payment_terms?: string | null;
  currency: string;
  credit_terms?: string | null;
  credit_limit_minor: number;
  current_balance_minor: number;
  mpesa_paybill?: string | null;
  mpesa_till?: string | null;
  payment_preference?: string | null;
  tax_classification?: string | null;
  owner_user_id?: UUID | null;
  branch_id?: UUID | null;
  status: SupplierStatus;
  risk_level?: string | null;
  rating?: number | null;
  notes?: string | null;
  custom_fields?: Record<string, unknown> | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface SupplierContact {
  id: UUID;
  organization_id: UUID;
  supplier_id: UUID;
  first_name?: string | null;
  last_name?: string | null;
  job_title?: string | null;
  department?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp_phone?: string | null;
  is_primary: boolean;
  is_finance_contact: boolean;
  is_procurement_contact: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface SupplierAddress {
  id: UUID;
  organization_id: UUID;
  supplier_id: UUID;
  address_type: string;
  country_code: string;
  county?: string | null;
  city?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  postal_code?: string | null;
  is_default: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface SupplierBankAccount {
  id: UUID;
  organization_id: UUID;
  supplier_id: UUID;
  bank_name: string;
  branch_name?: string | null;
  account_name: string;
  account_number: string;
  swift_code?: string | null;
  is_default: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface SupplierDocument {
  id: UUID;
  organization_id: UUID;
  supplier_id: UUID;
  document_type: string;
  document_number?: string | null;
  issued_at?: string | null;
  expires_at?: string | null;
  status: string;
  verification_status?: string | null;
  verified_at?: string | null;
  verified_by_user_id?: UUID | null;
  failure_reason?: string | null;
  attachment_url?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface SupplierComplianceRecord {
  id: UUID;
  organization_id: UUID;
  supplier_id: UUID;
  compliance_type: string;
  status: string;
  required: boolean;
  expiry_tracked: boolean;
  reminder_days?: number | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface SupplierCategory {
  id: UUID;
  organization_id: UUID;
  name: string;
  description?: string | null;
  is_active: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface SupplierCategoryLink {
  id: UUID;
  organization_id: UUID;
  supplier_id: UUID;
  category_id: UUID;
  created_at: ISODateString;
}

export interface SupplierRating {
  id: UUID;
  organization_id: UUID;
  supplier_id: UUID;
  rating: number;
  rated_by_user_id?: UUID | null;
  comments?: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface SupplierPerformanceRecord {
  id: UUID;
  organization_id: UUID;
  supplier_id: UUID;
  metric: string;
  value: number;
  period_start?: string | null;
  period_end?: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export type RequisitionStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'cancelled' | 'converted' | 'partially_ordered' | 'fully_ordered';
export type RequisitionPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface PurchaseRequisition {
  id: UUID;
  organization_id: UUID;
  business_id?: UUID | null;
  branch_id?: UUID | null;
  warehouse_id?: UUID | null;
  requester_user_id: UUID;
  department?: string | null;
  cost_center?: string | null;
  project_id?: UUID | null;
  priority: RequisitionPriority;
  required_date?: string | null;
  reason?: string | null;
  budget_minor?: number | null;
  currency: string;
  status: RequisitionStatus;
  converted_to_po_ids?: UUID[] | null;
  custom_fields?: Record<string, unknown> | null;
  notes?: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface PurchaseRequisitionLine {
  id: UUID;
  organization_id: UUID;
  purchase_requisition_id: UUID;
  product_id?: UUID | null;
  description?: string | null;
  quantity: number;
  unit?: string | null;
  estimated_unit_price_minor?: number | null;
  tax_rate_percentage?: number | null;
  estimated_total_minor?: number | null;
  required_date?: string | null;
  preferred_supplier_id?: UUID | null;
  notes?: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface PurchaseRequisitionApproval {
  id: UUID;
  organization_id: UUID;
  purchase_requisition_id: UUID;
  approver_user_id?: UUID | null;
  sequence: number;
  status: 'pending' | 'approved' | 'rejected' | 'returned';
  comments?: string | null;
  acted_at?: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export type RfqStatus = 'draft' | 'published' | 'sent' | 'partially_responded' | 'responses_received' | 'evaluation' | 'awarded' | 'closed' | 'cancelled' | 'expired';

export interface Rfq {
  id: UUID;
  organization_id: UUID;
  business_id?: UUID | null;
  branch_id?: UUID | null;
  warehouse_id?: UUID | null;
  rfq_number: string;
  title: string;
  description?: string | null;
  status: RfqStatus;
  submission_deadline?: string | null;
  delivery_required_date?: string | null;
  commercial_terms?: string | null;
  payment_terms?: string | null;
  tax_requirements?: string | null;
  evaluation_criteria?: Record<string, unknown> | null;
  created_by_user_id?: UUID | null;
  published_at?: string | null;
  closed_at?: string | null;
  custom_fields?: Record<string, unknown> | null;
  notes?: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface RfqLine {
  id: UUID;
  organization_id: UUID;
  rfq_id: UUID;
  product_id?: UUID | null;
  description?: string | null;
  quantity: number;
  unit?: string | null;
  required_date?: string | null;
  notes?: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface RfqSupplier {
  id: UUID;
  organization_id: UUID;
  rfq_id: UUID;
  supplier_id: UUID;
  invited_at?: string | null;
  responded_at?: string | null;
  status: string;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface RfqQuestion {
  id: UUID;
  organization_id: UUID;
  rfq_id: UUID;
  supplier_id?: UUID | null;
  question: string;
  answer?: string | null;
  answered_at?: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface RfqResponse {
  id: UUID;
  organization_id: UUID;
  rfq_id: UUID;
  supplier_id: UUID;
  submitted_at?: string | null;
  status: string;
  revision: number;
  is_final: boolean;
  notes?: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface RfqResponseLine {
  id: UUID;
  organization_id: UUID;
  rfq_response_id: UUID;
  rfq_line_id: UUID;
  supplier_id: UUID;
  unit_price_minor?: number | null;
  quantity?: number | null;
  discount_minor?: number | null;
  tax_rate_percentage?: number | null;
  tax_amount_minor?: number | null;
  total_minor?: number | null;
  lead_time_days?: number | null;
  delivery_cost_minor?: number | null;
  payment_terms?: string | null;
  validity?: string | null;
  warranty?: string | null;
  notes?: string | null;
  alternative_product_id?: UUID | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface RfqAttachment {
  id: UUID;
  organization_id: UUID;
  rfq_id: UUID;
  filename: string;
  url: string;
  mime_type?: string | null;
  size_bytes?: number | null;
  created_at: ISODateString;
}

export type TenderStatus = 'draft' | 'published' | 'bidding' | 'opened' | 'evaluation' | 'awarded' | 'rejected' | 'cancelled' | 'expired';

export interface Tender {
  id: UUID;
  organization_id: UUID;
  business_id?: UUID | null;
  branch_id?: UUID | null;
  tender_number: string;
  title: string;
  description?: string | null;
  status: TenderStatus;
  submission_deadline?: string | null;
  opening_date?: string | null;
  evaluation_criteria?: Record<string, unknown> | null;
  created_by_user_id?: UUID | null;
  published_at?: string | null;
  awarded_at?: string | null;
  custom_fields?: Record<string, unknown> | null;
  notes?: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface TenderDocument {
  id: UUID;
  organization_id: UUID;
  tender_id: UUID;
  filename: string;
  url: string;
  mime_type?: string | null;
  size_bytes?: number | null;
  created_at: ISODateString;
}

export interface TenderBid {
  id: UUID;
  organization_id: UUID;
  tender_id: UUID;
  supplier_id: UUID;
  submitted_at?: string | null;
  status: string;
  total_price_minor?: number | null;
  notes?: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface TenderBidLine {
  id: UUID;
  organization_id: UUID;
  tender_bid_id: UUID;
  product_id?: UUID | null;
  description?: string | null;
  quantity?: number | null;
  unit_price_minor?: number | null;
  total_minor?: number | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface TenderEvaluation {
  id: UUID;
  organization_id: UUID;
  tender_id: UUID;
  tender_bid_id: UUID;
  evaluator_user_id?: UUID | null;
  criteria: Record<string, unknown>;
  score: number;
  comments?: string | null;
  evaluated_at?: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface TenderAward {
  id: UUID;
  organization_id: UUID;
  tender_id: UUID;
  tender_bid_id: UUID;
  supplier_id: UUID;
  awarded_at?: string | null;
  amount_minor?: number | null;
  currency: string;
  notes?: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export type SupplierInvoiceStatus = 'draft' | 'submitted' | 'pending_verification' | 'verified' | 'rejected' | 'matched' | 'mismatched' | 'paid' | 'cancelled';

export interface SupplierInvoice {
  id: UUID;
  organization_id: UUID;
  business_id?: UUID | null;
  branch_id?: UUID | null;
  supplier_id: UUID;
  purchase_order_id?: UUID | null;
  invoice_number: string;
  invoice_date: string;
  due_date?: string | null;
  currency: string;
  subtotal_minor: number;
  discount_minor: number;
  tax_minor: number;
  wht_minor: number;
  grand_total_minor: number;
  etims_status?: string | null;
  etims_control_number?: string | null;
  etims_verified_at?: string | null;
  etims_payload?: Record<string, unknown> | null;
  status: SupplierInvoiceStatus;
  custom_fields?: Record<string, unknown> | null;
  notes?: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface SupplierInvoiceLine {
  id: UUID;
  organization_id: UUID;
  supplier_invoice_id: UUID;
  purchase_order_item_id?: UUID | null;
  product_id?: UUID | null;
  description?: string | null;
  quantity: number;
  unit_price_minor: number;
  discount_minor: number;
  tax_rate_percentage: number;
  tax_amount_minor: number;
  wht_amount_minor: number;
  total_minor: number;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export type ThreeWayMatchStatus = 'pending' | 'matched' | 'partially_matched' | 'quantity_mismatch' | 'price_mismatch' | 'tax_mismatch' | 'duplicate_invoice' | 'missing_po' | 'missing_grn' | 'supplier_mismatch' | 'manual_review' | 'blocked';

export interface ThreeWayMatch {
  id: UUID;
  organization_id: UUID;
  business_id?: UUID | null;
  purchase_order_id: UUID;
  grn_id?: UUID | null;
  supplier_invoice_id: UUID;
  status: ThreeWayMatchStatus;
  matched_at?: string | null;
  mismatches?: Record<string, unknown> | null;
  notes?: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface ThreeWayMatchLine {
  id: UUID;
  organization_id: UUID;
  three_way_match_id: UUID;
  po_line_id: UUID;
  grn_line_id?: UUID | null;
  invoice_line_id: UUID;
  po_quantity: number;
  grn_quantity?: number | null;
  invoice_quantity: number;
  po_unit_price_minor: number;
  grn_unit_cost_minor?: number | null;
  invoice_unit_price_minor: number;
  status: string;
  mismatch_reason?: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface PaymentVoucher {
  id: UUID;
  organization_id: UUID;
  business_id?: UUID | null;
  branch_id?: UUID | null;
  voucher_number: string;
  supplier_id: UUID;
  currency: string;
  gross_amount_minor: number;
  wht_rate_percentage?: number | null;
  wht_amount_minor: number;
  other_deductions_minor: number;
  net_payable_minor: number;
  status: string;
  approved_at?: string | null;
  approved_by_user_id?: UUID | null;
  notes?: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface PaymentVoucherLine {
  id: UUID;
  organization_id: UUID;
  payment_voucher_id: UUID;
  supplier_invoice_id: UUID;
  amount_minor: number;
  wht_amount_minor: number;
  notes?: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface PaymentApproval {
  id: UUID;
  organization_id: UUID;
  payment_voucher_id: UUID;
  approver_user_id?: UUID | null;
  sequence: number;
  status: 'pending' | 'approved' | 'rejected' | 'returned';
  comments?: string | null;
  acted_at?: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface SupplierPayment {
  id: UUID;
  organization_id: UUID;
  business_id?: UUID | null;
  branch_id?: UUID | null;
  payment_voucher_id?: UUID | null;
  supplier_id: UUID;
  currency: string;
  amount_minor: number;
  payment_method: string;
  reference?: string | null;
  external_transaction_id?: string | null;
  provider_response?: Record<string, unknown> | null;
  status: string;
  paid_at?: string | null;
  notes?: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface PaymentReconciliation {
  id: UUID;
  organization_id: UUID;
  supplier_payment_id: UUID;
  provider_transaction_id?: string | null;
  amount_minor: number;
  currency: string;
  reconciled_at?: string | null;
  reconciled_by_user_id?: UUID | null;
  status: string;
  notes?: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface ProcurementContract {
  id: UUID;
  organization_id: UUID;
  business_id?: UUID | null;
  supplier_id: UUID;
  contract_number: string;
  title: string;
  description?: string | null;
  start_date: string;
  end_date: string;
  renewal_date?: string | null;
  contract_value_minor: number;
  currency: string;
  terms?: string | null;
  status: string;
  attachment_url?: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface ContractLine {
  id: UUID;
  organization_id: UUID;
  procurement_contract_id: UUID;
  product_id?: UUID | null;
  description?: string | null;
  quantity?: number | null;
  unit_price_minor?: number | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface ContractRenewal {
  id: UUID;
  organization_id: UUID;
  procurement_contract_id: UUID;
  renewed_at?: string | null;
  new_end_date?: string | null;
  notes?: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface ApprovalRule {
  id: UUID;
  organization_id: UUID;
  entity_type: string;
  min_amount_minor?: number | null;
  max_amount_minor?: number | null;
  department?: string | null;
  branch_id?: UUID | null;
  supplier_id?: UUID | null;
  category?: string | null;
  cost_center?: string | null;
  project_id?: UUID | null;
  currency: string;
  purchase_type?: string | null;
  risk?: string | null;
  is_active: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface ApprovalStep {
  id: UUID;
  organization_id: UUID;
  approval_rule_id: UUID;
  sequence: number;
  approver_user_id?: UUID | null;
  approver_role?: string | null;
  mode: 'sequential' | 'parallel' | 'any' | 'all';
  escalation_user_id?: UUID | null;
  expiry_minutes?: number | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface ProcurementAuditLog {
  id: UUID;
  organization_id: UUID;
  user_id?: UUID | null;
  entity_type: string;
  entity_id: UUID;
  action: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  reason?: string | null;
  ip_address?: string | null;
  correlation_id?: string | null;
  created_at: ISODateString;
}
