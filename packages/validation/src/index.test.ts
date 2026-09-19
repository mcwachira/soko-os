import { describe, it, expect } from 'vitest';
import { CreateSaleSchema, CreateCustomerSchema, LoginSchema } from './index';

describe('@soko/validation', () => {
  it('validates user login credentials', () => {
    const valid = LoginSchema.safeParse({ email: 'cashier@soko.africa', password: 'password123' });
    expect(valid.success).toBe(true);

    const invalid = LoginSchema.safeParse({ email: 'not-an-email', password: '123' });
    expect(invalid.success).toBe(false);
  });

  it('validates customer creation with credit limits', () => {
    const valid = CreateCustomerSchema.safeParse({
      name: 'Mama Mboga Shop',
      phone: '+254711223344',
      tax_pin: 'P051234567Z',
      credit_limit_minor: 5000000,
      price_level: 'wholesale',
    });
    expect(valid.success).toBe(true);
  });

  it('validates sale creation with items and payment', () => {
    const valid = CreateSaleSchema.safeParse({
      items: [
        {
          product_id: 'a0000000-0000-0000-0000-000000000001',
          sku: 'SKU-001',
          name: 'Basmati Rice 2kg',
          quantity: 2,
          unit_price_minor: 32000,
        },
      ],
      payments: [
        {
          payment_method: 'mpesa',
          amount_minor: 64000,
          phone_number: '254712345678',
        },
      ],
    });
    expect(valid.success).toBe(true);
  });
});
