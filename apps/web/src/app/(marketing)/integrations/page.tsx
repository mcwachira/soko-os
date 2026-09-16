import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Integrations',
  description: 'Explore Soko-OS integrations for payments, tax, accounting, commerce, and communication tools.',
};

type Integration = {
  name: string;
  category: string;
  status: 'Available' | 'Coming Soon' | 'Country-specific' | 'Requires Configuration';
  country?: string;
};

const integrations: Integration[] = [
  { name: 'M-Pesa', category: 'Payments', status: 'Available', country: 'Kenya' },
  { name: 'Card Processing', category: 'Payments', status: 'Available' },
  { name: 'Bank Transfer', category: 'Payments', status: 'Available' },
  { name: 'KRA eTIMS', category: 'Tax', status: 'Available', country: 'Kenya' },
  { name: 'SARS eFiling', category: 'Tax', status: 'Available', country: 'South Africa' },
  { name: 'FIRS Integration', category: 'Tax', status: 'Country-specific', country: 'Nigeria' },
  { name: 'Zoho Books', category: 'Accounting', status: 'Available' },
  { name: 'QuickBooks', category: 'Accounting', status: 'Available' },
  { name: 'Xero', category: 'Accounting', status: 'Available' },
  { name: 'Odoo', category: 'Accounting', status: 'Requires Configuration' },
  { name: 'ERPNext', category: 'Accounting', status: 'Requires Configuration' },
  { name: 'Sage', category: 'Accounting', status: 'Coming Soon' },
  { name: 'Shopify', category: 'Commerce', status: 'Coming Soon' },
  { name: 'WooCommerce', category: 'Commerce', status: 'Coming Soon' },
  { name: 'Custom E-Commerce', category: 'Commerce', status: 'Requires Configuration' },
  { name: 'Email (SMTP)', category: 'Communication', status: 'Available' },
  { name: 'SMS', category: 'Communication', status: 'Coming Soon' },
  { name: 'WhatsApp', category: 'Communication', status: 'Coming Soon' },
];

const statusVariant: Record<string, 'success' | 'warning' | 'destructive' | 'info'> = {
  Available: 'success',
  'Coming Soon': 'warning',
  'Country-specific': 'info',
  'Requires Configuration': 'destructive',
};

const categories = ['Payments', 'Tax', 'Accounting', 'Commerce', 'Communication'];

export default function IntegrationsPage() {
  return (
    <div>
      <section className="border-b-4 border-black bg-warning">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground">
              Integrations
            </h1>
            <p className="mt-4 text-lg font-bold text-foreground/80 max-w-2xl">
              Connect Soko-OS to the tools your business already uses. Payments, tax, accounting, and more.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b-4 border-black bg-secondary-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          {categories.map((category) => {
            const items = integrations.filter((i) => i.category === category);
            return (
              <div key={category} className="mb-12 last:mb-0">
                <h2 className="text-2xl font-black mb-4">{category}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((item) => (
                    <div key={item.name} className="bg-muted border-2 border-black rounded-xl p-4 shadow flex items-center justify-between">
                      <span className="font-black text-sm">{item.name}</span>
                      <div className="flex items-center gap-2">
                        {item.country && <span className="text-xs font-bold text-muted-foreground">{item.country}</span>}
                        <Badge variant={statusVariant[item.status]}>{item.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <div className="mt-12">
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
