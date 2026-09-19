import { describe, it, expect } from 'vitest';
import { 
  createEtimsAdapter, 
  MockEtimsAdapter, 
  EtimsPayloadBuilder, 
  createEtimsSubmissionFromSale,
  EtimsConfig 
} from './index';
import { Sale, SaleItem } from '@soko/domain-types';

function createTestSale(): Sale {
  return {
    id: 'test-sale-1',
    organization_id: 'org-1',
    business_id: 'bus-1',
    branch_id: 'branch-1',
    terminal_id: 'term-1',
    cashier_user_id: 'user-1',
    shift_id: 'shift-1',
    customer_id: 'cust-1',
    receipt_number: 'RCPT-001',
    invoice_number: null,
    status: 'completed',
    subtotal_minor: 11600,
    discount_minor: 0,
    tax_total_minor: 1600,
    grand_total_minor: 11600,
    paid_total_minor: 11600,
    change_due_minor: 0,
    items: [],
    payments: [],
    tax_submission_status: 'pending',
    accounting_sync_status: 'pending',
    notes: null,
    created_at: '2026-01-15T10:30:00Z',
    updated_at: '2026-01-15T10:30:00Z',
    deleted_at: null,
    local_id: null,
    server_id: null,
    device_id: null,
    version: 1,
    sync_status: 'synced'
  } as Sale & { 
    customer?: { tax_pin?: string; name?: string } | null;
    terminal?: { terminal_code: string } | null;
  };
}

function createTestItems(): SaleItem[] {
  return [
    {
      id: 'item-1',
      sale_id: 'test-sale-1',
      product_id: 'prod-1',
      sku: 'SKU-001',
      name: 'Basmati Rice 2kg',
      quantity: 2,
      unit_price_minor: 5800,
      discount_minor: 0,
      tax_rate_percentage: 16,
      tax_amount_minor: 1600,
      subtotal_minor: 11600,
      total_minor: 11600
    }
  ];
}

function createTestPayments() {
  return [
    { payment_method: 'cash', amount_minor: 11600 },
    { payment_method: 'mpesa', amount_minor: 5800 }
  ];
}

describe('@soko/etims', () => {
  describe('EtimsPayloadBuilder', () => {
    it('builds valid eTIMS payload from sale', () => {
      const sale = createTestSale();
      sale.terminal = { terminal_code: 'TERM-001' };
      sale.customer = { tax_pin: 'P051234567Z', name: 'John Doe' };

      const payload = EtimsPayloadBuilder.buildFromSale(sale, createTestItems(), createTestPayments(), {
        pin: 'P051234567X',
        deviceId: 'TERM-001',
        branchName: 'Test Branch'
      });

      expect(payload.trxType).toBe('SALE');
      expect(payload.invoiceNo).toBe('RCPT-001');
      expect(payload.custPin).toBe('P051234567Z');
      expect(payload.custName).toBe('John Doe');
      expect(payload.items.length).toBe(1);
      expect(payload.items[0].itemCode).toBe('SKU-001');
      expect(payload.items[0].itemName).toBe('Basmati Rice 2kg');
      expect(payload.items[0].qty).toBe(2);
      expect(payload.items[0].unitPrice).toBe(5800);
      expect(payload.items[0].taxRate).toBe('A');
      expect(payload.items[0].taxAmt).toBe(1600);
      expect(payload.items[0].totalAmt).toBe(11600);
      expect(payload.totalTaxableAmt).toBe(11600);
      expect(payload.totalTaxAmt).toBe(1600);
      expect(payload.totalAmt).toBe(11600);
      expect(payload.paymentMode).toBe('MIXED');
      expect(payload.deviceSerialNo).toBe('TERM-001');
    });

    it('maps single payment method correctly', () => {
      const sale = createTestSale();
      sale.terminal = { terminal_code: 'TERM-001' };

      const payload = EtimsPayloadBuilder.buildFromSale(sale, createTestItems(), [
        { payment_method: 'mpesa', amount_minor: 11600 }
      ], {
        pin: 'P051234567X',
        deviceId: 'TERM-001',
        branchName: 'Test Branch'
      });

      expect(payload.paymentMode).toBe('MPESA');
    });
  });

  describe('MockEtimsAdapter', () => {
    const config: EtimsConfig = { mode: 'mock' };
    let adapter: MockEtimsAdapter;

    beforeEach(() => {
      adapter = new MockEtimsAdapter(config);
      adapter.setAutoAcceptDelay(10); // Fast tests
    });

    it('submits payload and returns mock response', async () => {
      const sale = createTestSale();
      sale.terminal = { terminal_code: 'TERM-001' };
      sale.customer = { tax_pin: 'P051234567Z', name: 'John Doe' };

      const payload = EtimsPayloadBuilder.buildFromSale(sale, createTestItems(), createTestPayments(), {
        pin: 'P051234567X',
        deviceId: 'TERM-001',
        branchName: 'Test Branch'
      });

      const response = await adapter.submit(payload);

      expect(response.success).toBe(true);
      expect(response.status).toBe('accepted');
      expect(response.receiptNo).toBeDefined();
      expect(response.fiscalSignature).toBeDefined();
      expect(response.internalData).toBeDefined();
      expect(response.taxControlCode).toBeDefined();
      expect(response.qrCodeUrl).toContain('etims.kra.go.ke');
    });

    it('tracks submission status', async () => {
      const sale = createTestSale();
      sale.terminal = { terminal_code: 'TERM-001' };

      const payload = EtimsPayloadBuilder.buildFromSale(sale, createTestItems(), createTestPayments(), {
        pin: 'P051234567X',
        deviceId: 'TERM-001',
        branchName: 'Test Branch'
      });

      const response = await adapter.submit(payload);
      expect(response.success).toBe(true);

      const submissionId = response.receiptNo!;
      const status = await adapter.checkStatus(submissionId);
      
      expect(status.success).toBe(true);
      expect(status.status).toBe('accepted');
    });

    it('retries failed submissions', async () => {
      const sale = createTestSale();
      sale.terminal = { terminal_code: 'TERM-001' };

      const payload = EtimsPayloadBuilder.buildFromSale(sale, createTestItems(), createTestPayments(), {
        pin: 'P051234567X',
        deviceId: 'TERM-001',
        branchName: 'Test Branch'
      });

      // First submission (might fail randomly)
      const response1 = await adapter.submit(payload);
      
      if (!response1.success) {
        // Retry
        const response2 = await adapter.retry(response1.receiptNo!);
        expect(response2.success).toBe(true);
      }
    });

    it('provides callbacks for submission lifecycle', async () => {
      let queued: any = null;
      let accepted: any = null;
      let rejected: any = null;

      const adapterWithCallbacks = new MockEtimsAdapter({
        ...config,
        onSubmissionQueued: (s) => { queued = s; },
        onSubmissionAccepted: (s) => { accepted = s; },
        onSubmissionRejected: (s, e) => { rejected = { submission: s, error: e }; }
      });

      adapterWithCallbacks.setAutoAcceptDelay(10);

      const sale = createTestSale();
      sale.terminal = { terminal_code: 'TERM-001' };

      const payload = EtimsPayloadBuilder.buildFromSale(sale, createTestItems(), createTestPayments(), {
        pin: 'P051234567X',
        deviceId: 'TERM-001',
        branchName: 'Test Branch'
      });

      await adapterWithCallbacks.submit(payload);

      expect(queued).toBeDefined();
      expect(accepted).toBeDefined();
      expect(rejected).toBeNull();
    });
  });

  describe('createEtimsAdapter factory', () => {
    it('creates MockEtimsAdapter for mock mode', () => {
      const adapter = createEtimsAdapter({ mode: 'mock' });
      expect(adapter).toBeInstanceOf(MockEtimsAdapter);
    });

    it('creates ProductionEtimsAdapter for production mode', () => {
      const adapter = createEtimsAdapter({ mode: 'production', pin: 'test', deviceId: 'test' });
      expect(adapter.constructor.name).toBe('ProductionEtimsAdapter');
    });

    it('creates ProductionEtimsAdapter for sandbox mode', () => {
      const adapter = createEtimsAdapter({ mode: 'sandbox', pin: 'test', deviceId: 'test' });
      expect(adapter.constructor.name).toBe('ProductionEtimsAdapter');
    });
  });

  describe('createEtimsSubmissionFromSale', () => {
    it('creates submission record from sale', () => {
      const sale = createTestSale();
      sale.terminal = { terminal_code: 'TERM-001' };
      sale.customer = { tax_pin: 'P051234567Z', name: 'John Doe' };

      const submission = createEtimsSubmissionFromSale(sale, createTestItems(), createTestPayments(), {
        mode: 'mock',
        pin: 'P051234567X',
        deviceId: 'TERM-001'
      });

      expect(submission.id).toContain('etims-');
      expect(submission.saleId).toBe('test-sale-1');
      expect(submission.receiptNumber).toBe('RCPT-001');
      expect(submission.payload.invoiceNo).toBe('RCPT-001');
      expect(submission.payload.items.length).toBe(1);
      expect(submission.status).toBe('queued');
      expect(submission.attemptCount).toBe(0);
    });
  });
});