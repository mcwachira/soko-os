/**
 * @soko/etims - KRA eTIMS Integration
 * 
 * Supports three modes:
 * - PRODUCTION: Real KRA eTIMS integration (requires certification)
 * - SANDBOX: KRA sandbox environment (requires sandbox credentials)
 * - MOCK: Local simulation for development/testing (no credentials needed)
 */

import { Sale, SaleItem } from '@soko/domain-types';
import { TaxCalculationResult } from '@soko/tax';

export type EtimsMode = 'production' | 'sandbox' | 'mock';

export interface EtimsConfig {
  mode: EtimsMode;
  // Production/Sandbox credentials
  pin?: string;           // KRA PIN
  deviceId?: string;      // Control Unit Serial Number
  certificatePath?: string; // Path to SSL certificate
  certificatePassword?: string;
  // Sandbox specific
  sandboxUrl?: string;
  sandboxPin?: string;
  // Callbacks
  onSubmissionQueued?: (submission: EtimsSubmission) => void;
  onSubmissionAccepted?: (submission: EtimsSubmission) => void;
  onSubmissionRejected?: (submission: EtimsSubmission, error: string) => void;
}

export interface EtimsSubmission {
  id: string;
  saleId: string;
  receiptNumber: string;
  payload: EtimsPayload;
  status: EtimsStatus;
  attemptCount: number;
  lastAttemptAt?: string;
  nextRetryAt?: string;
  externalReference?: string;
  responseCode?: string;
  responsePayload?: Record<string, unknown>;
  errorMessage?: string;
  submittedAt?: string;
  acceptedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type EtimsStatus = 
  | 'queued' 
  | 'submitting' 
  | 'submitted' 
  | 'accepted' 
  | 'rejected' 
  | 'retrying' 
  | 'failed' 
  | 'blocked_external';

export interface EtimsPayload {
  // KRA eTIMS stock IO payload structure
  trxDate: string;          // YYYYMMDD
  trxTime: string;          // HHMMSS
  trxType: 'SALE' | 'RETURN' | 'VOID';
  invoiceNo: string;
  custPin?: string;         // Customer KRA PIN
  custName?: string;
  items: EtimsItem[];
  totalTaxableAmt: number;  // Minor units
  totalTaxAmt: number;      // Minor units
  totalAmt: number;         // Minor units
  paymentMode: 'CASH' | 'CARD' | 'MPESA' | 'BANK' | 'CREDIT' | 'MIXED';
  deviceSerialNo: string;
}

export interface EtimsItem {
  itemCode: string;
  itemName: string;
  qty: number;
  unitPrice: number;        // Minor units
  taxRate: string;          // 'A', 'B', 'C', 'D', 'E'
  taxAmt: number;           // Minor units
  totalAmt: number;         // Minor units
}

export interface EtimsResponse {
  success: boolean;
  receiptNo?: string;
  qrCodeUrl?: string;
  fiscalSignature?: string;
  internalData?: string;
  taxControlCode?: string;
  status: 'accepted' | 'rejected' | 'queued';
  errorMessage?: string;
  rawResponse?: Record<string, unknown>;
}

// ============================================================================
// Payload Builder
// ============================================================================

export class EtimsPayloadBuilder {
  static buildFromSale(
    sale: Sale,
    items: SaleItem[],
    payments: Array<{ payment_method: string; amount_minor: number }>,
    config: { pin: string; deviceId: string; branchName: string }
  ): EtimsPayload {
    const paymentMethods = payments.map(p => p.payment_method.toUpperCase());
    const isMixed = paymentMethods.length > 1;
    const primaryPayment = isMixed ? 'MIXED' : paymentMethods[0];

    return {
      trxDate: new Date(sale.created_at).toISOString().split('T')[0].replace(/-/g, ''),
      trxTime: new Date(sale.created_at).toISOString().split('T')[1].substring(0, 8).replace(/:/g, ''),
      trxType: 'SALE',
      invoiceNo: sale.receipt_number,
      custPin: sale.customer?.tax_pin,
      custName: sale.customer?.name,
      items: items.map(item => ({
        itemCode: item.sku,
        itemName: item.name,
        qty: item.quantity,
        unitPrice: item.unit_price_minor,
        taxRate: item.tax_category_code || 'A',
        taxAmt: item.tax_amount_minor,
        totalAmt: item.total_minor
      })),
      totalTaxableAmt: sale.subtotal_minor - sale.discount_minor,
      totalTaxAmt: sale.tax_total_minor,
      totalAmt: sale.grand_total_minor,
      paymentMode: this.mapPaymentMode(primaryPayment),
      deviceSerialNo: config.deviceId
    };
  }

  private static mapPaymentMode(method: string): EtimsPayload['paymentMode'] {
    const modeMap: Record<string, EtimsPayload['paymentMode']> = {
      'CASH': 'CASH',
      'CARD': 'CARD',
      'MPESA': 'MPESA',
      'BANK': 'BANK',
      'CREDIT': 'CREDIT',
      'MIXED': 'MIXED'
    };
    return modeMap[method.toUpperCase()] || 'CASH';
  }
}

// ============================================================================
// Mock eTIMS Adapter (Development/Testing)
// ============================================================================

export class MockEtimsAdapter {
  private submissions: Map<string, EtimsSubmission> = new Map();
  private config: EtimsConfig;
  private autoAcceptDelay: number = 100; // ms

  constructor(config: EtimsConfig) {
    this.config = { ...config, mode: 'mock' };
  }

  async submit(payload: EtimsPayload): Promise<EtimsResponse> {
    const submission: EtimsSubmission = {
      id: `etims-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      saleId: payload.invoiceNo,
      receiptNumber: payload.invoiceNo,
      payload,
      status: 'submitting',
      attemptCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.submissions.set(submission.id, submission);
    this.config.onSubmissionQueued?.(submission);

    // Simulate network delay
    await this.delay(this.autoAcceptDelay);

    // Mock acceptance - in real implementation this would call KRA API
    const success = Math.random() > 0.05; // 95% success rate
    
    if (success) {
      submission.status = 'accepted';
      submission.externalReference = `KRA-${Date.now()}`;
      submission.responseCode = '0000';
      submission.fiscalSignature = `FS-${Math.random().toString(36).substring(2, 16).toUpperCase()}`;
      submission.internalData = `INT-${Math.random().toString(36).substring(2, 16).toUpperCase()}`;
      submission.taxControlCode = `TC-${Math.random().toString(36).substring(2, 12).toUpperCase()}`;
      submission.acceptedAt = new Date().toISOString();
      submission.qrCodeUrl = `https://etims.kra.go.ke/qr/${submission.externalReference}`;
      
      this.config.onSubmissionAccepted?.(submission);
      
      return {
        success: true,
        receiptNo: submission.externalReference,
        qrCodeUrl: submission.qrCodeUrl,
        fiscalSignature: submission.fiscalSignature,
        internalData: submission.internalData,
        taxControlCode: submission.taxControlCode,
        status: 'accepted'
      };
    } else {
      submission.status = 'rejected';
      submission.errorMessage = 'Mock rejection: Simulated KRA error';
      submission.responseCode = '9999';
      submission.responsePayload = { error: 'Simulated failure' };
      
      this.config.onSubmissionRejected?.(submission, submission.errorMessage!);
      
      return {
        success: false,
        status: 'rejected',
        errorMessage: submission.errorMessage,
        rawResponse: submission.responsePayload
      };
    }
  }

  async checkStatus(submissionId: string): Promise<EtimsResponse> {
    const submission = this.submissions.get(submissionId);
    if (!submission) {
      return { success: false, status: 'rejected', errorMessage: 'Submission not found' };
    }
    
    return {
      success: submission.status === 'accepted',
      receiptNo: submission.externalReference,
      qrCodeUrl: submission.qrCodeUrl,
      fiscalSignature: submission.fiscalSignature,
      internalData: submission.internalData,
      taxControlCode: submission.taxControlCode,
      status: submission.status === 'accepted' ? 'accepted' : submission.status === 'rejected' ? 'rejected' : 'queued',
      errorMessage: submission.errorMessage
    };
  }

  async retry(submissionId: string): Promise<EtimsResponse> {
    const submission = this.submissions.get(submissionId);
    if (!submission) {
      return { success: false, status: 'rejected', errorMessage: 'Submission not found' };
    }

    submission.status = 'retrying';
    submission.attemptCount++;
    submission.lastAttemptAt = new Date().toISOString();
    submission.nextRetryAt = new Date(Date.now() + 60000).toISOString();
    
    return this.submit(submission.payload);
  }

  getSubmission(submissionId: string): EtimsSubmission | undefined {
    return this.submissions.get(submissionId);
  }

  getAllSubmissions(): EtimsSubmission[] {
    return Array.from(this.submissions.values());
  }

  getPendingSubmissions(): EtimsSubmission[] {
    return Array.from(this.submissions.values()).filter(s => 
      s.status === 'queued' || s.status === 'retrying' || s.status === 'submitted'
    );
  }

  getFailedSubmissions(): EtimsSubmission[] {
    return Array.from(this.submissions.values()).filter(s => s.status === 'failed');
  }

  setAutoAcceptDelay(delayMs: number): void {
    this.autoAcceptDelay = delayMs;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// Production eTIMS Adapter (Placeholder for real implementation)
// ============================================================================

export class ProductionEtimsAdapter {
  private config: EtimsConfig;

  constructor(config: EtimsConfig) {
    if (config.mode !== 'production' && config.mode !== 'sandbox') {
      throw new Error('ProductionEtimsAdapter requires production or sandbox mode');
    }
    this.config = config;
  }

  async submit(payload: EtimsPayload): Promise<EtimsResponse> {
    // Real implementation would:
    // 1. Sign payload with certificate
    // 2. Send to KRA eTIMS endpoint (production or sandbox)
    // 3. Handle response
    // 4. Update local submission record
    
    throw new Error('Production eTIMS adapter not implemented. Requires KRA certification and credentials.');
  }

  async checkStatus(submissionId: string): Promise<EtimsResponse> {
    throw new Error('Production eTIMS adapter not implemented.');
  }

  async retry(submissionId: string): Promise<EtimsResponse> {
    throw new Error('Production eTIMS adapter not implemented.');
  }
}

// ============================================================================
// Factory
// ============================================================================

export function createEtimsAdapter(config: EtimsConfig): MockEtimsAdapter | ProductionEtimsAdapter {
  if (config.mode === 'mock') {
    return new MockEtimsAdapter(config);
  }
  return new ProductionEtimsAdapter(config);
}

// ============================================================================
// Helper: Convert Sale to eTIMS Submission
// ============================================================================

export interface SaleWithRelations extends Sale {
  customer?: { tax_pin?: string; name?: string } | null;
  terminal?: { terminal_code: string } | null;
}

export function createEtimsSubmissionFromSale(
  sale: SaleWithRelations,
  items: SaleItem[],
  payments: Array<{ payment_method: string; amount_minor: number }>,
  config: EtimsConfig
): EtimsSubmission {
  const payload = EtimsPayloadBuilder.buildFromSale(sale, items, payments, {
    pin: config.pin || '',
    deviceId: config.deviceId || sale.terminal?.terminal_code || 'UNKNOWN',
    branchName: ''
  });

  return {
    id: `etims-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    saleId: sale.id,
    receiptNumber: sale.receipt_number,
    payload,
    status: 'queued',
    attemptCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}