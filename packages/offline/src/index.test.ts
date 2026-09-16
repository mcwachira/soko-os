import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { SokoOfflineDatabase } from './index';

describe('@soko/offline', () => {
  let testDb: SokoOfflineDatabase;

  beforeEach(() => {
    testDb = new SokoOfflineDatabase(`test_db_${Date.now()}_${Math.random()}`);
  });

  it('stores and retrieves offline products by barcode and SKU', async () => {
    await testDb.products.add({
      id: 'prod-1',
      organization_id: 'org-1',
      business_id: 'biz-1',
      sku: 'RICE-2KG',
      barcode: '6161100001',
      name: 'Basmati Rice 2kg',
      tax_category_code: 'A',
      unit: 'pcs',
      cost_price_minor: 25000,
      selling_price_minor: 32000,
      reorder_level: 5,
      track_inventory: true,
      is_active: true,
      sync_status: 'synced',
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const productByBarcode = await testDb.products.where('barcode').equals('6161100001').first();
    expect(productByBarcode).toBeDefined();
    expect(productByBarcode?.name).toBe('Basmati Rice 2kg');
    expect(productByBarcode?.selling_price_minor).toBe(32000);

    const productBySku = await testDb.products.where('sku').equals('RICE-2KG').first();
    expect(productBySku).toBeDefined();
    expect(productBySku?.id).toBe('prod-1');
  });

  it('stores pending offline sales and queries by sync_status', async () => {
    await testDb.sales.add({
      id: 'sale-off-1',
      local_id: 'local-1234',
      receipt_number: 'REC-OFF-001',
      organization_id: 'org-1',
      business_id: 'biz-1',
      branch_id: 'br-1',
      subtotal_minor: 32000,
      tax_total_minor: 4414,
      discount_minor: 0,
      grand_total_minor: 32000,
      paid_total_minor: 32000,
      change_due_minor: 0,
      cashier_user_id: 'user-1',
      status: 'completed',
      sync_status: 'pending',
      version: 1,
      items: [],
      payments: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const pendingSales = await testDb.sales.where('sync_status').equals('pending').toArray();
    expect(pendingSales.length).toBe(1);
    expect(pendingSales[0].receipt_number).toBe('REC-OFF-001');
  });
});
