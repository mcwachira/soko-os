import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Check, Store, ShoppingCart, Utensils, HeartPulse, Truck, Package, Building2, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { solutions } from '@/config/solutions';
import { products, productById } from '@/config/products';
import { countries } from '@/config/countries';
import DemoForm from '@/components/marketing/demo-form';

const iconMap: Record<string, any> = {
  Store,
  ShoppingCart,
  Utensils,
  HeartPulse,
  Truck,
  Package,
  Building2,
};

const solutionWorkflows: Record<string, Array<{ step: string; title: string; desc: string }>> = {
  retail: [
    { step: '01', title: 'Set up your store', desc: 'Configure your business profile and register your first device.' },
    { step: '02', title: 'Add products and prices', desc: 'Import or manually add your catalog with categories and barcodes.' },
    { step: '03', title: 'Process first sale', desc: 'Open Soko POS, scan or search products, and complete checkout.' },
    { step: '04', title: 'Track inventory and customers', desc: 'Monitor stock levels, set low-stock alerts, and view purchase history.' },
  ],
  supermarkets: [
    { step: '01', title: 'Configure departments', desc: 'Set up departments like groceries, produce, and household.' },
    { step: '02', title: 'Set up multiple registers', desc: 'Configure cashier stations and assign roles and permissions.' },
    { step: '03', title: 'Train your team', desc: 'Onboard cashiers and managers with role-specific access.' },
    { step: '04', title: 'Launch with promotions', desc: 'Set up bulk price updates, discounts, and queue management.' },
  ],
  restaurants: [
    { step: '01', title: 'Design your floor plan', desc: 'Create tables, sections, and floor layouts in Soko POS.' },
    { step: '02', title: 'Add menu with modifiers', desc: 'Build your menu with sizes, toppings, and variants.' },
    { step: '03', title: 'Train front-of-house', desc: 'Onboard servers on table management and order taking.' },
    { step: '04', title: 'Connect kitchen displays', desc: 'Set up kitchen display integration for seamless order flow.' },
  ],
  pharmacies: [
    { step: '01', title: 'Add your drug catalog', desc: 'Import medicines with batch numbers and expiry dates.' },
    { step: '02', title: 'Set expiry tracking', desc: 'Configure alerts for drugs approaching expiry.' },
    { step: '03', title: 'Configure prescription workflows', desc: 'Set up prescription tracking and customer medication history.' },
    { step: '04', title: 'Enable compliance reports', desc: 'Generate audit-ready compliance reports for regulators.' },
  ],
  wholesale: [
    { step: '01', title: 'Set up customer credit tiers', desc: 'Define credit limits and payment terms per customer.' },
    { step: '02', title: 'Configure bulk pricing', desc: 'Set tiered pricing based on order volume and customer type.' },
    { step: '03', title: 'Plan delivery routes', desc: 'Optimize delivery scheduling and assign sales reps.' },
    { step: '04', title: 'Generate customer statements', desc: 'Automate account statements and aging reports.' },
  ],
  distribution: [
    { step: '01', title: 'Add warehouses', desc: 'Configure source and destination warehouses in the system.' },
    { step: '02', title: 'Configure routes', desc: 'Set up delivery routes and assign drivers and vehicles.' },
    { step: '03', title: 'Track fleet', desc: 'Monitor vehicles in transit and capture real-time status.' },
    { step: '04', title: 'Capture proof of delivery', desc: 'Digitize POD with signatures, photos, and timestamps.' },
  ],
  'multi-branch': [
    { step: '01', title: 'Add branch locations', desc: 'Register each branch with local settings and currencies.' },
    { step: '02', title: 'Configure branch-specific pricing', desc: 'Set prices per branch or enforce centralized pricing.' },
    { step: '03', title: 'Set up role-based access', desc: 'Assign managers and staff with branch-level permissions.' },
    { step: '04', title: 'View consolidated reports', desc: 'Access unified dashboards comparing branch performance.' },
  ],
};

const solutionBenefits: Record<string, string[]> = {
  retail: [
    'Reduce checkout time by 40%',
    'Never lose a sale due to connectivity',
    'Know your true profitability',
    'Support for local payment methods',
    'Works on tablets and smartphones',
  ],
  supermarkets: [
    'Serve more customers during peak hours',
    'Reduce stockouts by 60%',
    'Automate reordering',
    'Spot trends before competitors',
    'Simplify tax season',
  ],
  restaurants: [
    'Reduce order-taking time by 50%',
    'Eliminate kitchen communication errors',
    'Accept any payment method',
    'Get paid faster with direct settlement',
    'Simplify tax season',
  ],
  pharmacies: [
    'Reduce stockouts by 60%',
    'Eliminate calculation errors',
    'Stay audit-ready 24/7',
    'Know your true profitability',
    'Track expiry dates for perishables',
  ],
  wholesale: [
    'Reduce credit collection time',
    'Automate bulk pricing',
    'Optimize delivery routes',
    'Know your true profitability',
    'Get paid faster with direct settlement',
  ],
  distribution: [
    'Track goods in real-time',
    'Reduce delivery errors',
    'Optimize routes and fuel costs',
    'Automate proof of delivery',
    'Connect to any system',
  ],
  'multi-branch': [
    'View all branches from one dashboard',
    'Reduce stock transfers errors',
    'Enforce consistent pricing',
    'Benchmark branch performance',
    'Scale without limits',
  ],
};

const solutionMockups: Record<string, React.ReactNode> = {
  retail: (
    <div className="bg-secondary-background border-2 border-black rounded-xl p-6 shadow">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm font-bold text-muted-foreground">Total</p>
          <p className="text-3xl font-black">KSh 4,250</p>
        </div>
        <div className="bg-success text-foreground px-3 py-1 rounded-full text-sm font-black border-2 border-black">PAID</div>
      </div>
      <div className="space-y-3">
        {['Soko Maize Flour 2kg x2', 'Soko Sugar 1kg x1', 'Soko Tea Leaves 400g x2'].map((item) => (
          <div key={item} className="flex items-center justify-between py-2 border-b-2 border-black last:border-0">
            <span className="font-bold text-sm">{item}</span>
            <span className="font-black text-sm">KSh 1,200</span>
          </div>
        ))}
      </div>
    </div>
  ),
  supermarkets: (
    <div className="bg-secondary-background border-2 border-black rounded-xl p-6 shadow">
      <div className="flex items-center gap-2 mb-6">
        <div className="h-3 w-3 rounded-full bg-destructive border-2 border-black"></div>
        <div className="h-3 w-3 rounded-full bg-warning border-2 border-black"></div>
        <div className="h-3 w-3 rounded-full bg-success border-2 border-black"></div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {['Groceries', 'Produce', 'Household'].map((dept) => (
          <div key={dept} className="bg-muted border-2 border-black rounded-lg p-3 text-center">
            <p className="font-black text-xs">{dept}</p>
            <p className="text-lg font-black mt-1">{Math.floor(Math.random() * 50 + 10)}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-8 bg-warning border-2 border-black rounded-lg flex-1"></div>
        <div className="h-8 bg-info border-2 border-black rounded-lg flex-1"></div>
      </div>
    </div>
  ),
  restaurants: (
    <div className="bg-secondary-background border-2 border-black rounded-xl p-6 shadow">
      <div className="flex items-center justify-between mb-4">
        <p className="font-black">Table 12</p>
        <span className="bg-info text-foreground px-2 py-1 rounded-full text-xs font-black border-2 border-black">ACTIVE</span>
      </div>
      <div className="space-y-2">
        {['Nyama Choma x2', 'Sukuma Wiki x1', 'Chapati x2'].map((item) => (
          <div key={item} className="flex items-center justify-between py-2 border-b-2 border-black last:border-0">
            <span className="font-bold text-sm">{item}</span>
            <span className="font-black text-sm">KSh 850</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-8 bg-warning border-2 border-black rounded-lg flex-1"></div>
        <div className="h-8 bg-info border-2 border-black rounded-lg flex-1"></div>
      </div>
    </div>
  ),
  pharmacies: (
    <div className="bg-secondary-background border-2 border-black rounded-xl p-6 shadow">
      <div className="flex items-center justify-between mb-4">
        <p className="font-black">Prescription #4521</p>
        <span className="bg-warning text-foreground px-2 py-1 rounded-full text-xs font-black border-2 border-black">PENDING</span>
      </div>
      <div className="space-y-2">
        {['Amoxicillin 500mg x30', 'Paracetamol 1g x20', 'Vitamin C x14'].map((item) => (
          <div key={item} className="flex items-center justify-between py-2 border-b-2 border-black last:border-0">
            <span className="font-bold text-sm">{item}</span>
            <span className="font-black text-sm">KSh 1,500</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-8 bg-warning border-2 border-black rounded-lg flex-1"></div>
        <div className="h-8 bg-info border-2 border-black rounded-lg flex-1"></div>
      </div>
    </div>
  ),
  wholesale: (
    <div className="bg-secondary-background border-2 border-black rounded-xl p-6 shadow">
      <div className="flex items-center justify-between mb-4">
        <p className="font-black">Bulk Order #789</p>
        <span className="bg-success text-foreground px-3 py-1 rounded-full text-sm font-black border-2 border-black">CREDIT</span>
      </div>
      <div className="space-y-2">
        {['Rice 25kg x50', 'Sugar 2kg x100', 'Cooking Oil 5L x30'].map((item) => (
          <div key={item} className="flex items-center justify-between py-2 border-b-2 border-black last:border-0">
            <span className="font-bold text-sm">{item}</span>
            <span className="font-black text-sm">KSh 45,000</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-8 bg-warning border-2 border-black rounded-lg flex-1"></div>
        <div className="h-8 bg-info border-2 border-black rounded-lg flex-1"></div>
      </div>
    </div>
  ),
  distribution: (
    <div className="bg-secondary-background border-2 border-black rounded-xl p-6 shadow">
      <div className="flex items-center justify-between mb-4">
        <p className="font-black">Route NBI-KE-01</p>
        <span className="bg-info text-foreground px-2 py-1 rounded-full text-xs font-black border-2 border-black">IN TRANSIT</span>
      </div>
      <div className="space-y-2">
        {[
          { from: 'Warehouse A', to: 'Retail Outlet 1', status: 'Delivered' },
          { from: 'Warehouse A', to: 'Retail Outlet 2', status: 'In Transit' },
        ].map((stop) => (
          <div key={stop.to} className="flex items-center justify-between py-2 border-b-2 border-black last:border-0">
            <div>
              <p className="font-bold text-sm">{stop.from} → {stop.to}</p>
            </div>
            <span className="text-xs font-black">{stop.status}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-8 bg-warning border-2 border-black rounded-lg flex-1"></div>
        <div className="h-8 bg-info border-2 border-black rounded-lg flex-1"></div>
      </div>
    </div>
  ),
  'multi-branch': (
    <div className="bg-secondary-background border-2 border-black rounded-xl p-6 shadow">
      <div className="flex items-center justify-between mb-4">
        <p className="font-black">Branch Dashboard</p>
        <span className="bg-info text-foreground px-2 py-1 rounded-full text-xs font-black border-2 border-black">LIVE</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {['Nairobi', 'Mombasa', 'Kisumu'].map((branch) => (
          <div key={branch} className="bg-muted border-2 border-black rounded-lg p-3 text-center">
            <p className="font-black text-xs">{branch}</p>
            <p className="text-lg font-black mt-1">KSh {Math.floor(Math.random() * 500 + 100)}k</p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-8 bg-warning border-2 border-black rounded-lg flex-1"></div>
        <div className="h-8 bg-info border-2 border-black rounded-lg flex-1"></div>
      </div>
    </div>
  ),
};

const relevantProductIds: Record<string, string[]> = {
  retail: ['pos', 'inventory', 'books', 'pay', 'tax'],
  supermarkets: ['pos', 'inventory', 'analytics', 'books', 'pay', 'tax'],
  restaurants: ['pos', 'pay', 'tax', 'books'],
  pharmacies: ['pos', 'inventory', 'tax', 'books'],
  wholesale: ['pos', 'inventory', 'analytics', 'books', 'pay', 'tax'],
  distribution: ['inventory', 'analytics', 'connect'],
  'multi-branch': ['pos', 'inventory', 'analytics', 'connect'],
};

export async function generateStaticParams() {
  return solutions.map((solution) => ({
    id: solution.id,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const solution = solutions.find((s) => s.id === id);
  if (!solution) {
    return {
      title: 'Solution Not Found | Soko-OS',
    };
  }
  return {
    title: `${solution.name} | Soko-OS`,
    description: solution.description,
  };
}

export default async function SolutionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const solution = solutions.find((s) => s.id === id);

  if (!solution) {
    notFound();
  }

  const Icon = iconMap[solution.icon] || Store;
  const workflow = solutionWorkflows[solution.id] || [];
  const benefits = solutionBenefits[solution.id] || [];
  const relevantIds = relevantProductIds[solution.id] || [];
  const relevantProducts = relevantIds.map((id) => productById(id)).filter(Boolean);
  const showOffline = ['retail', 'supermarkets', 'restaurants', 'pharmacies', 'wholesale', 'multi-branch'].includes(solution.id);
  const activeCountries = countries.filter((c) => !c.comingSoon);

  return (
    <div>
      {/* Hero */}
      <section className="border-b-4 border-black bg-warning">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-full text-sm font-bold mb-6 border-2 border-black">
                <Icon className="h-4 w-4" />
                {solution.name}
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
                {solution.name}
              </h1>
              <p className="mt-6 text-lg sm:text-xl font-bold text-foreground/80 max-w-2xl">
                {solution.description}
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link href="#demo">
                  <Button size="lg" className="w-full sm:w-auto shadow">
                    Request a Demo <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto shadow">
                    Explore Features
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              {solutionMockups[solution.id] || solutionMockups['retail']}
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="border-b-4 border-black bg-secondary-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-12">
            Common challenges for {solution.name.toLowerCase()}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {solution.painPoints.map((point) => (
              <div key={point} className="bg-muted border-2 border-black rounded-xl p-6 shadow">
                <p className="font-black text-lg">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="border-b-4 border-black bg-muted">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              The Soko-OS solution for {solution.name.toLowerCase()}
            </h2>
            <p className="mt-6 text-lg font-bold text-muted-foreground">
              {solution.description} Soko-OS is purpose-built for the unique challenges you face every day. From inventory management to customer relationships, we have got you covered.
            </p>
            <ul className="mt-8 space-y-4">
              {solution.features.slice(0, 4).map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-info border-2 border-black">
                    <Check className="h-4 w-4 text-foreground" />
                  </span>
                  <span className="font-bold">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section id="features" className="border-b-4 border-black bg-secondary-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-12">
            Key features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {solution.features.map((feature) => (
              <div key={feature} className="bg-muted border-2 border-black rounded-xl p-6 shadow">
                <p className="font-black">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-b-4 border-black bg-warning">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground mb-12">
            Benefits that move your business forward
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit) => (
              <div key={benefit} className="bg-secondary-background border-2 border-black rounded-xl p-6 shadow">
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success border-2 border-black shrink-0">
                    <Check className="h-4 w-4 text-foreground" />
                  </span>
                  <p className="font-black">{benefit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="border-b-4 border-black bg-secondary-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-12">
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {workflow.map((item) => (
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
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-12">
            Integrations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relevantProducts.map((product) => (
              <Link key={product!.id} href={`/products/${product!.id}`} className="group bg-secondary-background border-2 border-black rounded-xl p-6 shadow hover:shadow-[6px_6px_0px_0px_var(--border)] transition-all">
                <h3 className="text-xl font-black group-hover:underline">{product!.name}</h3>
                <p className="mt-2 font-bold text-muted-foreground">{product!.tagline}</p>
                <div className="mt-4 flex items-center gap-1 font-black text-sm group-hover:translate-x-1 transition-transform">
                  Learn more <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Offline Capability */}
      {showOffline && (
        <section className="border-b-4 border-black bg-secondary-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-full text-sm font-bold mb-6 border-2 border-black">
                <WifiOff className="h-4 w-4" />
                Offline-First
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                Sell anywhere. Sync automatically.
              </h2>
              <p className="mt-4 text-lg font-bold text-muted-foreground">
                Your business should not stop because your internet connection does. Soko-OS keeps selling, tracking inventory, and processing payments offline. When connectivity returns, everything syncs automatically.
              </p>
            </div>
            <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: '01', title: 'Online', desc: 'Process sales normally with full connectivity' },
                { step: '02', title: 'Offline', desc: 'Internet drops. Soko-OS keeps working locally' },
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
      )}

      {/* Country Support */}
      <section className="border-b-4 border-black bg-muted">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-12">
            Available in your region
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {activeCountries.map((country) => (
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

      {/* CTA */}
      <section id="demo" className="border-b-4 border-black bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Ready to transform your {solution.name.toLowerCase()}?
            </h2>
            <p className="mt-4 text-lg font-bold text-muted-foreground">
              See Soko-OS in action. Request a personalized demo for your business.
            </p>
            <div className="mt-10">
              <DemoForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
