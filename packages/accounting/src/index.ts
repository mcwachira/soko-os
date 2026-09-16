import { Sale, SaleItem } from '@soko/domain-types';

export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';

export interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  currency: string;
  is_active: boolean;
}

export interface JournalLine {
  accountId: string;
  accountCode: string;
  description?: string;
  debitMinor: number;
  creditMinor: number;
}

export interface JournalEntry {
  id: string;
  referenceType: string;
  referenceId: string;
  entryDate: string;
  notes?: string;
  lines: JournalLine[];
}

export interface IAccountingProvider {
  readonly providerId: string;
  syncCustomer(customer: unknown): Promise<{ externalId: string }>;
  syncProduct(product: unknown): Promise<{ externalId: string }>;
  syncInvoice(sale: Sale): Promise<{ externalInvoiceId: string; externalNumber: string }>;
  syncJournalEntry(entry: JournalEntry): Promise<{ externalJournalId: string }>;
}

/**
 * Standard African SME Chart of Accounts Default Codes
 */
export const DEFAULT_CHART_OF_ACCOUNTS: Array<{ code: string; name: string; type: AccountType }> = [
  { code: '1010', name: 'Cash on Hand (Till / Drawer)', type: 'asset' },
  { code: '1020', name: 'M-Pesa Till / Paybill Account', type: 'asset' },
  { code: '1030', name: 'Bank Account - Operating', type: 'asset' },
  { code: '1100', name: 'Accounts Receivable (Debtors)', type: 'asset' },
  { code: '1200', name: 'Inventory Asset', type: 'asset' },
  { code: '2000', name: 'Accounts Payable (Creditors)', type: 'liability' },
  { code: '2100', name: 'VAT / Sales Tax Output Liability', type: 'liability' },
  { code: '3000', name: 'Owner Equity', type: 'equity' },
  { code: '3100', name: 'Retained Earnings', type: 'equity' },
  { code: '4000', name: 'Sales Revenue (POS)', type: 'revenue' },
  { code: '4100', name: 'Discount Given', type: 'expense' },
  { code: '5000', name: 'Cost of Goods Sold (COGS)', type: 'expense' },
  { code: '6000', name: 'Operating Expenses', type: 'expense' },
];

/**
 * Generates balanced double-entry lines for a POS sale
 */
export function generateSaleJournalLines(sale: Sale): JournalLine[] {
  const lines: JournalLine[] = [];

  // 1. Debit Payments (Cash, M-Pesa, Bank, or Receivable)
  for (const payment of sale.payments) {
    let accountCode = '1010'; // default cash
    if (payment.payment_method === 'mpesa' || payment.payment_method === 'airtel') {
      accountCode = '1020';
    } else if (payment.payment_method === 'card' || payment.payment_method === 'bank') {
      accountCode = '1030';
    } else if (payment.payment_method === 'credit') {
      accountCode = '1100';
    }

    lines.push({
      accountId: accountCode,
      accountCode,
      description: `Payment for Sale ${sale.receipt_number} via ${payment.payment_method}`,
      debitMinor: payment.amount_minor,
      creditMinor: 0,
    });
  }

  // 2. Credit Sales Revenue (Subtotal)
  if (sale.subtotal_minor > 0) {
    lines.push({
      accountId: '4000',
      accountCode: '4000',
      description: `Sales Revenue for ${sale.receipt_number}`,
      debitMinor: 0,
      creditMinor: sale.subtotal_minor,
    });
  }

  // 3. Credit Tax Liability (Output Tax)
  if (sale.tax_total_minor > 0) {
    lines.push({
      accountId: '2100',
      accountCode: '2100',
      description: `Output Tax Liability for ${sale.receipt_number}`,
      debitMinor: 0,
      creditMinor: sale.tax_total_minor,
    });
  }

  // 4. Debit Discount if any
  if (sale.discount_minor > 0) {
    lines.push({
      accountId: '4100',
      accountCode: '4100',
      description: `Discount given on ${sale.receipt_number}`,
      debitMinor: sale.discount_minor,
      creditMinor: 0,
    });
  }

  return lines;
}
