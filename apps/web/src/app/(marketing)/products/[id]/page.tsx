import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Check, Wifi, WifiOff, Zap, AlertTriangle, Clock, Truck, RefreshCw, CreditCard, FileText, Receipt, FileX, Eye, Calendar, BarChart3, TrendingDown, Map, Plug, Copy, Lock, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { products, productById } from '@/config/products';
import { countries } from '@/config/countries';
import DemoForm from '@/components/marketing/demo-form';

export function generateStaticParams() {
  return products.map((product) => ({
    id: product.id,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = productById(id);
  if (!product) return {};
  return {
    title: `${product.name} | Soko-OS`,
    description: product.description,
  };
}

const productFaqs: Record<string, { q: string; a: string }[]> = {
  pos: [
    { q: 'Does Soko POS work offline?', a: 'Yes. Soko POS stores all transactions locally and syncs automatically when you reconnect. You will never lose a sale due to connectivity.' },
    { q: 'What payment methods does Soko POS support?', a: 'Cash, card, M-Pesa, and bank transfers. You can also configure split payments and store credits.' },
    { q: 'Can I use Soko POS on a tablet?', a: 'Yes. Soko POS is optimized for Android and iOS tablets, as well as desktop browsers.' },
    { q: 'Does Soko POS work with a receipt printer?', a: 'Yes. It supports thermal printers (58mm and 80mm) and A4 printers for full receipts.' },
  ],
  inventory: [
    { q: 'Can Soko Inventory track expiry dates?', a: 'Yes. You can set expiry dates on products and get alerts before items expire.' },
    { q: 'How do stock transfers work?', a: 'Stock transfers create a shipment record that moves inventory from one branch to another. Both branches see the transfer in real time.' },
    { q: 'Does Soko Inventory work offline?', a: 'Yes. Stock movements and scans are recorded locally and synced when you reconnect.' },
    { q: 'Can I set up low-stock alerts?', a: 'Yes. You can configure minimum stock levels for each product and get alerts when stock falls below the threshold.' },
  ],
  pay: [
    { q: 'Which countries does Soko Pay support?', a: 'Kenya (M-Pesa), Nigeria (bank transfer, POS card), and South Africa (card, EFT). More countries coming soon.' },
    { q: 'How long does settlement take?', a: 'M-Pesa settlements typically arrive within 24 hours. Card settlements depend on your provider, usually 2-3 business days.' },
    { q: 'Does Soko Pay support refunds?', a: 'Yes. You can issue full or partial refunds directly from the POS or the back office.' },
    { q: 'Are there hidden transaction fees?', a: 'No. We charge transparent transaction fees based on your plan. M-Pesa and card rates are clearly shown before you sign up.' },
  ],
  tax: [
    { q: 'Which tax authorities does Soko Tax support?', a: 'KRA eTIMS (Kenya), SARS eFiling (South Africa), and FIRS (Nigeria). More authorities are added regularly.' },
    { q: 'Does Soko Tax work offline?', a: 'Yes. Tax calculations and receipts are generated locally. When you reconnect, compliance reports are synced.' },
    { q: 'Can Soko Tax handle multiple tax rates?', a: 'Yes. You can configure multiple VAT rates, tax categories, and exempt products per country.' },
    { q: 'How do tax reports get filed?', a: 'Soko Tax generates the report and either submits it directly to the tax authority (where integration exists) or exports it for manual filing.' },
  ],
  books: [
    { q: 'Is Soko Books a full accounting system?', a: 'Yes. It provides double-entry bookkeeping with a chart of accounts, bank reconciliation, and financial statements.' },
    { q: 'Does Soko Books integrate with Soko POS?', a: 'Yes. Sales, payments, and expenses from Soko POS flow directly into Soko Books as journal entries.' },
    { q: 'Can I export financial statements?', a: 'Yes. You can export profit and loss statements, balance sheets, and trial balances to CSV or PDF.' },
    { q: 'Does Soko Books work offline?', a: 'Yes. All bookkeeping entries are recorded locally and synced automatically when you reconnect.' },
  ],
  analytics: [
    { q: 'Which products feed data into Soko Analytics?', a: 'Soko POS, Soko Inventory, and Soko Books all feed data into Soko Analytics automatically.' },
    { q: 'Does Soko Analytics work offline?', a: 'Offline, dashboards show the last synced data. When you reconnect, the latest data is aggregated and displayed.' },
    { q: 'Can I compare branch performance?', a: 'Yes. Soko Analytics provides branch-level dashboards so you can compare sales, inventory, and profitability across locations.' },
    { q: 'Can I export reports?', a: 'Yes. All reports can be exported to CSV or PDF for sharing with stakeholders or accountants.' },
  ],
  connect: [
    { q: 'What does the REST API cover?', a: 'The Soko-OS REST API covers products, sales, inventory, customers, invoices, and financial data.' },
    { q: 'Can I build custom integrations?', a: 'Yes. Soko Connect includes webhooks and REST APIs so you can build integrations with any external system.' },
    { q: 'Are there pre-built connectors?', a: 'Yes. We offer pre-built connectors for popular ERPs, accounting tools, and logistics platforms.' },
    { q: 'Does Soko Connect work offline?', a: 'Yes. Webhooks and local integrations queue offline and fire automatically when you reconnect.' },
  ],
};

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = productById(id);

  if (!product) {
    notFound();
  }

  const activeCountries = countries.filter((c) => !c.comingSoon);
  const productFaq = productFaqs[id] || [];

  return (
    <div>
      {/* Hero */}
      <section className="border-b-4 border-black bg-warning">
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
              <Link href={`/login?redirect=/dashboard&product=${id}`}>
                <Button size="lg" className="w-full sm:w-auto shadow">
                  Launch App <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#request-demo">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto shadow">
                  Request a Demo <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/solutions">
                <Button variant="outline" size="lg" className="w-full sm:w-auto shadow">
                  All Solutions
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
              {id === 'pos' && 'Your checkout should not stop when the internet does.'}
              {id === 'inventory' && 'Stockouts cost you money. You need better visibility.'}
              {id === 'pay' && 'Payments should not be this complicated.'}
              {id === 'tax' && 'Tax compliance should not require a team of accountants.'}
              {id === 'books' && 'Your books should tell you the truth about your business.'}
              {id === 'analytics' && 'You are running blind without the right data.'}
              {id === 'connect' && 'Your tools should talk to each other.'}
            </h2>
            <p className="mt-6 text-lg font-bold text-muted-foreground">
              {id === 'pos' && 'Most POS systems fail the moment connectivity drops. Sales are lost, queues build up, and customers leave. Soko POS is built different.'}
              {id === 'inventory' && 'Manual stock tracking leads to overstocking, stockouts, and expired products. Multi-branch visibility is nearly impossible without the right tools.'}
              {id === 'pay' && 'Customers pay in different ways, and reconciling them manually is slow and error-prone. Settlement delays hurt cash flow.'}
              {id === 'tax' && 'Tax rules change frequently and vary by country. Manual calculations lead to errors, penalties, and audit failures.'}
              {id === 'books' && 'Spreadsheets are fragile and time-consuming. Without proper bookkeeping, you cannot know your true profitability or simplify tax season.'}
              {id === 'analytics' && 'Data is scattered across your POS, inventory, and accounting tools. Without a unified view, you miss trends and opportunities.'}
              {id === 'connect' && 'Every tool you use speaks a different language. Manual data entry, CSV imports, and copy-paste workflows are unsustainable.'}
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {(id === 'pos' ? [
              { icon: WifiOff, title: 'Offline = no sales', desc: 'Cloud POS systems stop working when internet drops. Every minute of downtime is lost revenue.' },
              { icon: RefreshCw, title: 'Sync conflicts', desc: 'When connectivity returns, duplicated transactions create chaos and require hours of cleanup.' },
              { icon: Receipt, title: 'Fragile receipts', desc: 'Generic POS tools ignore local receipt formats, tax requirements, and payment methods.' },
            ] : id === 'inventory' ? [
              { icon: AlertTriangle, title: 'Unexpected stockouts', desc: 'Without real-time visibility, you run out of fast-moving items and lose sales.' },
              { icon: Clock, title: 'Expired stock', desc: 'Batch and expiry tracking is manual and error-prone, leading to waste and compliance risks.' },
              { icon: Truck, title: 'Chaotic transfers', desc: 'Moving stock between branches without proper tracking causes losses and audit failures.' },
            ] : id === 'pay' ? [
              { icon: CreditCard, title: 'Fragmented methods', desc: 'Customers want to pay with M-Pesa, card, cash, or bank transfer. Managing them separately is slow.' },
              { icon: Clock, title: 'Slow settlement', desc: 'Waiting days or weeks for funds to reach your account hurts cash flow and planning.' },
              { icon: FileText, title: 'Manual reconciliation', desc: 'Matching payments to orders across systems is tedious and error-prone.' },
            ] : id === 'tax' ? [
              { icon: AlertTriangle, title: 'Calculation errors', desc: 'Manual tax calculations lead to underpayment, penalties, and audit failures.' },
              { icon: Clock, title: 'Missed deadlines', desc: 'Keeping track of filing deadlines across multiple tax authorities is stressful and risky.' },
              { icon: FileX, title: 'Missing audit trail', desc: 'Without proper logs, proving compliance during an audit is nearly impossible.' },
            ] : id === 'books' ? [
              { icon: FileText, title: 'Spreadsheet chaos', desc: 'Excel files are fragile, hard to audit, and impossible to scale as your business grows.' },
              { icon: Eye, title: 'No visibility', desc: 'Without proper bookkeeping, you cannot see your true profitability or cash position.' },
              { icon: Calendar, title: 'Tax season panic', desc: 'Untagged receipts and missing entries make tax season a scramble.' },
            ] : id === 'analytics' ? [
              { icon: BarChart3, title: 'Data silos', desc: 'Sales, inventory, and accounting data live in separate tools. Getting a unified view is manual work.' },
              { icon: TrendingDown, title: 'Missed trends', desc: 'Without real-time dashboards, you discover trends after competitors have already acted.' },
              { icon: Map, title: 'Branch blindness', desc: 'Without branch-level reporting, you cannot identify which locations are underperforming.' },
            ] : [
              { icon: Plug, title: 'Siloed systems', desc: 'Every tool uses different formats and APIs. Connecting them requires custom work and maintenance.' },
              { icon: Copy, title: 'Manual data entry', desc: 'Copy-pasting between systems is slow, error-prone, and impossible to scale.' },
              { icon: Lock, title: 'Vendor lock-in', desc: 'Proprietary integrations trap you with one provider and make switching impossible.' },
            ]).map((item) => (
              <div key={item.title} className="bg-muted border-2 border-black rounded-xl p-6 shadow">
                <item.icon className="h-8 w-8 text-destructive mb-4" />
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
                {id === 'pos' && 'Point of sale that works anywhere.'}
                {id === 'inventory' && 'Stock management that syncs automatically.'}
                {id === 'pay' && 'Accept payments the way your customers prefer.'}
                {id === 'tax' && 'Stay compliant without the headache.'}
                {id === 'books' && 'Accounting that actually makes sense.'}
                {id === 'analytics' && 'Turn your data into decisions.'}
                {id === 'connect' && 'Integrate everything into one system.'}
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
            </div>
            <div className="bg-secondary-background border-2 border-black rounded-xl p-6 shadow">
              {id === 'pos' && (
                <div className="bg-muted border-2 border-black rounded-lg p-4 shadow-[3px_3px_0px_0px_var(--border)]">
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
              )}
              {id === 'inventory' && (
                <div className="bg-muted border-2 border-black rounded-lg p-4 shadow-[3px_3px_0px_0px_var(--border)]">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-black">Stock Overview</h4>
                    <span className="bg-warning text-foreground px-2 py-1 rounded-full text-xs font-black border-2 border-black">12 Low</span>
                  </div>
                  <div className="space-y-3">
                    {['Maize Flour - 45 left', 'Sugar - 8 left', 'Cooking Oil - 120 left'].map((item) => (
                      <div key={item} className="flex items-center justify-between py-2 border-b-2 border-black last:border-0">
                        <span className="font-bold text-sm">{item}</span>
                        <span className="font-black text-sm">In Stock</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {id === 'pay' && (
                <div className="bg-muted border-2 border-black rounded-lg p-4 shadow-[3px_3px_0px_0px_var(--border)]">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-black">Settlement</h4>
                    <span className="bg-info text-foreground px-2 py-1 rounded-full text-xs font-black border-2 border-black">PENDING</span>
                  </div>
                  <div className="space-y-3">
                    {['M-Pesa - KSh 12,000', 'Card - KSh 8,500', 'Cash - KSh 3,200'].map((item) => (
                      <div key={item} className="flex items-center justify-between py-2 border-b-2 border-black last:border-0">
                        <span className="font-bold text-sm">{item}</span>
                        <span className="font-black text-sm">Settled</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {id === 'tax' && (
                <div className="bg-muted border-2 border-black rounded-lg p-4 shadow-[3px_3px_0px_0px_var(--border)]">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-black">Tax Summary</h4>
                    <span className="bg-warning text-foreground px-2 py-1 rounded-full text-xs font-black border-2 border-black">FINALIZED</span>
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
              )}
              {id === 'books' && (
                <div className="bg-muted border-2 border-black rounded-lg p-4 shadow-[3px_3px_0px_0px_var(--border)]">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-black">Financial Statements</h4>
                    <span className="bg-info text-foreground px-2 py-1 rounded-full text-xs font-black border-2 border-black">UPDATED</span>
                  </div>
                  <div className="space-y-3">
                    {['Revenue: KSh 450,000', 'Expenses: KSh 280,000', 'Net Profit: KSh 170,000'].map((item) => (
                      <div key={item} className="flex items-center justify-between py-2 border-b-2 border-black last:border-0">
                        <span className="font-bold text-sm">{item.split(':')[0]}</span>
                        <span className="font-black text-sm">{item.split(':')[1]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {id === 'analytics' && (
                <div className="bg-muted border-2 border-black rounded-lg p-4 shadow-[3px_3px_0px_0px_var(--border)]">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-black">Sales Dashboard</h4>
                    <span className="bg-success text-foreground px-2 py-1 rounded-full text-xs font-black border-2 border-black">LIVE</span>
                  </div>
                  <div className="space-y-3">
                    {['Today: KSh 12,400', 'This Week: KSh 87,200', 'Top Product: Maize Flour'].map((item) => (
                      <div key={item} className="flex items-center justify-between py-2 border-b-2 border-black last:border-0">
                        <span className="font-bold text-sm">{item.split(':')[0]}</span>
                        <span className="font-black text-sm">{item.includes(':') ? item.split(':')[1] : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {id === 'connect' && (
                <div className="bg-muted border-2 border-black rounded-lg p-4 shadow-[3px_3px_0px_0px_var(--border)]">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-black">API Status</h4>
                    <span className="bg-success text-foreground px-2 py-1 rounded-full text-xs font-black border-2 border-black">HEALTHY</span>
                  </div>
                  <div className="space-y-3">
                    {['REST API: Active', 'Webhooks: Active', 'Connectors: 3 active'].map((item) => (
                      <div key={item} className="flex items-center justify-between py-2 border-b-2 border-black last:border-0">
                        <span className="font-bold text-sm">{item.split(':')[0]}</span>
                        <span className="font-black text-sm">{item.split(':')[1]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
              Everything you need to run {product.name.toLowerCase()} effectively.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {product.features.map((feature) => (
              <div key={feature} className="bg-muted border-2 border-black rounded-xl p-6 shadow">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-info border-2 border-black">
                    <Zap className="h-4 w-4 text-foreground" />
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

      {/* Workflow */}
      <section className="border-b-4 border-black bg-secondary-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              How it works
            </h2>
            <p className="mt-4 text-lg font-bold text-muted-foreground">
              {id === 'pos' && 'From scan to receipt in seconds.'}
              {id === 'inventory' && 'From receiving stock to reorder alerts.'}
              {id === 'pay' && 'From payment to settlement in three steps.'}
              {id === 'tax' && 'From transaction to filed return.'}
              {id === 'books' && 'From transaction to financial statement.'}
              {id === 'analytics' && 'From raw data to actionable insights.'}
              {id === 'connect' && 'From API to production integration.'}
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {(id === 'pos' ? [
              { step: '01', title: 'Scan', desc: 'Scan barcode or search product. Add to cart in one tap.' },
              { step: '02', title: 'Pay', desc: 'Accept cash, card, M-Pesa, or split payment. Change calculated automatically.' },
              { step: '03', title: 'Receipt', desc: 'Print or SMS receipt. Stock updates automatically.' },
              { step: '04', title: 'Sync', desc: 'When online, sales sync to inventory, books, and analytics.' },
            ] : id === 'inventory' ? [
              { step: '01', title: 'Receive', desc: 'Scan or list incoming stock. Batch and expiry tracked automatically.' },
              { step: '02', title: 'Track', desc: 'Real-time stock levels across all branches. Low-stock alerts sent automatically.' },
              { step: '03', title: 'Transfer', desc: 'Move stock between branches with full audit trail.' },
              { step: '04', title: 'Reorder', desc: 'Auto-generated purchase orders based on stock thresholds.' },
            ] : id === 'pay' ? [
              { step: '01', title: 'Initiate', desc: 'Customer chooses payment method. All methods supported from one screen.' },
              { step: '02', title: 'Process', desc: 'Payment processed securely. Confirmation shown to customer.' },
              { step: '03', title: 'Reconcile', desc: 'Payment matched to order. No manual entry required.' },
              { step: '04', title: 'Settle', desc: 'Funds settled to your business account. Reports generated automatically.' },
            ] : id === 'tax' ? [
              { step: '01', title: 'Configure', desc: 'Set country tax rules, rates, and filing schedules.' },
              { step: '02', title: 'Calculate', desc: 'Tax calculated automatically on every sale. Exemptions and categories applied.' },
              { step: '03', title: 'Report', desc: 'Generate tax reports and compliance logs with one click.' },
              { step: '04', title: 'File', desc: 'Submit directly to KRA, SARS, or FIRS, or export for manual filing.' },
            ] : id === 'books' ? [
              { step: '01', title: 'Record', desc: 'Sales, expenses, and transfers create journal entries automatically.' },
              { step: '02', title: 'Reconcile', desc: 'Match bank transactions with invoices and receipts.' },
              { step: '03', title: 'Review', desc: 'Generate profit and loss, balance sheet, and trial balance.' },
              { step: '04', title: 'File', desc: 'Export statements for tax filing or share with your accountant.' },
            ] : id === 'analytics' ? [
              { step: '01', title: 'Collect', desc: 'Data flows automatically from POS, inventory, and books.' },
              { step: '02', title: 'Visualize', desc: 'Dashboards show sales trends, top products, and branch performance.' },
              { step: '03', title: 'Analyze', desc: 'Identify patterns, seasonality, and growth opportunities.' },
              { step: '04', title: 'Act', desc: 'Use insights to optimize stock, pricing, and marketing.' },
            ] : [
              { step: '01', title: 'Access', desc: 'Get API keys and explore interactive documentation.' },
              { step: '02', title: 'Connect', desc: 'Use REST endpoints or pre-built connectors for common tools.' },
              { step: '03', title: 'Listen', desc: 'Set up webhooks for real-time events like sales and inventory changes.' },
              { step: '04', title: 'Monitor', desc: 'Track integration health, errors, and usage in the dashboard.' },
            ]).map((item) => (
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
                    <Zap className="h-6 w-6 text-info" />
                    <h3 className="text-lg font-black">{integration}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Offline capability */}
      {product.offlineCapable && (
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
      )}

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
            {activeCountries.map((country) => (
              <div key={country.id} className="bg-muted border-2 border-black rounded-xl p-6 shadow">
                <div className="text-4xl mb-4">{country.flag}</div>
                <h3 className="text-2xl font-black">{country.name}</h3>
                <p className="mt-2 font-bold text-muted-foreground">{country.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {country.paymentMethods.map((pm) => (
                    <span key={pm} className="bg-info text-foreground px-2 py-1 rounded-full text-xs font-black border-2 border-black">{pm}</span>
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
      {productFaq.length > 0 && (
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
      )}

      {/* CTA */}
      <section id="request-demo" className="border-b-4 border-black bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Ready to transform your business?
            </h2>
            <p className="text-lg font-bold text-muted-foreground">
              Request a demo and see how {product.name} can work for you.
            </p>
            <div className="mt-10 max-w-xl mx-auto">
              <DemoForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}