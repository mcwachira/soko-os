import { describe, it, expect } from 'vitest';
import { calculateTaxInclusive, AFRICAN_TAX_CONFIGS } from './index';

describe('@soko/tax', () => {
  describe('calculateTaxInclusive', () => {
    it('calculates 16% standard VAT accurately on gross amount', () => {
      // Gross: 11600 (KES 116.00), VAT 16% -> Tax: 1600 (KES 16.00), Taxable: 10000 (KES 100.00)
      const res = calculateTaxInclusive(11600, 16.0, 'A');
      expect(res.taxAmountMinor).toBe(1600);
      expect(res.taxableAmountMinor).toBe(10000);
      expect(res.taxRatePercentage).toBe(16.0);
      expect(res.taxCategoryCode).toBe('A');
    });

    it('returns zero tax for zero-rated or exempt items', () => {
      const res = calculateTaxInclusive(5000, 0, 'B');
      expect(res.taxAmountMinor).toBe(0);
      expect(res.taxableAmountMinor).toBe(5000);
    });

    it('calculates 18% standard VAT for East African neighbours (TZ/UG/RW)', () => {
      // Gross: 11800 (118.00), VAT 18% -> Tax: 1800, Taxable: 10000
      const res = calculateTaxInclusive(11800, 18.0, 'STD');
      expect(res.taxAmountMinor).toBe(1800);
      expect(res.taxableAmountMinor).toBe(10000);
    });
  });

  describe('AFRICAN_TAX_CONFIGS', () => {
    it('validates Kenya KRA PIN format', () => {
      const ke = AFRICAN_TAX_CONFIGS['KE'];
      expect(ke).toBeDefined();
      expect(ke.taxPinFormat.test('P051234567Z')).toBe(true);
      expect(ke.taxPinFormat.test('A012345678X')).toBe(true);
      expect(ke.taxPinFormat.test('INVALID_PIN')).toBe(false);
    });

    it('contains configurations for Kenya, Uganda, Tanzania, Rwanda, Nigeria, and Ghana', () => {
      const countries = ['KE', 'UG', 'TZ', 'RW', 'NG', 'GH'];
      for (const code of countries) {
        expect(AFRICAN_TAX_CONFIGS[code]).toBeDefined();
        expect(AFRICAN_TAX_CONFIGS[code].rates.length).toBeGreaterThan(0);
      }
    });
  });
});
