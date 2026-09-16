import Dexie, { Table } from 'dexie';
import { Product, ProductCategory, Customer, Sale, InventoryMovement, SyncPushPayload, ReturnModel, Refund, PaymentTransaction, CashShift } from '@soko/domain-types';

export interface LocalSyncMetadata {
  key: string;
  value: string;
  updated_at: string;
}

export class SokoOfflineDatabase extends Dexie {
  products!: Table<Product, string>;
  categories!: Table<ProductCategory, string>;
  customers!: Table<Customer, string>;
  sales!: Table<Sale, string>;
  payments!: Table<PaymentTransaction, string>;
  returns!: Table<ReturnModel, string>;
  refunds!: Table<Refund, string>;
  cash_shifts!: Table<CashShift, string>;
  inventory_movements!: Table<InventoryMovement, string>;
  sync_operations!: Table<SyncPushPayload['operations'][0], string>;
  sync_metadata!: Table<LocalSyncMetadata, string>;

  constructor(databaseName = 'SokoOS_OfflineDB') {
    super(databaseName);

    this.version(1).stores({
      products: 'id, sku, barcode, name, category_id, is_active, sync_status',
      categories: 'id, slug, name, parent_id',
      customers: 'id, name, phone, tax_pin, sync_status',
      sales: 'id, local_id, receipt_number, status, sync_status, created_at, customer_id, branch_id',
      payments: 'id, sale_id, payment_method, status, sync_status, created_at',
      returns: 'id, sale_id, status, sync_status, created_at, branch_id',
      refunds: 'id, sale_id, return_id, status, sync_status, created_at',
      cash_shifts: 'id, cashier_user_id, status, opened_at, sync_status, branch_id, terminal_id',
      inventory_movements: 'id, product_id, movement_type, reference_id, created_at',
      sync_operations: 'operation_id, idempotency_key, entity_name, action, local_id, created_at',
      sync_metadata: 'key',
    });
  }
}

export const db = new SokoOfflineDatabase();
