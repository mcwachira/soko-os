'use client';

import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { tiers, formatPrice, Currency } from '@/config/pricing';

export default function PricingClient() {
  const [currency, setCurrency] = useState<Currency>('KES');
  const [annual, setAnnual] = useState(true);

  return (
    <>
      <div className="flex items-center justify-center gap-4 mb-8">
        <div className="flex bg-secondary-background border-2 border-black rounded-xl p-1 shadow">
          {(['KES', 'NGN', 'ZAR', 'USD'] as Currency[]).map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={cn('px-4 py-2 rounded-lg font-black text-sm transition-all', currency === c ? 'bg-info shadow-[2px_2px_0px_0px_var(--border)]' : 'hover:bg-black/5 dark:hover:bg-white/5')}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex bg-secondary-background border-2 border-black rounded-xl p-1 shadow">
          <button
            onClick={() => setAnnual(true)}
            className={cn('px-4 py-2 rounded-lg font-black text-sm transition-all', annual ? 'bg-info shadow-[2px_2px_0px_0px_var(--border)]' : 'hover:bg-black/5 dark:hover:bg-white/5')}
          >
            Annual
          </button>
          <button
            onClick={() => setAnnual(false)}
            className={cn('px-4 py-2 rounded-lg font-black text-sm transition-all', !annual ? 'bg-info shadow-[2px_2px_0px_0px_var(--border)]' : 'hover:bg-black/5 dark:hover:bg-white/5')}
          >
            Monthly
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tiers.map((tier) => {
          const priceMinor = annual ? tier.annualPriceMinor : tier.monthlyPriceMinor;
          return (
            <div key={tier.id} className={cn('bg-secondary-background dark:bg-background border-2 border-black rounded-xl p-6 shadow', tier.popular && 'ring-4 ring-warning')}>
              {tier.popular && <div className="bg-warning text-foreground text-xs font-black px-3 py-1 rounded-full inline-block mb-4 border-2 border-black">MOST POPULAR</div>}
              <h3 className="text-2xl font-black">{tier.name}</h3>
              <p className="mt-2 text-sm font-bold text-muted-foreground">{tier.description}</p>
              <div className="mt-4">
                <span className="text-4xl font-black">{formatPrice(priceMinor, currency)}</span>
                <span className="text-sm font-bold text-muted-foreground">/{annual ? 'year' : 'month'}</span>
              </div>
              <ul className="mt-6 space-y-2">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm font-bold">
                    <span className="text-success">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/request-demo" className={cn('mt-6 w-full inline-flex items-center justify-center font-bold border-2 border-black transition-all active:translate-x-0.5 active:translate-y-0.5 shadow disabled:opacity-50 disabled:pointer-events-none cursor-pointer bg-warning text-foreground hover:bg-warning/80 px-4 py-2 text-sm rounded-lg')}>
                Request Demo <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          );
        })}
      </div>
    </>
  );
}
