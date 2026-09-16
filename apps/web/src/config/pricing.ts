export const currencies = {
  KES: { symbol: 'KSh', locale: 'en-KE', rate: 1 },
  NGN: { symbol: '₦', locale: 'en-NG', rate: 0.0064 },
  ZAR: { symbol: 'R', locale: 'en-ZA', rate: 0.074 },
  USD: { symbol: '$', locale: 'en-US', rate: 0.0069 },
};

export type Currency = keyof typeof currencies;

export const formatPrice = (amountMinor: number, currency: Currency = 'KES') => {
  const c = currencies[currency];
  const amount = amountMinor / 100;
  return new Intl.NumberFormat(c.locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const convertPrice = (amountMinor: number, from: Currency, to: Currency) => {
  const fromRate = currencies[from].rate;
  const toRate = currencies[to].rate;
  return Math.round((amountMinor / fromRate) * toRate);
};

export const tiers = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'For small shops getting started',
    monthlyPriceMinor: 2900,
    annualPriceMinor: 2300,
    features: [
      '1 register',
      'Up to 100 products',
      'Basic reports',
      'Offline mode',
      'Email support',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    id: 'growth',
    name: 'Growth',
    description: 'For growing businesses',
    monthlyPriceMinor: 5900,
    annualPriceMinor: 4700,
    features: [
      '3 registers',
      'Up to 1,000 products',
      'Advanced analytics',
      'Inventory management',
      'Tax automation',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    id: 'business',
    name: 'Business',
    description: 'For established operations',
    monthlyPriceMinor: 12900,
    annualPriceMinor: 10300,
    features: [
      '10 registers',
      'Unlimited products',
      'Multi-branch sync',
      'Advanced integrations',
      'Custom reports',
      'Dedicated account manager',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations',
    monthlyPriceMinor: 0,
    annualPriceMinor: 0,
    features: [
      'Unlimited registers',
      'Unlimited branches',
      'Custom integrations',
      'SLA guarantee',
      'On-premise option',
      'Dedicated support team',
    ],
    cta: 'Talk to Sales',
    popular: false,
  },
];
