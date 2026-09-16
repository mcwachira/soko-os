import { describe, it, expect } from 'vitest';
import 'fake-indexeddb/auto';
import { calculateTaxInclusive } from '@soko/tax';
import { generateReceiptNumber, generateUUID } from '@soko/utils';
import { Product, Sale } from '@soko/domain-types';
import { SokoOfflineDatabase } from '@soko/offline';

describe('Soko POS Frontend Logic', () => {
  const sampleProduct1: Product = {
    id: 'p1',
    organization_id: 'org1',
    business_id: 'biz1',
    sku: 'MILK-500ML',
    barcode: '6161100001',
    name: 'Fresh Whole Milk 500ml',
    tax_category_code: 'A',
    unit: 'packet',
    cost_price_minor: 5500,
    selling_price_minor: 6500,
    reorder_level: 10,
    track_inventory: true,
    is_active: true,
    version: 1,
    sync_status: 'synced',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const sampleProduct2: Product = {
    id: 'p2',
    organization_id: 'org1',
    business_id: 'biz1',
    sku: 'BREAD-400G',
    barcode: '6161100002',
    name: 'White Bread 400g',
    tax_category_code: 'B', // Zero-rated
    unit: 'loaf',
    cost_price_minor: 5000,
    selling_price_minor: 6000,
    reorder_level: 15,
    track_inventory: true,
    is_active: true,
    version: 1,
    sync_status: 'synced',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  it('calculates cart subtotals and standard/zero-rated taxes correctly', () => {
    const cart = [
      { product: sampleProduct1, quantity: 2 }, // 2 * 6500 = 13000 (16% VAT inclusive)
      { product: sampleProduct2, quantity: 1 }, // 1 * 6000 = 6000 (0% VAT)
    ];

    const subtotal = cart.reduce((acc, item) => acc + item.product.selling_price_minor * item.quantity, 0);
    expect(subtotal).toBe(19000);

    const taxMilk = calculateTaxInclusive(13000, 16.0, 'A');
    const taxBread = calculateTaxInclusive(6000, 0, 'B');

    const totalTax = taxMilk.taxAmountMinor + taxBread.taxAmountMinor;
    expect(totalTax).toBe(1793); // 13000 * 16 / 116 = 1793.1 -> 1793
    expect(taxBread.taxAmountMinor).toBe(0);
  });

  it('creates an offline sale and saves pending sync operation to Dexie', async () => {
    const db = new SokoOfflineDatabase(`test_pos_${Date.now()}`);

    const saleId = generateUUID();
    const receiptNo = generateReceiptNumber('BR01', 'TERM01');

    const sale: Sale = {
      id: saleId,
      local_id: saleId,
      receipt_number: receiptNo,
      organization_id: 'org1',
      business_id: 'biz1',
      branch_id: 'br1',
      subtotal_minor: 19000,
      tax_total_minor: 1793,
      discount_minor: 0,
      grand_total_minor: 19000,
      paid_total_minor: 19000,
      change_due_minor: 0,
      cashier_user_id: 'user-1',
      status: 'completed',
      sync_status: 'pending',
      version: 1,
      items: [
        {
          id: generateUUID(),
          sale_id: saleId,
          product_id: sampleProduct1.id,
          sku: sampleProduct1.sku,
          name: sampleProduct1.name,
          quantity: 2,
          unit_price_minor: sampleProduct1.selling_price_minor,
          discount_minor: 0,
          tax_rate_percentage: 16.0,
          tax_amount_minor: 1793,
          subtotal_minor: 13000,
          total_minor: 13000,
        },
      ],
      payments: [
        {
          id: generateUUID(),
          sale_id: saleId,
          payment_method: 'mpesa',
          amount_minor: 19000,
          currency: 'KES',
          status: 'completed',
          created_at: new Date().toISOString(),
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await db.sales.add(sale);
    await db.sync_operations.add({
      operation_id: generateUUID(),
      idempotency_key: `sale-idem-${saleId}`,
      entity_name: 'sales',
      action: 'create',
      local_id: saleId,
      data: sale as unknown as Record<string, unknown>,
      created_at: new Date().toISOString(),
    });

    const storedSale = await db.sales.get(saleId);
    expect(storedSale).toBeDefined();
    expect(storedSale?.receipt_number).toBe(receiptNo);
    expect(storedSale?.sync_status).toBe('pending');

    const pendingOps = await db.sync_operations.toArray();
    expect(pendingOps.length).toBe(1);
    expect(pendingOps[0].entity_name).toBe('sales');
  });
});
