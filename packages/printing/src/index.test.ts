import { describe, it, expect } from 'vitest';
import { EscPosGenerator, HtmlReceiptGenerator, MockPrinter, createReceiptData, createMockReceiptService } from './index';
import { Sale, SaleItem, Customer, PaymentTransaction } from '@soko/domain-types';

function createTestReceiptData(): ReturnType<typeof createReceiptData> {
  const mockSale: Sale = {
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
  };

  const mockCustomer: Customer = {
    id: 'cust-1',
    organization_id: 'org-1',
    business_id: 'bus-1',
    code: 'CUST-001',
    name: 'John Doe',
    phone: '+254712345678',
    email: 'john@example.com',
    tax_pin: 'P051234567Z',
    credit_limit_minor: 100000,
    current_balance_minor: 0,
    loyalty_points: 150,
    price_level: 'retail',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    deleted_at: null,
    local_id: null,
    server_id: null,
    device_id: null,
    version: 1,
    sync_status: 'synced'
  };

  const mockItems: SaleItem[] = [
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

  const mockPayments: PaymentTransaction[] = [
    {
      id: 'pay-1',
      sale_id: 'test-sale-1',
      amount_minor: 11600,
      currency: 'KES',
      payment_method: 'cash',
      status: 'completed',
      reference: 'CASH-001',
      external_transaction_id: null,
      provider_response: null,
      created_at: '2026-01-15T10:30:00Z'
    }
  ];

  return createReceiptData(
    mockSale,
    'Soko Supermarket',
    'Westlands Branch',
    'TERM-001',
    'Jane Cashier',
    mockCustomer,
    mockItems,
    mockPayments
  );
}

describe('@soko/printing', () => {
  describe('EscPosGenerator', () => {
    it('generates valid ESC/POS commands', () => {
      const receipt = createTestReceiptData();
      const escpos = EscPosGenerator.generate(receipt);
      
      expect(escpos).toContain('\x1B\x40'); // Init
      expect(escpos).toContain('Soko Supermarket');
      expect(escpos).toContain('Westlands Branch');
      expect(escpos).toContain('TERM-001');
      expect(escpos).toContain('RCPT-001');
      expect(escpos).toContain('Basmati Rice 2kg');
      expect(escpos).toContain('116.00');
      expect(escpos).toContain('Thank you for shopping!');
      expect(escpos).toContain('\x1D\x56\x41\x00'); // Cut
    });

    it('generates 58mm format correctly', () => {
      const receipt = createTestReceiptData();
      const escpos = EscPosGenerator.generate(receipt, { paperWidth: 58, autoCut: true });
      
      expect(escpos).toContain('Soko Supermarket');
      expect(escpos).toContain('\x1D\x56\x41\x00');
    });
  });

  describe('HtmlReceiptGenerator', () => {
    it('generates valid HTML receipt', () => {
      const receipt = createTestReceiptData();
      const html = HtmlReceiptGenerator.generate(receipt);
      
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('Soko Supermarket');
      expect(html).toContain('Westlands Branch');
      expect(html).toContain('RCPT-001');
      expect(html).toContain('Basmati Rice 2kg');
      expect(html).toContain('116.00');
      expect(html).toContain('Print Receipt');
      expect(html).toContain('Download PDF');
      expect(html).toContain('Thank you for shopping!');
    });
  });

  describe('MockPrinter', () => {
    it('simulates successful printing', async () => {
      const printer = new MockPrinter();
      const receipt = createTestReceiptData();
      const escpos = EscPosGenerator.generate(receipt);
      
      const result = await printer.print(escpos);
      
      expect(result.success).toBe(true);
      expect(result.jobId).toBeDefined();
    });

    it('reports as connected', async () => {
      const printer = new MockPrinter();
      const connected = await printer.isConnected();
      expect(connected).toBe(true);
    });
  });

  describe('ReceiptService', () => {
    it('creates service with mock printer', () => {
      const service = createMockReceiptService();
      expect(service).toBeDefined();
    });

    it('prints HTML receipt via browser', async () => {
      const service = createMockReceiptService();
      const receipt = createTestReceiptData();
      
      // This will fail in headless environment but tests the code path
      const result = await service.printHtml(receipt);
      expect(result.success).toBe(true);
    });
  });

  describe('createReceiptData factory', () => {
    it('creates complete receipt data object', () => {
      const receipt = createTestReceiptData();
      
      expect(receipt.businessName).toBe('Soko Supermarket');
      expect(receipt.branchName).toBe('Westlands Branch');
      expect(receipt.terminalCode).toBe('TERM-001');
      expect(receipt.cashierName).toBe('Jane Cashier');
      expect(receipt.customer?.name).toBe('John Doe');
      expect(receipt.items.length).toBe(1);
      expect(receipt.payments.length).toBe(1);
      expect(receipt.receiptNumber).toBe('RCPT-001');
    });
  });
});