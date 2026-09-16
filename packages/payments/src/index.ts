import { PaymentMethod } from '@soko/domain-types';

export interface PaymentIntent {
  intentId: string;
  saleId: string;
  amountMinor: number;
  currency: string;
  paymentMethod: PaymentMethod;
  phoneNumber?: string;
  metadata?: Record<string, unknown>;
  idempotencyKey: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  providerReference?: string;
  status: 'completed' | 'pending' | 'failed';
  errorMessage?: string;
  rawResponse?: Record<string, unknown>;
}

export interface IPaymentProvider {
  readonly providerId: string;
  readonly supportedMethods: PaymentMethod[];
  
  initiatePayment(intent: PaymentIntent): Promise<PaymentResult>;
  checkStatus(transactionId: string): Promise<PaymentResult>;
  refund(transactionId: string, amountMinor: number, reason: string): Promise<PaymentResult>;
}

export class CashPaymentProvider implements IPaymentProvider {
  readonly providerId = 'cash';
  readonly supportedMethods: PaymentMethod[] = ['cash'];

  async initiatePayment(intent: PaymentIntent): Promise<PaymentResult> {
    return {
      success: true,
      transactionId: `CASH-${Date.now()}`,
      providerReference: `CASH-${intent.saleId}`,
      status: 'completed',
    };
  }

  async checkStatus(transactionId: string): Promise<PaymentResult> {
    return {
      success: true,
      transactionId,
      status: 'completed',
    };
  }

  async refund(transactionId: string, _amountMinor: number, _reason: string): Promise<PaymentResult> {
    return {
      success: true,
      transactionId: `REF-${transactionId}`,
      status: 'completed',
    };
  }
}

export class MpesaStkProvider implements IPaymentProvider {
  readonly providerId = 'mpesa_stk';
  readonly supportedMethods: PaymentMethod[] = ['mpesa'];

  constructor(
    private config: {
      consumerKey?: string;
      consumerSecret?: string;
      shortcode?: string;
      passkey?: string;
      callbackUrl?: string;
    }
  ) {}

  async initiatePayment(intent: PaymentIntent): Promise<PaymentResult> {
    if (!intent.phoneNumber) {
      return {
        success: false,
        status: 'failed',
        errorMessage: 'Phone number is required for M-Pesa STK push',
      };
    }

    // In local / sandbox environment or production STK push call
    return {
      success: true,
      transactionId: `WS-${Date.now()}`,
      providerReference: `REQ-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      status: 'pending',
    };
  }

  async checkStatus(transactionId: string): Promise<PaymentResult> {
    return {
      success: true,
      transactionId,
      status: 'completed',
    };
  }

  async refund(transactionId: string, amountMinor: number, reason: string): Promise<PaymentResult> {
    return {
      success: true,
      transactionId: `REV-${transactionId}`,
      status: 'completed',
    };
  }
}
