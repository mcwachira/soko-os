import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { faqs } from '@/config/faq';
import PricingClient from '@/components/marketing/pricing-client';

export const metadata = {
  title: 'Pricing | Soko-OS',
  description: 'Simple, transparent pricing for African businesses. Plans from KES 2,900/month. 14-day free trial.',
};

export default function PricingPage() {
  const pricingFaqs = faqs.find((f) => f.category === 'Pricing & Plans')?.questions ?? [];

  return (
    <div>
      <section className="border-b-4 border-black bg-info">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground">
              Simple, transparent pricing
            </h1>
            <p className="mt-6 text-lg sm:text-xl font-bold text-foreground/80 max-w-2xl">
              Start free, scale when ready. No hidden fees, no long-term contracts. All plans include a 14-day free trial.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b-4 border-black bg-secondary-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <PricingClient />
          <div className="mt-12 text-center">
            <p className="text-sm font-bold text-muted-foreground">
              Enterprise plans include unlimited registers, branches, custom integrations, SLA guarantees, and on-premise options.
            </p>
            <div className="mt-4">
              <Link href="/request-demo">
                <Button variant="secondary" size="lg" className="shadow">
                  Talk to Sales <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b-4 border-black bg-muted">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Pricing FAQ</h2>
            <p className="mt-4 text-lg font-bold text-muted-foreground">Common questions about plans and billing.</p>
          </div>
          <div className="mt-12 space-y-4">
            {pricingFaqs.map((faq) => (
              <div key={faq.question} className="bg-secondary-background border-2 border-black rounded-xl p-6 shadow">
                <h3 className="font-black text-lg">{faq.question}</h3>
                <p className="mt-2 font-bold text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b-4 border-black bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Ready to get started?</h2>
          <p className="mt-4 text-lg font-bold text-muted-foreground max-w-2xl mx-auto">
            Try Soko-OS free for 14 days. No credit card required.
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
