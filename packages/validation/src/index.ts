import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  device_uuid: z.string().optional(),
});

export const SaleItemInputSchema = z.object({
  product_id: z.string().uuid(),
  sku: z.string().min(1),
  name: z.string().min(1),
  quantity: z.number().positive(),
  unit_price_minor: z.number().int().nonnegative(),
  discount_minor: z.number().int().nonnegative().default(0),
  tax_category_code: z.string().default('A'),
});

export const PaymentInputSchema = z.object({
  payment_method: z.enum(['cash', 'card', 'mpesa', 'airtel', 'bank', 'credit', 'points']),
  amount_minor: z.number().int().positive(),
  reference: z.string().optional(),
  phone_number: z.string().optional(),
});

export const CreateSaleSchema = z.object({
  local_id: z.string().optional(),
  customer_id: z.string().uuid().nullable().optional(),
  items: z.array(SaleItemInputSchema).min(1),
  payments: z.array(PaymentInputSchema).min(1),
  discount_minor: z.number().int().nonnegative().default(0),
  notes: z.string().optional(),
});

export const OpenShiftSchema = z.object({
  terminal_id: z.string().uuid(),
  opening_float_minor: z.number().int().nonnegative(),
  notes: z.string().optional(),
});

export const CloseShiftSchema = z.object({
  actual_cash_minor: z.number().int().nonnegative(),
  notes: z.string().optional(),
});

export const CreateReturnSchema = z.object({
  sale_id: z.string().uuid(),
  return_type: z.enum(['refund', 'exchange', 'store_credit']),
  reason: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    sale_item_id: z.string().uuid(),
    quantity: z.number().positive(),
    return_reason: z.enum(['defective', 'wrong_item', 'changed_mind', 'damaged', 'expired', 'other']).optional(),
    condition: z.enum(['good', 'damaged', 'expired']).optional(),
  })).min(1),
});

export const CreateRefundSchema = z.object({
  sale_id: z.string().uuid(),
  return_id: z.string().uuid().optional(),
  refund_method: z.enum(['cash', 'card', 'mpesa', 'airtel', 'bank', 'store_credit', 'original']),
  amount_minor: z.number().int().positive(),
  reason: z.string().optional(),
});

export const CreateCustomerSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  tax_pin: z.string().optional(),
  credit_limit_minor: z.number().int().nonnegative().default(0),
  price_level: z.enum(['retail', 'wholesale', 'distributor']).default('retail'),
});

export const CreateProductSchema = z.object({
  sku: z.string().min(2),
  barcode: z.string().optional(),
  name: z.string().min(2),
  description: z.string().optional(),
  category_id: z.string().uuid().nullable().optional(),
  tax_category_code: z.string().default('A'),
  unit: z.string().default('pcs'),
  cost_price_minor: z.number().int().nonnegative(),
  selling_price_minor: z.number().int().nonnegative(),
  reorder_level: z.number().int().nonnegative().default(5),
  track_inventory: z.boolean().default(true),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type CreateSaleInput = z.infer<typeof CreateSaleSchema>;
export type CreateCustomerInput = z.infer<typeof CreateCustomerSchema>;
export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type OpenShiftInput = z.infer<typeof OpenShiftSchema>;
export type CloseShiftInput = z.infer<typeof CloseShiftSchema>;
export type CreateReturnInput = z.infer<typeof CreateReturnSchema>;
export type CreateRefundInput = z.infer<typeof CreateRefundSchema>;
