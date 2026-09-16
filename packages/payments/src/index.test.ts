import { describe, it, expect } from 'vitest';
import { CashPaymentProvider, MpesaStkProvider, PaymentIntent } from './index';

describe('@soko/payments', () => {
  describe('CashPaymentProvider', () => {
    const provider = new CashPaymentProvider();

    it('processes cash payments synchronously', async () => {
      const intent: PaymentIntent = {
        intentId: 'pi-1',
        saleId: 'sale-1',
        amountMinor: 50000,
        currency: 'KES',
        paymentMethod: 'cash',
        idempotencyKey: 'idem-1',
      };

      const result = await provider.initiatePayment(intent);
      expect(result.success).toBe(true);
      expect(result.status).toBe('completed');
      expect(result.transactionId).toContain('CASH-');
    });

    it('issues refund for cash payment', async () => {
      const result = await provider.refund('CASH-12345', 50000, 'Customer return');
      expect(result.success).toBe(true);
      expect(result.status).toBe('completed');
      expect(result.transactionId).toBe('REF-CASH-12345');
    });
  });

  describe('MpesaStkProvider', () => {
    const provider = new MpesaStkProvider({
      consumerKey: 'test_key',
      consumerSecret: 'test_secret',
      shortcode: '174379',
    });

    it('fails initiation if phone number is missing', async () => {
      const intent: PaymentIntent = {
        intentId: 'pi-2',
        saleId: 'sale-2',
        amountMinor: 10000,
        currency: 'KES',
        paymentMethod: 'mpesa',
        idempotencyKey: 'idem-2',
      };

      const result = await provider.initiatePayment(intent);
      expect(result.success).toBe(false);
      expect(result.status).toBe('failed');
      expect(result.errorMessage).toContain('Phone number is required');
    });

    it('initiates M-Pesa STK push when phone number is provided', async () => {
      const intent: PaymentIntent = {
        intentId: 'pi-3',
        saleId: 'sale-3',
        amountMinor: 10000,
        currency: 'KES',
        paymentMethod: 'mpesa',
        phoneNumber: '254712345678',
        idempotencyKey: 'idem-3',
      };

      const result = await provider.initiatePayment(intent);
      expect(result.success).toBe(true);
      expect(result.status).toBe('pending');
      expect(result.transactionId).toBeDefined();
    });
  });
});
