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

export const CreateLeadSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  company_name: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  whatsapp_phone: z.string().optional(),
  source: z.string().optional(),
  status: z.enum(['new', 'contacted', 'qualified', 'unqualified', 'converted', 'discarded']).default('new'),
  lifecycle_stage: z.enum(['lead', 'marketing_qualified', 'sales_qualified', 'opportunity', 'customer']).default('lead'),
  notes: z.string().optional(),
});

export const CreateCrmAccountSchema = z.object({
  account_type: z.enum(['customer', 'prospect', 'partner', 'distributor', 'reseller', 'government', 'ngo']).default('prospect'),
  legal_name: z.string().min(2),
  trading_name: z.string().optional(),
  registration_number: z.string().optional(),
  kra_pin: z.string().optional(),
  industry: z.string().optional(),
  country_code: z.string().min(2).default('KE'),
  county: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  credit_limit_minor: z.number().int().nonnegative().default(0),
  payment_terms: z.string().optional(),
  notes: z.string().optional(),
});

export const CreateContactSchema = z.object({
  account_id: z.string().uuid().optional(),
  lead_id: z.string().uuid().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  job_title: z.string().optional(),
  department: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  whatsapp_phone: z.string().optional(),
  preferred_channel: z.string().optional(),
  is_decision_maker: z.boolean().default(false),
  is_billing_contact: z.boolean().default(false),
  is_technical_contact: z.boolean().default(false),
  notes: z.string().optional(),
});

export const CreateDealSchema = z.object({
  account_id: z.string().uuid().optional(),
  contact_id: z.string().uuid().optional(),
  pipeline_id: z.string().uuid(),
  stage_id: z.string().uuid(),
  lead_id: z.string().uuid().optional(),
  deal_name: z.string().min(2),
  description: z.string().optional(),
  currency: z.string().min(3).default('KES'),
  value_minor: z.number().int().nonnegative(),
  expected_close_date: z.string().optional(),
  notes: z.string().optional(),
});

export const CreatePipelineSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  type: z.enum(['sales', 'retail', 'enterprise', 'services', 'renewals', 'partnerships']).default('sales'),
  is_active: z.boolean().default(true),
  is_default: z.boolean().default(false),
});

export const CreateCampaignSchema = z.object({
  name: z.string().min(2),
  type: z.enum(['marketing', 'sales', 'nurture', 'event']).default('marketing'),
  channel: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  budget_minor: z.number().int().nonnegative().default(0),
  currency: z.string().min(3).default('KES'),
  description: z.string().optional(),
});

export const CreateCaseSchema = z.object({
  account_id: z.string().uuid().optional(),
  contact_id: z.string().uuid().optional(),
  deal_id: z.string().uuid().optional(),
  subject: z.string().min(2),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  category: z.string().optional(),
  channel: z.string().optional(),
  resolution: z.string().optional(),
});

export const CreateDealStageSchema = z.object({
  pipeline_id: z.string().uuid(),
  name: z.string().min(2),
  description: z.string().optional(),
  position: z.number().int().nonnegative(),
  probability_percentage: z.number().int().min(0).max(100).default(0),
});

export const CreateActivitySchema = z.object({
  activity_type: z.enum(['task', 'call', 'meeting', 'email', 'note', 'visit', 'follow_up', 'whatsapp', 'sms']).default('task'),
  subject: z.string().optional(),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  due_date: z.string().optional(),
});

export const CreateCommunicationSchema = z.object({
  channel: z.enum(['email', 'whatsapp', 'sms', 'phone', 'web', 'social']).default('email'),
  direction: z.enum(['inbound', 'outbound']).default('outbound'),
  from_address: z.string().optional(),
  to_address: z.string().optional(),
  subject: z.string().optional(),
  body: z.string().optional(),
});

export const CreateWorkflowSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  trigger_entity: z.string().optional(),
  trigger_event: z.string().optional(),
  is_active: z.boolean().default(true),
  priority: z.number().int().default(0),
});

export const CreateSlaPolicySchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  applies_to_entity: z.string().optional(),
  sla_type: z.enum(['first_response', 'next_response', 'resolution', 'follow_up']).default('first_response'),
  threshold_minutes: z.number().int().nonnegative().optional(),
  threshold_hours: z.number().int().nonnegative().optional(),
  threshold_days: z.number().int().nonnegative().optional(),
  is_active: z.boolean().default(true),
});

export const CreateCustomFieldDefinitionSchema = z.object({
  entity_type: z.string().min(2),
  field_name: z.string().min(2),
  field_label: z.string().min(2),
  field_type: z.string().min(2),
  is_required: z.boolean().default(false),
  is_unique: z.boolean().default(false),
  position: z.number().int().nonnegative().default(0),
  is_active: z.boolean().default(true),
});

export const CreateTerritorySchema = z.object({
  name: z.string().min(2),
  code: z.string().optional(),
  type: z.string().default('region'),
  country_code: z.string().min(2).default('KE'),
  parent_territory_id: z.string().uuid().optional(),
});

export const CreatePriceBookSchema = z.object({
  name: z.string().min(2),
  type: z.string().default('standard'),
  currency: z.string().min(3).default('KES'),
  is_active: z.boolean().default(true),
  is_default: z.boolean().default(false),
});

export const CreateKnowledgeArticleSchema = z.object({
  title: z.string().min(2),
  content: z.string().optional(),
  category: z.string().optional(),
  status: z.string().default('draft'),
  author_user_id: z.string().uuid().optional(),
});

export const CreateSequenceSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  target_entity: z.string().optional(),
  status: z.string().default('draft'),
  total_steps: z.number().int().nonnegative().default(0),
});

export const CreateLeadScoringRuleSchema = z.object({
  name: z.string().min(2),
  condition_type: z.string().min(2),
  condition_field: z.string().optional(),
  condition_operator: z.string().optional(),
  score_change: z.number().int(),
  is_decay: z.boolean().default(false),
  decay_after_hours: z.number().int().nonnegative().optional(),
  decay_amount: z.number().int().nonnegative().optional(),
  is_active: z.boolean().default(true),
});

export const CreateLeadAssignmentSchema = z.object({
  rule_name: z.string().min(2),
  assignment_type: z.string().min(2),
  is_active: z.boolean().default(true),
});

export const CreateSupplierSchema = z.object({
  supplier_type: z.enum(['individual', 'sole_proprietor', 'sme', 'company', 'corporation', 'manufacturer', 'distributor', 'wholesaler', 'retailer', 'service_provider', 'contractor', 'consultant', 'government_supplier', 'ngo_supplier', 'international']).default('sme'),
  legal_name: z.string().min(2),
  trading_name: z.string().optional(),
  registration_number: z.string().optional(),
  kra_pin: z.string().optional(),
  vat_status: z.string().optional(),
  tax_country_code: z.string().min(2).default('KE'),
  country_code: z.string().min(2).default('KE'),
  county: z.string().optional(),
  city: z.string().optional(),
  physical_address: z.string().optional(),
  postal_address: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  primary_contact_name: z.string().optional(),
  finance_contact_name: z.string().optional(),
  procurement_contact_name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  whatsapp_phone: z.string().optional(),
  payment_terms: z.string().optional(),
  currency: z.string().min(3).default('KES'),
  credit_terms: z.string().optional(),
  credit_limit_minor: z.number().int().nonnegative().default(0),
  mpesa_paybill: z.string().optional(),
  mpesa_till: z.string().optional(),
  payment_preference: z.string().optional(),
  tax_classification: z.string().optional(),
  risk_level: z.string().optional(),
  rating: z.number().int().min(0).max(5).optional(),
  notes: z.string().optional(),
});

export const CreatePurchaseRequisitionSchema = z.object({
  business_id: z.string().uuid().optional(),
  branch_id: z.string().uuid().optional(),
  warehouse_id: z.string().uuid().optional(),
  department: z.string().optional(),
  cost_center: z.string().optional(),
  project_id: z.string().uuid().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  required_date: z.string().optional(),
  reason: z.string().optional(),
  budget_minor: z.number().int().nonnegative().optional(),
  currency: z.string().min(3).default('KES'),
  notes: z.string().optional(),
});

export const CreateRfqSchema = z.object({
  business_id: z.string().uuid().optional(),
  branch_id: z.string().uuid().optional(),
  warehouse_id: z.string().uuid().optional(),
  title: z.string().min(2),
  description: z.string().optional(),
  submission_deadline: z.string().optional(),
  delivery_required_date: z.string().optional(),
  commercial_terms: z.string().optional(),
  payment_terms: z.string().optional(),
  tax_requirements: z.string().optional(),
  notes: z.string().optional(),
});

export const CreateTenderSchema = z.object({
  business_id: z.string().uuid().optional(),
  branch_id: z.string().uuid().optional(),
  title: z.string().min(2),
  description: z.string().optional(),
  submission_deadline: z.string().optional(),
  opening_date: z.string().optional(),
  notes: z.string().optional(),
});

export const CreateSupplierInvoiceSchema = z.object({
  supplier_id: z.string().uuid(),
  purchase_order_id: z.string().uuid().optional(),
  invoice_number: z.string().min(2),
  invoice_date: z.string().min(2),
  due_date: z.string().optional(),
  currency: z.string().min(3).default('KES'),
  subtotal_minor: z.number().int().nonnegative(),
  discount_minor: z.number().int().nonnegative().default(0),
  tax_minor: z.number().int().nonnegative().default(0),
  wht_minor: z.number().int().nonnegative().default(0),
  grand_total_minor: z.number().int().nonnegative(),
  etims_control_number: z.string().optional(),
  notes: z.string().optional(),
});

export const CreatePaymentVoucherSchema = z.object({
  business_id: z.string().uuid().optional(),
  branch_id: z.string().uuid().optional(),
  supplier_id: z.string().uuid(),
  currency: z.string().min(3).default('KES'),
  gross_amount_minor: z.number().int().positive(),
  wht_rate_percentage: z.number().int().min(0).max(100).optional(),
  wht_amount_minor: z.number().int().nonnegative().default(0),
  other_deductions_minor: z.number().int().nonnegative().default(0),
  net_payable_minor: z.number().int().positive(),
  notes: z.string().optional(),
});

export const CreateSupplierPaymentSchema = z.object({
  payment_voucher_id: z.string().uuid().optional(),
  supplier_id: z.string().uuid(),
  currency: z.string().min(3).default('KES'),
  amount_minor: z.number().int().positive(),
  payment_method: z.string().min(2),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateSupplierInput = z.infer<typeof CreateSupplierSchema>;
export type CreatePurchaseRequisitionInput = z.infer<typeof CreatePurchaseRequisitionSchema>;
export type CreateRfqInput = z.infer<typeof CreateRfqSchema>;
export type CreateTenderInput = z.infer<typeof CreateTenderSchema>;
export type CreateSupplierInvoiceInput = z.infer<typeof CreateSupplierInvoiceSchema>;
export type CreatePaymentVoucherInput = z.infer<typeof CreatePaymentVoucherSchema>;
export type CreateSupplierPaymentInput = z.infer<typeof CreateSupplierPaymentSchema>;
