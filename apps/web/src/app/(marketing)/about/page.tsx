import Link from 'next/link';
import { ArrowRight, Globe, WifiOff, CreditCard, Receipt, Building2, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { countries } from '@/config/countries';

export const metadata = {
  title: 'About | Soko-OS',
  description: 'About Soko-OS: the offline-first business operating system built for African businesses.',
};

export default function AboutPage() {
  return (
    <div>
      <section className="border-b-4 border-black bg-info">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground">
              About Soko-OS
            </h1>
            <p className="mt-6 text-lg sm:text-xl font-bold text-foreground/80 max-w-2xl">
              We are building the operating system for African businesses — offline-first, locally connected, and designed for how commerce actually works on the continent.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b-4 border-black bg-secondary-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Our Mission</h2>
              <p className="mt-6 text-lg font-bold text-muted-foreground">
                African businesses face unique challenges: unreliable connectivity, fragmented payment ecosystems, complex tax authorities, and multi-branch operations spread across cities and towns.
              </p>
              <p className="mt-4 text-lg font-bold text-muted-foreground">
                Soko-OS was built to solve these problems. We combine POS, inventory, payments, tax, accounting, and analytics into one platform that works offline and syncs when connected.
              </p>
              <p className="mt-4 text-lg font-bold text-muted-foreground">
                Our mission is to give every African business the tools to compete, grow, and thrive — regardless of where they are or how reliable their internet is.
              </p>
            </div>
            <div className="bg-muted border-2 border-black rounded-xl p-6 shadow">
              <div className="bg-secondary-background border-2 border-black rounded-lg p-4 shadow-[3px_3px_0px_0px_var(--border)]">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-black">Soko-OS Stats</h4>
                  <span className="bg-warning text-foreground px-2 py-1 rounded-full text-xs font-black border-2 border-black">Live</span>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Countries', value: countries.filter((c) => !c.comingSoon).length.toString() },
                    { label: 'Products', value: '7' },
                    { label: 'Uptime', value: '99.9%' },
                  ].map((row) => (
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

      <section className="border-b-4 border-black bg-muted">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-center">Built for the realities of African business.</h2>
          <p className="mt-4 text-lg font-bold text-muted-foreground text-center max-w-3xl mx-auto">
            From connectivity to compliance, we focus on what matters most.
          </p>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: WifiOff, title: 'Connectivity', desc: 'Offline-first architecture ensures your business never stops because the internet does.' },
              { icon: CreditCard, title: 'Payments', desc: 'Local payment methods including M-Pesa, cards, bank transfers, and cash.' },
              { icon: Receipt, title: 'Tax', desc: 'Country-aware tax workflows designed to support KRA, SARS, and FIRS requirements.' },
              { icon: Building2, title: 'Multi-Branch', desc: 'Manage stock, sales, and reports across multiple locations from one dashboard.' },
              { icon: Globe, title: 'Local Workflows', desc: 'Built for African businesses, not generic templates forced onto local realities.' },
              { icon: TrendingUp, title: 'Analytics', desc: 'Make decisions with real-time sales, inventory, and business health insights.' },
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

      <section className="border-b-4 border-black bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Ready to transform your business?</h2>
          <p className="mt-4 text-lg font-bold text-muted-foreground max-w-2xl mx-auto">
            Join hundreds of African businesses already using Soko-OS.
          </p>
          <div className="mt-10">
            <Link href="/request-demo">
              <Button size="lg" className="shadow">
                Request a Demo <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
