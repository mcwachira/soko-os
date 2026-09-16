import { Sale, SaleItem } from '@soko/domain-types';

export interface TaxCalculationResult {
  taxableAmountMinor: number;
  taxAmountMinor: number;
  taxRatePercentage: number;
  taxCategoryCode: string;
}

export interface CountryTaxConfig {
  countryCode: string;
  countryName: string;
  defaultCurrency: string;
  taxAuthorityName: string;
  taxPinFormat: RegExp;
  rates: {
    code: string;
    description: string;
    ratePercentage: number;
    isExempt: boolean;
    isZeroRated: boolean;
  }[];
}

export const AFRICAN_TAX_CONFIGS: Record<string, CountryTaxConfig> = {
  KE: {
    countryCode: 'KE',
    countryName: 'Kenya',
    defaultCurrency: 'KES',
    taxAuthorityName: 'Kenya Revenue Authority (KRA)',
    taxPinFormat: /^[AP]\d{9}[A-Z]$/, // e.g. P051234567Z or A012345678X
    rates: [
      { code: 'A', description: 'Standard Rate (16%)', ratePercentage: 16.0, isExempt: false, isZeroRated: false },
      { code: 'B', description: 'Zero Rated (0%)', ratePercentage: 0.0, isExempt: false, isZeroRated: true },
      { code: 'C', description: 'Exempt', ratePercentage: 0.0, isExempt: true, isZeroRated: false },
      { code: 'D', description: 'Special / Fuel (8%)', ratePercentage: 8.0, isExempt: false, isZeroRated: false },
      { code: 'E', description: 'Non-VAT', ratePercentage: 0.0, isExempt: true, isZeroRated: false },
    ],
  },
  UG: {
    countryCode: 'UG',
    countryName: 'Uganda',
    defaultCurrency: 'UGX',
    taxAuthorityName: 'Uganda Revenue Authority (URA)',
    taxPinFormat: /^\d{10}$/,
    rates: [
      { code: 'STD', description: 'Standard Rate (18%)', ratePercentage: 18.0, isExempt: false, isZeroRated: false },
      { code: 'ZERO', description: 'Zero Rated (0%)', ratePercentage: 0.0, isExempt: false, isZeroRated: true },
      { code: 'EXM', description: 'Exempt', ratePercentage: 0.0, isExempt: true, isZeroRated: false },
    ],
  },
  TZ: {
    countryCode: 'TZ',
    countryName: 'Tanzania',
    defaultCurrency: 'TZS',
    taxAuthorityName: 'Tanzania Revenue Authority (TRA)',
    taxPinFormat: /^\d{9}$/,
    rates: [
      { code: 'STD', description: 'Standard Rate (18%)', ratePercentage: 18.0, isExempt: false, isZeroRated: false },
      { code: 'ZERO', description: 'Zero Rated (0%)', ratePercentage: 0.0, isExempt: false, isZeroRated: true },
      { code: 'EXM', description: 'Exempt', ratePercentage: 0.0, isExempt: true, isZeroRated: false },
    ],
  },
  RW: {
    countryCode: 'RW',
    countryName: 'Rwanda',
    defaultCurrency: 'RWF',
    taxAuthorityName: 'Rwanda Revenue Authority (RRA)',
    taxPinFormat: /^\d{9}$/,
    rates: [
      { code: 'STD', description: 'Standard Rate (18%)', ratePercentage: 18.0, isExempt: false, isZeroRated: false },
      { code: 'ZERO', description: 'Zero Rated (0%)', ratePercentage: 0.0, isExempt: false, isZeroRated: true },
      { code: 'EXM', description: 'Exempt', ratePercentage: 0.0, isExempt: true, isZeroRated: false },
    ],
  },
  NG: {
    countryCode: 'NG',
    countryName: 'Nigeria',
    defaultCurrency: 'NGN',
    taxAuthorityName: 'Federal Inland Revenue Service (FIRS)',
    taxPinFormat: /^\d{8}-\d{4}$/,
    rates: [
      { code: 'STD', description: 'Standard Rate (7.5%)', ratePercentage: 7.5, isExempt: false, isZeroRated: false },
      { code: 'ZERO', description: 'Zero Rated (0%)', ratePercentage: 0.0, isExempt: false, isZeroRated: true },
      { code: 'EXM', description: 'Exempt', ratePercentage: 0.0, isExempt: true, isZeroRated: false },
    ],
  },
  GH: {
    countryCode: 'GH',
    countryName: 'Ghana',
    defaultCurrency: 'GHS',
    taxAuthorityName: 'Ghana Revenue Authority (GRA)',
    taxPinFormat: /^P\d{10}$/,
    rates: [
      { code: 'STD', description: 'Standard Rate (15% + NHIL/GETFund)', ratePercentage: 21.9, isExempt: false, isZeroRated: false },
      { code: 'ZERO', description: 'Zero Rated (0%)', ratePercentage: 0.0, isExempt: false, isZeroRated: true },
      { code: 'EXM', description: 'Exempt', ratePercentage: 0.0, isExempt: true, isZeroRated: false },
    ],
  },
};

/**
 * Calculates tax for an item (inclusive pricing model standard in retail)
 */
export function calculateTaxInclusive(
  grossAmountMinor: number,
  taxRatePercentage: number,
  categoryCode = 'A'
): TaxCalculationResult {
  if (taxRatePercentage <= 0) {
    return {
      taxableAmountMinor: grossAmountMinor,
      taxAmountMinor: 0,
      taxRatePercentage: 0,
      taxCategoryCode: categoryCode,
    };
  }

  // Tax = Gross * (Rate / (100 + Rate))
  const taxAmountMinor = Math.round((grossAmountMinor * taxRatePercentage) / (100 + taxRatePercentage));
  const taxableAmountMinor = grossAmountMinor - taxAmountMinor;

  return {
    taxableAmountMinor,
    taxAmountMinor,
    taxRatePercentage,
    taxCategoryCode: categoryCode,
  };
}

/**
 * Tax submission interface for fiscalization engines (e.g. Kenya KRA eTIMS, Tanzania EFD, Rwanda EBM)
 */
export interface TaxSubmissionPayload {
  invoiceNumber: string;
  customerPin?: string;
  customerName?: string;
  totalTaxableAmountMinor: number;
  totalTaxAmountMinor: number;
  grandTotalMinor: number;
  items: Array<{
    itemCode: string;
    itemName: string;
    quantity: number;
    unitPriceMinor: number;
    taxCategoryCode: string;
    taxRatePercentage: number;
    taxAmountMinor: number;
    totalAmountMinor: number;
  }>;
}

export interface TaxSubmissionResult {
  success: boolean;
  qrCodeUrl?: string;
  fiscalSignature?: string;
  internalData?: string;
  receiptNumber?: string;
  taxControlCode?: string;
  status: 'accepted' | 'rejected' | 'queued';
  errorMessage?: string;
}
