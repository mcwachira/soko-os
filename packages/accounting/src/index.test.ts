import { describe, it, expect } from 'vitest';
import { generateSaleJournalLines, DEFAULT_CHART_OF_ACCOUNTS } from './index';
import { Sale } from '@soko/domain-types';

describe('@soko/accounting', () => {
  it('provides default chart of accounts for African businesses', () => {
    expect(DEFAULT_CHART_OF_ACCOUNTS.length).toBeGreaterThan(5);
    expect(DEFAULT_CHART_OF_ACCOUNTS.some((a) => a.code === '1010' && a.type === 'asset')).toBe(true);
    expect(DEFAULT_CHART_OF_ACCOUNTS.some((a) => a.code === '2100' && a.type === 'liability')).toBe(true);
    expect(DEFAULT_CHART_OF_ACCOUNTS.some((a) => a.code === '4000' && a.type === 'revenue')).toBe(true);
  });

  it('generates balanced double-entry journal lines for cash sale', () => {
    const sale: Sale = {
      id: 'sale-1',
      local_id: 'loc-1',
      receipt_number: 'REC-001',
      organization_id: 'org-1',
      business_id: 'biz-1',
      branch_id: 'br-1',
      subtotal_minor: 10000,
      tax_total_minor: 1600,
      discount_minor: 0,
      grand_total_minor: 11600,
      paid_total_minor: 11600,
      change_due_minor: 0,
      cashier_user_id: 'user-1',
      status: 'completed',
      sync_status: 'synced',
      version: 1,
      items: [],
      payments: [
        {
          id: 'pay-1',
          sale_id: 'sale-1',
          payment_method: 'cash',
          amount_minor: 11600,
          currency: 'KES',
          status: 'completed',
          created_at: new Date().toISOString(),
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const lines = generateSaleJournalLines(sale);
    const totalDebits = lines.reduce((sum, l) => sum + l.debitMinor, 0);
    const totalCredits = lines.reduce((sum, l) => sum + l.creditMinor, 0);

    expect(totalDebits).toBe(11600);
    expect(totalCredits).toBe(11600);
    expect(totalDebits).toBe(totalCredits); // Perfectly balanced!
  });

  it('generates balanced journal lines for M-Pesa sale with discount', () => {
    const sale: Sale = {
      id: 'sale-2',
      local_id: 'loc-2',
      receipt_number: 'REC-002',
      organization_id: 'org-1',
      business_id: 'biz-1',
      branch_id: 'br-1',
      subtotal_minor: 20000,
      tax_total_minor: 3200,
      discount_minor: 1000,
      grand_total_minor: 22200,
      paid_total_minor: 22200,
      change_due_minor: 0,
      cashier_user_id: 'user-1',
      status: 'completed',
      sync_status: 'synced',
      version: 1,
      items: [],
      payments: [
        {
          id: 'pay-2',
          sale_id: 'sale-2',
          payment_method: 'mpesa',
          amount_minor: 22200,
          currency: 'KES',
          status: 'completed',
          created_at: new Date().toISOString(),
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const lines = generateSaleJournalLines(sale);
    const totalDebits = lines.reduce((sum, l) => sum + l.debitMinor, 0);
    const totalCredits = lines.reduce((sum, l) => sum + l.creditMinor, 0);

    // Debits: M-Pesa (22200) + Discount (1000) = 23200
    // Credits: Revenue (20000) + Tax (3200) = 23200
    expect(totalDebits).toBe(23200);
    expect(totalCredits).toBe(23200);
  });
});
