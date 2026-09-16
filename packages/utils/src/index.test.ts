import { describe, it, expect } from 'vitest';
import { formatMoney, toMinorUnits, fromMinorUnits, generateUUID, generateReceiptNumber, getBackoffDelay } from './index';

describe('@soko/utils', () => {
  it('converts major units to minor units (e.g. KES to cents)', () => {
    expect(toMinorUnits(150.5)).toBe(15050);
    expect(toMinorUnits(0)).toBe(0);
    expect(toMinorUnits(99.99)).toBe(9999);
  });

  it('converts minor units to major units', () => {
    expect(fromMinorUnits(15050)).toBe(150.5);
    expect(fromMinorUnits(0)).toBe(0);
    expect(fromMinorUnits(9999)).toBe(99.99);
  });

  it('formats money with given currency code', () => {
    const formatted = formatMoney(150000, 'KES', 'en-KE');
    expect(formatted).toContain('1,500.00');
  });

  it('generates valid UUID v4', () => {
    const uuid = generateUUID();
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it('generates a formatted receipt number with branch and terminal code', () => {
    const receiptNo = generateReceiptNumber('BR01', 'TERM1');
    expect(receiptNo).toMatch(/^BR01-TERM1-\d{6}-[A-Z0-9]+$/);
  });

  it('calculates exponential backoff delay within bounded range', () => {
    const delay0 = getBackoffDelay(0, 1000, 30000);
    expect(delay0).toBeGreaterThanOrEqual(1000);
    expect(delay0).toBeLessThanOrEqual(1300);

    const delay5 = getBackoffDelay(5, 1000, 30000);
    expect(delay5).toBeLessThanOrEqual(36000);
  });
});
