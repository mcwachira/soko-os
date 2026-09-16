import Link from 'next/link';
import { ArrowRight, Check, Wifi, WifiOff, RefreshCw, Shield, BarChart3, Package, CreditCard, Receipt, BookOpen, Globe, ShoppingCart, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { productById } from '@/config/products';
import { products } from '@/config/products';
import DemoForm from '@/components/marketing/demo-form';
import { countries } from '@/config/countries';

const product = productById('pos');

export default function PosMarketingPage() {
  const productFaq = [
    { q: 'Does Soko POS work offline?', a: 'Yes. Soko POS stores all transactions locally and syncs automatically when you reconnect. You will never lose a sale due to connectivity.' },
    { q: 'What payment methods does Soko POS support?', a: 'Cash, card, M-Pesa, and bank transfers. You can also configure split payments and store credits.' },
    { q: 'Can I use Soko POS on a tablet?', a: 'Yes. Soko POS is optimized for Android and iOS tablets, as well as desktop browsers.' },
    { q: 'Does Soko POS work with a receipt printer?', a: 'Yes. It supports thermal printers (58mm and 80mm) and A4 printers for full receipts.' },
  ];

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
              <Link href={`/login?redirect=/app/pos`}>
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
              Your checkout should not stop when the internet does.
            </h2>
            <p className="mt-6 text-lg font-bold text-muted-foreground">
              Most POS systems fail the moment connectivity drops. Sales are lost, queues build up, and customers leave. Soko POS is built different.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: WifiOff, title: 'Cloud POS fails offline', desc: 'Cloud POS systems stop working when internet drops. Sales are lost.' },
              { icon: RefreshCw, title: 'Sync conflicts', desc: 'When connectivity returns, duplicated transactions create chaos and require hours of cleanup.' },
              { icon: Shield, title: 'Generic compliance', desc: 'Most tools ignore African tax authorities, payment methods, and business workflows.' },
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
                Point of sale that works anywhere.
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
                <Link href="/login?redirect=/app/pos">
                  <Button size="lg" className="shadow">
                    Launch App <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="bg-secondary-background border-2 border-black rounded-xl p-6 shadow">
              <div className="bg-secondary-background border-2 border-black rounded-lg p-4 shadow-[3px_3px_0px_0px_var(--border)]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-bold text-muted-foreground">Total</p>
                    <p className="text-3xl font-black">KSh 4,200</p>
                  </div>
                  <div className="bg-success text-foreground px-3 py-1 rounded-full text-sm font-black border-2 border-black">PAID</div>
                </div>
                <div className="space-y-3">
                  {['Maize Flour 2kg x2', 'Sugar 1kg x1', 'Cooking Oil 5L x1'].map((item) => (
                    <div key={item} className="flex items-center justify-between py-2 border-b-2 border-black last:border-0">
                      <span className="font-bold text-sm">{item}</span>
                      <span className="font-black text-sm">KSh 1,400</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Offline capability */}
      <section className="border-b-4 border-black bg-warning">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-full text-sm font-bold mb-6 border-2 border-black">
              <WifiOff className="h-4 w-4" />
              Offline-First
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
              Work without limits.
            </h2>
            <p className="mt-4 text-lg font-bold text-foreground/80">
              {product.name} is designed to work fully offline. Your data is stored locally on your device and syncs automatically when you reconnect to the internet. Never miss a sale or lose data due to connectivity.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: WifiOff, title: 'Offline mode', desc: 'All core features work without internet. Data stored locally using IndexedDB.' },
              { icon: Save, title: 'Auto-save', desc: 'Every action is saved immediately. No data loss even if the app closes.' },
              { icon: RefreshCw, title: 'Auto sync', desc: 'When connectivity returns, data syncs automatically to the cloud and across branches.' },
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
            Ready to transform your business?
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
