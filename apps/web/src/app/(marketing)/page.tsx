import Link from 'next/link';
import { ArrowRight, Check, Wifi, WifiOff, RefreshCw, Shield, BarChart3, Package, CreditCard, Receipt, BookOpen, Globe, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { products } from '@/config/products';
import { solutions } from '@/config/solutions';
import { testimonials } from '@/config/testimonials';
import { countries } from '@/config/countries';
import PricingClient from '@/components/marketing/pricing-client';
import DemoForm from '@/components/marketing/demo-form';

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b-4 border-black bg-main">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-full text-sm font-bold mb-6 border-2 border-black">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-info opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-info"></span>
              </span>
              Now in Kenya, Nigeria & South Africa
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight text-foreground leading-[1.1]">
              Run your business <span className="bg-foreground text-background px-2">online or offline.</span> Built for Africa.
            </h1>
            <p className="mt-6 text-lg sm:text-xl font-bold text-foreground/80 max-w-2xl">
              Soko-OS is the offline-first business operating system for African retailers, restaurants, pharmacies, and wholesalers. POS, inventory, payments, tax, and accounting that work anywhere.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link href="/request-demo">
                <Button size="lg" className="w-full sm:w-auto shadow">
                  Request a Demo <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/products/pos">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto shadow">
                  Explore Soko POS
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 -z-10 opacity-10">
          <div className="absolute top-20 right-10 w-72 h-72 bg-black rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-40 w-96 h-96 bg-info rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Trust / Social proof */}
      <section className="border-b-4 border-black bg-secondary-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-center text-sm font-bold text-muted-foreground uppercase tracking-widest mb-8">Trusted by businesses across Africa</p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 opacity-60">
            {['Safaricom', 'Equity Bank', 'KCB', 'GTBank', 'Shoprite', 'Spar'].map((brand) => (
              <span key={brand} className="text-xl font-black text-foreground">{brand}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="border-b-4 border-black bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Your business should not stop because your internet connection does.
            </h2>
            <p className="mt-6 text-lg font-bold text-muted-foreground">
              In Africa, connectivity is unpredictable. Cloud-only POS systems fail when you need them most. Soko-OS is different.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: WifiOff, title: 'Cloud POS fails offline', desc: 'Most POS systems stop working the moment internet drops. Sales are lost.' },
              { icon: RefreshCw, title: 'Sync conflicts', desc: 'When connectivity returns, duplicated transactions and sync errors create chaos.' },
              { icon: Shield, title: 'Generic compliance', desc: 'Most tools ignore African tax authorities, payment methods, and business workflows.' },
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

      {/* Soko-OS Solution */}
      <section className="border-b-4 border-black bg-secondary-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                The operating system for African businesses.
              </h2>
              <p className="mt-6 text-lg font-bold text-muted-foreground">
                Soko-OS combines POS, inventory, payments, tax, accounting, and analytics into one offline-first platform. Built for the realities of African commerce.
              </p>
              <ul className="mt-8 space-y-4">
                {['Offline-first architecture', 'Local payment methods', 'Country-aware tax workflows', 'Multi-branch management', 'Real-time sync when connected'].map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-info border-2 border-black">
                      <Check className="h-4 w-4 text-foreground" />
                    </span>
                    <span className="font-bold">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link href="/products/pos">
                  <Button size="lg" className="shadow">
                    Explore Products <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="bg-muted border-2 border-black rounded-xl p-6 shadow">
              <div className="bg-secondary-background border-2 border-black rounded-lg p-4 shadow-[3px_3px_0px_0px_var(--border)]">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-3 w-3 rounded-full bg-destructive border-2 border-black"></div>
                  <div className="h-3 w-3 rounded-full bg-warning border-2 border-black"></div>
                  <div className="h-3 w-3 rounded-full bg-success border-2 border-black"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
                <div className="mt-6 flex gap-3">
                  <div className="h-10 bg-main border-2 border-black rounded-lg flex-1"></div>
                  <div className="h-10 bg-info border-2 border-black rounded-lg flex-1"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Soko POS */}
      <section className="border-b-4 border-black bg-info">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-secondary-background border-2 border-black rounded-xl p-6 shadow">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm font-bold text-muted-foreground">Total</p>
                    <p className="text-3xl font-black">KSh 12,450</p>
                  </div>
                  <div className="bg-success text-foreground px-3 py-1 rounded-full text-sm font-black border-2 border-black">PAID</div>
                </div>
                <div className="space-y-3">
                  {['Soko Maize Flour 2kg x3', 'Soko Sugar 1kg x2', 'Soko Cooking Oil 5L x1'].map((item) => (
                    <div key={item} className="flex items-center justify-between py-2 border-b-2 border-black last:border-0">
                      <span className="font-bold text-sm">{item}</span>
                      <span className="font-black text-sm">KSh 1,200</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                Soko POS
              </h2>
              <p className="mt-4 text-lg font-bold text-foreground/80">
                Fast, intuitive point of sale designed for African retail. Process sales, manage returns, and track performance even when offline.
              </p>
              <ul className="mt-6 space-y-3">
                {products[0].features.slice(0, 5).map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-foreground" />
                    <span className="font-bold text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link href="/products/pos">
                  <Button size="lg" className="shadow">
                    Explore Soko POS <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Offline-first */}
      <section className="border-b-4 border-black bg-secondary-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-full text-sm font-bold mb-6 border-2 border-black">
              <WifiOff className="h-4 w-4" />
              Offline-First
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Sell anywhere. Sync automatically.
            </h2>
            <p className="mt-4 text-lg font-bold text-muted-foreground">
              Your business should not stop because your internet connection does. Soko POS keeps selling, tracking inventory, and processing payments offline. When connectivity returns, everything syncs automatically.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Online', desc: 'Process sales normally with full connectivity' },
              { step: '02', title: 'Offline', desc: 'Internet drops. Soko POS keeps working locally' },
              { step: '03', title: 'Keep Selling', desc: 'Continue checkout, inventory, and receipts offline' },
              { step: '04', title: 'Auto Sync', desc: 'When internet returns, data syncs automatically' },
            ].map((item) => (
              <div key={item.step} className="relative bg-muted border-2 border-black rounded-xl p-6 shadow">
                <div className="text-4xl font-black text-foreground/10 absolute top-4 right-4">{item.step}</div>
                <h3 className="text-xl font-black">{item.title}</h3>
                <p className="mt-2 font-bold text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="border-b-4 border-black bg-muted">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Everything your business needs.
            </h2>
            <p className="mt-4 text-lg font-bold text-muted-foreground">
              From checkout to accounting, Soko-OS modules work together seamlessly.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div key={product.id} className="bg-secondary-background border-2 border-black rounded-xl p-6 shadow hover:shadow-[6px_6px_0px_0px_var(--border)] transition-all">
                <div className="flex items-center gap-3 mb-4">
                  {product.id === 'pos' && <ShoppingCart className="h-6 w-6" />}
                  {product.id === 'inventory' && <Package className="h-6 w-6" />}
                  {product.id === 'pay' && <CreditCard className="h-6 w-6" />}
                  {product.id === 'tax' && <Receipt className="h-6 w-6" />}
                  {product.id === 'books' && <BookOpen className="h-6 w-6" />}
                  {product.id === 'analytics' && <BarChart3 className="h-6 w-6" />}
                  {product.id === 'connect' && <Globe className="h-6 w-6" />}
                  <h3 className="text-xl font-black">{product.name}</h3>
                </div>
                <p className="font-bold text-muted-foreground mb-4">{product.tagline}</p>
                <ul className="space-y-2 mb-6">
                  {product.features.slice(0, 4).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm font-bold">
                      <Check className="h-4 w-4 mt-0.5 text-success" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={`/products/${product.id}`} className="inline-flex items-center font-bold text-sm hover:underline">
                  Learn more <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-b-4 border-black bg-main">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
              Built for how African businesses actually operate.
            </h2>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: WifiOff, title: 'Offline-first', desc: 'Keep selling during outages. Auto-sync when reconnected.' },
              { icon: CreditCard, title: 'Local payments', desc: 'M-Pesa, cards, cash, bank transfers. The way your customers pay.' },
              { icon: Shield, title: 'Tax-aware', desc: 'Country-specific VAT and compliance workflows built in.' },
              { icon: BarChart3, title: 'Accounting-ready', desc: 'Connect to Zoho, QuickBooks, Xero, and local tools.' },
            ].map((item) => (
              <div key={item.title} className="bg-secondary-background border-2 border-black rounded-xl p-6 shadow">
                <item.icon className="h-8 w-8 mb-4" />
                <h3 className="text-xl font-black">{item.title}</h3>
                <p className="mt-2 font-bold text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b-4 border-black bg-secondary-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Get started in minutes.
            </h2>
            <p className="mt-4 text-lg font-bold text-muted-foreground">
              From signup to first sale in four simple steps.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Create your business', desc: 'Sign up and configure your business profile in minutes.' },
              { step: '2', title: 'Add products', desc: 'Import or manually add your catalog with categories and pricing.' },
              { step: '3', title: 'Connect payments & tax', desc: 'Set up M-Pesa, cards, and country tax rules.' },
              { step: '4', title: 'Start selling', desc: 'Open Soko POS and process your first transaction.' },
            ].map((item) => (
              <div key={item.step} className="relative bg-muted border-2 border-black rounded-xl p-6 shadow">
                <div className="text-5xl font-black text-foreground/10 absolute top-4 right-4">{item.step}</div>
                <h3 className="text-xl font-black">{item.title}</h3>
                <p className="mt-2 font-bold text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Country support */}
      <section className="border-b-4 border-black bg-muted">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Launching across Africa.
            </h2>
            <p className="mt-4 text-lg font-bold text-muted-foreground">
              Starting in Kenya, Nigeria, and South Africa. More countries coming soon.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {countries.filter(c => !c.comingSoon).map((country) => (
              <div key={country.id} className="bg-secondary-background border-2 border-black rounded-xl p-6 shadow">
                <div className="text-4xl mb-4">{country.flag}</div>
                <h3 className="text-2xl font-black">{country.name}</h3>
                <p className="mt-2 font-bold text-muted-foreground">{country.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {country.paymentMethods.map((pm) => (
                    <span key={pm} className="bg-info text-foreground px-2 py-1 rounded-full text-xs font-black border-2 border-black">{pm}</span>
                  ))}
                </div>
                <Link href={`/countries/${country.id}`} className="mt-4 inline-flex items-center font-bold text-sm hover:underline">
                  See Soko-OS for {country.name} <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tax / Compliance */}
      <section className="border-b-4 border-black bg-secondary-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                Tax and compliance, simplified.
              </h2>
              <p className="mt-4 text-lg font-bold text-muted-foreground">
                Soko Tax is built with country-aware tax rules. From KRA eTIMS in Kenya to SARS VAT in South Africa, we help you stay compliant without the headache.
              </p>
              <ul className="mt-8 space-y-4">
                {['Automated VAT/Tax calculation', 'KRA eTIMS integration (Kenya)', 'SARS eFiling ready (South Africa)', 'Tax report generation', 'Audit trail and compliance logs'].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-info border-2 border-black">
                      <Check className="h-4 w-4 text-foreground" />
                    </span>
                    <span className="font-bold">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link href="/products/tax">
                  <Button size="lg" className="shadow">
                    Explore Soko Tax <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="bg-muted border-2 border-black rounded-xl p-6 shadow">
              <div className="bg-secondary-background border-2 border-black rounded-lg p-4 shadow-[3px_3px_0px_0px_var(--border)]">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-black">Tax Summary</h4>
                  <span className="bg-warning text-foreground px-2 py-1 rounded-full text-xs font-black border-2 border-black">KES</span>
                </div>
                <div className="space-y-3">
                  {[{ label: 'Total Sales', value: 'KSh 245,000' }, { label: 'VAT Collected', value: 'KSh 39,200' }, { label: 'Net Revenue', value: 'KSh 205,800' }].map((row) => (
                    <div key={row.label} className="flex items-center justify-between py-2 border-b-2 border-black last:border-0">
                      <span className="font-bold text-sm">{row.label}</span>
                      <span className="font-black text-sm">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Accounting integrations */}
      <section className="border-b-4 border-black bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Connects to the tools you already use.
            </h2>
            <p className="mt-4 text-lg font-bold text-muted-foreground">
              Soko Connect opens your books to the accounting platforms African businesses rely on.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
            {['Zoho Books', 'QuickBooks', 'Xero', 'Odoo', 'ERPNext', 'Sage', 'Microsoft Dynamics', 'Custom API'].map((integration) => (
              <div key={integration} className="bg-secondary-background border-2 border-border rounded-xl p-4 text-center shadow">
                <p className="font-black text-sm">{integration}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/products/connect">
              <Button variant="secondary" size="lg" className="shadow">
                Explore Soko Connect <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="border-b-4 border-black bg-secondary-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Built for every African business.
            </h2>
            <p className="mt-4 text-lg font-bold text-muted-foreground">
              From corner shops to multi-branch supermarkets, Soko-OS adapts to your workflow.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {solutions.map((solution) => (
              <div key={solution.id} className="bg-muted border-2 border-black rounded-xl p-6 shadow">
                <h3 className="text-xl font-black">{solution.name}</h3>
                <p className="mt-2 font-bold text-muted-foreground">{solution.description}</p>
                <Link href={`/solutions/${solution.id}`} className="mt-4 inline-flex items-center font-bold text-sm hover:underline">
                  Learn more <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-b-4 border-black bg-info">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
              Trusted by African businesses.
            </h2>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.filter(t => t.author !== '[PLACEHOLDER]').length > 0 ? (
              testimonials.filter(t => t.author !== '[PLACEHOLDER]').map((testimonial) => (
                <div key={testimonial.id} className="bg-secondary-background border-2 border-black rounded-xl p-6 shadow">
                  <p className="font-bold text-foreground">&ldquo;{testimonial.quote}&rdquo;</p>
                  <div className="mt-4">
                    <p className="font-black">{testimonial.author}</p>
                    <p className="text-sm font-bold text-muted-foreground">{testimonial.company} — {testimonial.location}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="md:col-span-3 text-center">
                <p className="font-bold text-foreground">Verified customer reviews coming soon.</p>
              </div>
            )}
          </div>
          <div className="mt-12 text-center">
            <Link href="/reviews">
              <Button variant="secondary" size="lg" className="shadow">
                Read All Reviews <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="border-b-4 border-black bg-secondary-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Simple, transparent pricing.
            </h2>
            <p className="mt-4 text-lg font-bold text-muted-foreground">
              Start free, scale when ready. No hidden fees.
            </p>
          </div>
          <div className="mt-16">
            <PricingClient />
          </div>
          <div className="mt-12 text-center">
            <Link href="/pricing">
              <Button size="lg" className="shadow">
                View All Plans <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b-4 border-black bg-muted">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Frequently asked questions.
            </h2>
          </div>
          <div className="mt-12 space-y-4">
            {[
              { q: 'Does Soko POS work offline?', a: 'Yes. Soko-OS is designed to work fully offline. Your data is stored locally and syncs automatically when you reconnect.' },
              { q: 'What payment methods are supported?', a: 'Soko Pay supports cash, cards, mobile money, and bank transfers. Local integrations vary by country.' },
              { q: 'Can I manage multiple branches?', a: 'Yes. Soko-OS supports multi-branch management with centralized reporting and inter-branch stock transfers.' },
              { q: 'Is my data secure?', a: 'Yes. All data is encrypted in transit and at rest. We use industry-standard security practices and regular backups.' },
            ].map((item) => (
              <div key={item.q} className="bg-secondary-background border-2 border-black rounded-xl p-6 shadow">
                <h3 className="font-black text-lg">{item.q}</h3>
                <p className="mt-2 font-bold text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/faq">
              <Button variant="secondary" size="lg" className="shadow">
                View All FAQs <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-b-4 border-black bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready to transform your business?
          </h2>
          <p className="mt-4 text-lg font-bold text-muted-foreground max-w-2xl mx-auto">
            Join hundreds of African businesses already using Soko-OS to sell, manage, and grow.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/request-demo">
              <Button size="lg" className="shadow">
                Request a Demo <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="secondary" size="lg" className="shadow">
                See Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
