import Link from 'next/link';
import { ArrowRight, Check, Wifi, WifiOff, RefreshCw, Shield, BarChart3, Package, CreditCard, Receipt, BookOpen, Globe, TrendingUp, Users, DollarSign, Target, MapPin as MapPinIcon, TrendingDown, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { productById } from '@/config/products';
import { countries } from '@/config/countries';
import DemoForm from '@/components/marketing/demo-form';

const product = productById('analytics');

export default function InsightsMarketingPage() {
  const productFaq = [
    { q: 'What data sources does Soko Analytics use?', a: 'Soko Analytics pulls data from Soko POS, Soko Inventory, and Soko Books automatically. No manual data entry required.' },
    { q: 'Can I create custom dashboards?', a: 'Yes. Build custom dashboards with drag-and-drop widgets tailored to your KPIs.' },
    { q: 'Can I export reports?', a: 'Yes. Export any dashboard or report to PDF, CSV, or schedule automated email delivery.' },
    { q: 'Does Soko Analytics work offline?', a: 'Offline, dashboards show the last synced data. When you reconnect, the latest data is aggregated and displayed.' },
  ];

  const product = productById('analytics');

  if (!product) return null;

  return (
    <div>
      {/* Hero */}
      <section className="border-b-4 border-black bg-main">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
              {product.name}
            </h1>
            <p className="mt-4 text-xl sm:text-2xl font-bold text-foreground/80">
              {product.tagline}
            </p>
            <p className="mt-4 text-lg font-bold text-foreground/80 max-w-2xl">
              {product.description}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link href={`/login?redirect=/app/insights`}>
                <Button size="lg" className="w-full sm:w-auto shadow">
                  Launch App <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#request-demo">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto shadow">
                  Request a Demo <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/products">
                <Button variant="outline" size="lg" className="w-full sm:w-auto shadow">
                  All Solutions <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="border-b-4 border-black bg-secondary-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Data is scattered. Insights are missing.
            </h2>
            <p className="mt-6 text-lg font-bold text-muted-foreground">
              Sales in POS. Stock in Inventory. Money in Books. Connecting the dots manually means slow decisions and missed opportunities.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: BarChart3, title: 'Data silos', desc: 'Sales, inventory, and accounting data live in separate tools. Getting a unified view is manual work.' },
              { icon: TrendingDown, title: 'Missed trends', desc: 'Without real-time dashboards, you discover trends after competitors have already acted.' },
              { icon: MapPinIcon, title: 'Branch blindness', desc: 'Without branch-level reporting, you cannot identify which locations are underperforming.' },
            ].map((item) => (
              <div key={item.title} className="bg-muted border-2 border-black rounded-xl p-6 shadow">
                <item.icon className="h-8 w-8 text-main mb-4" />
                <h3 className="text-xl font-black">{item.title}</h3>
                <p className="mt-2 font-bold text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="border-b-4 border-black bg-info">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                Turn your data into decisions.
              </h2>
              <p className="mt-6 text-lg font-bold text-foreground/80">
                {product.description}
              </p>
              <ul className="mt-8 space-y-4">
                {product.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-warning border-2 border-black">
                      <Check className="h-4 w-4 text-foreground" />
                    </span>
                    <span className="font-bold text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link href="/login?redirect=/app/insights">
                  <Button size="lg" className="shadow">
                    Launch App <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="bg-secondary-background border-2 border-black rounded-xl p-6 shadow">
              <div className="bg-secondary-background border-2 border-black rounded-lg p-4 shadow-[3px_3px_0px_0px_var(--border)]">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-black">Sales Dashboard</h4>
                  <span className="bg-success text-foreground px-2 py-1 rounded-full text-xs font-black border-2 border-black">LIVE</span>
                </div>
                <div className="space-y-3">
                  {['Today: KSh 12,400', 'This Week: KSh 87,200', 'Top Product: Maize Flour'].map((item) => (
                    <div key={item} className="flex items-center justify-between py-2 border-b-2 border-black last:border-0">
                      <span className="font-bold text-sm">{item.split(':')[0]}</span>
                      <span className="font-black text-sm">{item.split(':')[1]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="border-b-4 border-black bg-secondary-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Key features
            </h2>
            <p className="mt-4 text-lg font-bold text-muted-foreground">
              Everything you need to analyze your business effectively.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {product.features.map((feature) => (
              <div key={feature} className="bg-muted border-2 border-black rounded-xl p-6 shadow">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-info border-2 border-black">
                    <TrendingUp className="h-4 w-4 text-foreground" />
                  </span>
                  <h3 className="text-lg font-black">{feature}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-b-4 border-black bg-muted">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Benefits
            </h2>
            <p className="mt-4 text-lg font-bold text-muted-foreground">
              Real results for real businesses.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {product.benefits.map((benefit) => (
              <div key={benefit} className="bg-secondary-background border-2 border-black rounded-xl p-6 shadow">
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-success border-2 border-black">
                    <Check className="h-4 w-4 text-foreground" />
                  </span>
                  <h3 className="text-lg font-black">{benefit}</h3>
                </div>
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
              How it works
            </h2>
            <p className="mt-4 text-lg font-bold text-muted-foreground">
              From raw data to actionable insights.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Collect', desc: 'Data flows automatically from POS, inventory, and books.' },
              { step: '02', title: 'Visualize', desc: 'Dashboards show sales trends, top products, and branch performance.' },
              { step: '03', title: 'Analyze', desc: 'Identify patterns, seasonality, and growth opportunities.' },
              { step: '04', title: 'Act', desc: 'Use insights to optimize stock, pricing, and marketing.' },
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

      {/* Integrations */}
      <section className="border-b-4 border-black bg-muted">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Integrations
            </h2>
            <p className="mt-4 text-lg font-bold text-muted-foreground">
              {product.name} works seamlessly with the rest of your Soko-OS stack.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {product.integrations.map((integration) => (
              <Link key={integration} href={integration === 'All Soko-OS products' ? '/products' : `/products/${integration.toLowerCase().replace('soko ', '')}`} className="block">
                <div className="bg-secondary-background border-2 border-black rounded-xl p-6 shadow hover:shadow-[6px_6px_0px_0px_var(--border)] transition-all">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-6 w-6 text-info" />
                    <h3 className="text-lg font-black">{integration}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Offline capability */}
      <section className="border-b-4 border-black bg-warning">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-full text-sm font-bold mb-6 border-2 border-black">
              <WifiOff className="h-4 w-4" />
              Offline-Ready
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
              Insights when you need them.
            </h2>
            <p className="mt-4 text-lg font-bold text-foreground/80">
              {product.name} caches dashboard data for offline viewing. When connectivity returns, fresh data syncs automatically.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: WifiOff, title: 'Cached dashboards', desc: 'View last synced data offline. No blank screens when connectivity drops.' },
              { icon: Save, title: 'Auto-save state', desc: 'Your dashboard preferences and filters persist locally.' },
              { icon: RefreshCw, title: 'Auto refresh', desc: 'When connectivity returns, dashboards refresh automatically with latest data.' },
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

      {/* Country support */}
      <section className="border-b-4 border-black bg-secondary-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Country support
            </h2>
            <p className="mt-4 text-lg font-bold text-muted-foreground">
              {product.name} is designed for the markets you operate in.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {countries.filter(c => !c.comingSoon).map((country) => (
              <div key={country.id} className="bg-muted border-2 border-black rounded-xl p-6 shadow">
                <div className="text-4xl mb-4">{country.flag}</div>
                <h3 className="text-2xl font-black">{country.name}</h3>
                <p className="mt-2 font-bold text-muted-foreground">{country.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {country.paymentMethods.map((pm) => (
                    <span key={pm} className="bg-main text-main-foreground px-2 py-1 rounded-full text-xs font-black border-2 border-black">{pm}</span>
                  ))}
                </div>
                <p className="mt-3 text-sm font-bold text-muted-foreground">
                  {country.taxName}: {country.taxRate}
                </p>
                <Link href={`/countries/${country.id}`} className="mt-4 inline-flex items-center font-bold text-sm hover:underline">
                  See Soko-OS for {country.name} <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b-4 border-black bg-muted">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Frequently asked questions
            </h2>
          </div>
          <div className="mt-12 space-y-4">
            {productFaq.map((item) => (
              <div key={item.q} className="bg-secondary-background border-2 border-black rounded-xl p-6 shadow">
                <h3 className="font-black text-lg">{item.q}</h3>
                <p className="mt-2 font-bold text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="request-demo" className="border-b-4 border-black bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready to unlock your business insights?
          </h2>
          <p className="text-lg font-bold text-muted-foreground max-w-2xl mx-auto">
            Request a demo and see how {product.name} can work for you.
          </p>
          <div className="mt-10 max-w-xl mx-auto">
            <DemoForm />
          </div>
        </div>
      </section>
    </div>
  );
}
