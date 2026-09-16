import Link from 'next/link';
import { ArrowRight, Check, DollarSign, CreditCard, Receipt, ShoppingCart, Globe, Zap, Users, Building2, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { countries } from '@/config/countries';
import { tiers, formatPrice, Currency } from '@/config/pricing';
import { products } from '@/config/products';
import DemoForm from '@/components/marketing/demo-form';
import { cn } from '@/lib/utils';

export const dynamicParams = false;

export function generateStaticParams() {
  return countries.filter((c) => !c.comingSoon).map((c) => ({ id: c.id }));
}

const countryCompliance: Record<string, { authority: string; note: string; features: string[] }> = {
  kenya: {
    authority: 'KRA',
    note: 'Soko-OS is designed to support KRA eTIMS workflows, including tax invoice generation and VAT tracking.',
    features: [
      'KRA eTIMS-ready invoice formatting',
      'Automated VAT calculation at 16%',
      'Transaction logs for audit readiness',
      'Electronic signature support where applicable',
    ],
  },
  nigeria: {
    authority: 'Nigeria Revenue Service',
    note: 'Soko-OS provides VAT calculation and reporting workflows to support compliance with Nigeria Revenue Service requirements.',
    features: [
      'Automated VAT calculation at 7.5%',
      'Invoice management and reporting',
      'Audit trail and transaction history',
      'Compliance-ready documentation',
    ],
  },
  'south-africa': {
    authority: 'SARS',
    note: 'Soko-OS is designed to support SARS VAT workflows, including tax invoice requirements and VAT reporting.',
    features: [
      'SARS VAT-ready tax invoices',
      'Automated VAT calculation at 15%',
      'VAT201 submission support',
      'Audit-ready transaction records',
    ],
  },
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const country = countries.find((c) => c.id === id);
  if (!country) return { title: 'Country | Soko-OS' };
  return {
    title: `Soko-OS in ${country.name}`,
    description: country.description,
  };
}

export default async function CountryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const country = countries.find((c) => c.id === id);
  if (!country) return null;

  const compliance = countryCompliance[country.id];
  const localeCurrencies: Record<string, Currency> = {
    kenya: 'KES',
    nigeria: 'NGN',
    'south-africa': 'ZAR',
  };
  const displayCurrency = localeCurrencies[country.id] || 'KES';
  const starterPrice = formatPrice(tiers[0].annualPriceMinor, displayCurrency);
  const growthPrice = formatPrice(tiers[1].annualPriceMinor, displayCurrency);

  return (
    <div>
      <section className="border-b-4 border-black bg-warning">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="max-w-3xl">
            <span className="text-6xl mb-6 block">{country.flag}</span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground">
              Soko-OS in {country.name}
            </h1>
            <p className="mt-6 text-lg sm:text-xl font-bold text-foreground/80 max-w-2xl">{country.description}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="bg-foreground text-background px-3 py-1.5 rounded-full text-sm font-black border-2 border-black">Currency: {country.currency}</span>
              <span className="bg-foreground text-background px-3 py-1.5 rounded-full text-sm font-black border-2 border-black">Tax: {country.taxName}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b-4 border-black bg-secondary-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-info px-4 py-2 rounded-full text-sm font-bold mb-6 border-2 border-black">
                <DollarSign className="h-4 w-4" />
                Local Currency
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Pay and get paid in {country.currency}</h2>
              <p className="mt-4 text-lg font-bold text-muted-foreground">
                Soko-OS is fully localized for {country.name}. All pricing, reports, and receipts are generated in {country.currency}, making it easy to run your business without currency conversions.
              </p>
              <ul className="mt-8 space-y-4">
                <li className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-info border-2 border-black">
                    <Check className="h-4 w-4 text-foreground" />
                  </span>
                  <span className="font-bold">Native {country.currency} pricing and receipts</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-info border-2 border-black">
                    <Check className="h-4 w-4 text-foreground" />
                  </span>
                  <span className="font-bold">Locale-aware formatting ({country.locale})</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-info border-2 border-black">
                    <Check className="h-4 w-4 text-foreground" />
                  </span>
                  <span className="font-bold">Consolidated multi-currency reporting</span>
                </li>
              </ul>
            </div>
            <div className="bg-muted border-2 border-black rounded-xl p-6 shadow">
              <div className="bg-secondary-background border-2 border-black rounded-lg p-4 shadow-[3px_3px_0px_0px_var(--border)]">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-black">Receipt Preview</h4>
                  <span className="bg-success text-foreground px-2 py-1 rounded-full text-xs font-black border-2 border-black">PAID</span>
                </div>
                <div className="space-y-2">
                  {['Soko Maize Flour 2kg x3', 'Soko Sugar 1kg x2', 'Soko Cooking Oil 5L x1'].map((item) => (
                    <div key={item} className="flex items-center justify-between py-2 border-b-2 border-black last:border-0">
                      <span className="font-bold text-sm">{item}</span>
                      <span className="font-black text-sm">{country.currency} 1,200</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t-2 border-black flex items-center justify-between">
                  <span className="font-black">Total</span>
                  <span className="font-black text-lg">{country.currency} 5,800</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b-4 border-black bg-muted">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-secondary-background border-2 border-black rounded-xl p-6 shadow">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="h-6 w-6" />
                  <h4 className="font-black text-lg">Payment Methods</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {country.paymentMethods.map((pm) => (
                    <span key={pm} className="bg-info text-foreground px-3 py-1.5 rounded-full text-sm font-black border-2 border-black">{pm}</span>
                  ))}
                </div>
                <div className="mt-6 space-y-3">
                  {country.paymentMethods.map((pm) => (
                    <div key={pm} className="flex items-center gap-3 p-3 border-2 border-black rounded-lg bg-muted">
                      <Zap className="h-5 w-5" />
                      <span className="font-bold">{pm} support in {country.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 bg-info px-4 py-2 rounded-full text-sm font-bold mb-6 border-2 border-black">
                <CreditCard className="h-4 w-4" />
                Payment Ecosystem
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Local payment methods your customers already use.</h2>
              <p className="mt-4 text-lg font-bold text-muted-foreground">
                {country.paymentMethods.join(', ')} — Soko-OS supports the payment methods that matter in {country.name}. Process transactions fast, reconcile automatically, and settle to your bank account.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b-4 border-black bg-secondary-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="inline-flex items-center gap-2 bg-warning px-4 py-2 rounded-full text-sm font-bold mb-6 border-2 border-black">
            <Receipt className="h-4 w-4" />
            Tax & Compliance
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">{country.taxName} Compliance</h2>
          <p className="mt-4 text-lg font-bold text-muted-foreground">{compliance.note}</p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-muted border-2 border-black rounded-xl p-6 shadow">
              <h3 className="text-xl font-black mb-4">{country.taxName} Capabilities</h3>
              <ul className="space-y-3">
                {compliance.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-info border-2 border-black mt-0.5">
                      <Check className="h-4 w-4 text-foreground" />
                    </span>
                    <span className="font-bold">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-muted border-2 border-black rounded-xl p-6 shadow">
              <h3 className="text-xl font-black mb-4">Why this matters</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-warning border-2 border-black mt-0.5">
                    <Check className="h-4 w-4 text-foreground" />
                  </span>
                  <span className="font-bold">Reduce manual tax preparation time</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-warning border-2 border-black mt-0.5">
                    <Check className="h-4 w-4 text-foreground" />
                  </span>
                  <span className="font-bold">Stay audit-ready with complete transaction logs</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-warning border-2 border-black mt-0.5">
                    <Check className="h-4 w-4 text-foreground" />
                  </span>
                  <span className="font-bold">Avoid penalties from incorrect filings</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-warning border-2 border-black mt-0.5">
                    <Check className="h-4 w-4 text-foreground" />
                  </span>
                  <span className="font-bold">Focus on running your business</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 bg-destructive text-white border-2 border-black rounded-xl p-6 shadow">
            <p className="font-bold text-sm">
              Tax rates and regulatory obligations may change. Soko-OS provides software capabilities to support compliance workflows; businesses remain responsible for their legal and tax obligations.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b-4 border-black bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Users, title: 'Retailers', desc: 'Manage inventory, process sales, and reconcile daily — even offline.' },
              { icon: Building2, title: 'Multi-Branch', desc: 'Sync stock and sales across locations with centralized reporting.' },
              { icon: WifiOff, title: 'Offline-First', desc: 'Keep selling during connectivity outages. Auto-sync when reconnected.' },
            ].map((item) => (
              <div key={item.title} className="bg-secondary-background border-2 border-border rounded-xl p-6 shadow">
                <item.icon className="h-8 w-8 text-info mb-4" />
                <h3 className="text-xl font-black">{item.title}</h3>
                <p className="mt-2 font-bold text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b-4 border-black bg-secondary-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="inline-flex items-center gap-2 bg-info px-4 py-2 rounded-full text-sm font-bold mb-6 border-2 border-black">
            <Globe className="h-4 w-4" />
            Soko-OS Capabilities
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Everything you need to run your business.</h2>
          <p className="mt-4 text-lg font-bold text-muted-foreground max-w-3xl">
            From POS to accounting, Soko-OS modules work together seamlessly. Built for the realities of African businesses.
          </p>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.slice(0, 6).map((product) => (
              <div key={product.id} className="bg-muted border-2 border-black rounded-xl p-6 shadow">
                <h3 className="text-xl font-black">{product.name}</h3>
                <p className="mt-2 font-bold text-muted-foreground">{product.tagline}</p>
                <ul className="mt-4 space-y-2">
                  {product.features.slice(0, 4).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm font-bold">
                      <Check className="h-4 w-4 mt-0.5 text-success" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b-4 border-black bg-muted">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="inline-flex items-center gap-2 bg-success px-4 py-2 rounded-full text-sm font-bold mb-6 border-2 border-black">
            <Zap className="h-4 w-4" />
            Local Integrations
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Works with the tools you already use.</h2>
          <p className="mt-4 text-lg font-bold text-muted-foreground max-w-3xl">
            Soko Connect opens your business to local payment providers, accounting platforms, and custom tools.
          </p>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
            {country.paymentMethods.concat(['Soko Books', 'Soko Analytics', 'Custom API']).map((integration) => (
              <div key={integration} className="bg-secondary-background border-2 border-black rounded-xl p-4 text-center shadow">
                <p className="font-black text-sm">{integration}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b-4 border-black bg-secondary-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="inline-flex items-center gap-2 bg-warning px-4 py-2 rounded-full text-sm font-bold mb-6 border-2 border-black">
            <ShoppingCart className="h-4 w-4" />
            Pricing Preview
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Simple, transparent pricing in {country.currency}.</h2>
          <p className="mt-4 text-lg font-bold text-muted-foreground">Start free, scale when ready. No hidden fees.</p>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
            {tiers.slice(0, 2).map((tier) => {
              const price = formatPrice(tier.annualPriceMinor, displayCurrency);
              return (
                <div key={tier.id} className={cn('bg-muted border-2 border-black rounded-xl p-6 shadow', tier.popular && 'ring-4 ring-warning')}>
                  {tier.popular && <div className="bg-warning text-foreground text-xs font-black px-3 py-1 rounded-full inline-block mb-4 border-2 border-black">MOST POPULAR</div>}
                  <h3 className="text-2xl font-black">{tier.name}</h3>
                  <p className="mt-2 text-sm font-bold text-muted-foreground">{tier.description}</p>
                  <div className="mt-4">
                    <span className="text-4xl font-black">{price}</span>
                    <span className="text-sm font-bold text-muted-foreground">/year</span>
                  </div>
                  <ul className="mt-6 space-y-2">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm font-bold">
                        <span className="text-success">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href="/request-demo">
                    <Button className="mt-6 w-full shadow">
                      Request Demo <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
          <div className="mt-8">
            <Link href="/pricing">
              <Button variant="secondary" className="shadow">
                View All Plans <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b-4 border-black bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <div className="inline-flex items-center gap-2 bg-info text-foreground px-4 py-2 rounded-full text-sm font-bold mb-6 border-2 border-black">
                <ArrowRight className="h-4 w-4" />
                Contact & Demo
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">See Soko-OS for {country.name}.</h2>
              <p className="mt-4 text-lg font-bold text-muted-foreground">
                Fill out the form and our local team will reach out within 24 hours to schedule a personalized demo.
              </p>
            </div>
            <div>
              <DemoForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
