/**
 * Money and Currency Utilities
 * Uses integer minor units (e.g. cents) to avoid floating point issues.
 */
export function formatMoney(amountMinor: number, currency = 'KES', locale = 'en-KE'): string {
  const amount = amountMinor / 100;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function toMinorUnits(amount: number): number {
  return Math.round(amount * 100);
}

export function fromMinorUnits(amountMinor: number): number {
  return amountMinor / 100;
}

/**
 * UUID v4 generator for local offline record creation
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Receipt Number Generator for Offline/Online POS
 */
export function generateReceiptNumber(branchCode: string, terminalCode: string): string {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${branchCode}-${terminalCode}-${dateStr}-${randomStr}`;
}

/**
 * Exponential backoff calculator
 */
export function getBackoffDelay(attempt: number, baseMs = 1000, maxMs = 30000): number {
  const delay = Math.min(maxMs, baseMs * Math.pow(2, attempt));
  const jitter = delay * 0.2 * Math.random();
  return Math.floor(delay + jitter);
}
