import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { solutions } from '@/config/solutions';
import DemoForm from '@/components/marketing/demo-form';

export const metadata = {
  title: 'Solutions | Soko-OS',
  description: 'Explore Soko-OS solutions for retail, supermarkets, restaurants, pharmacies, wholesale, distribution, and multi-branch businesses across Africa.',
};

export default function SolutionsPage() {
  return (
    <div>
      {/* Hero */}
      <section className="border-b-4 border-black bg-warning">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight text-foreground leading-[1.1]">
              Solutions for every African business
            </h1>
            <p className="mt-6 text-lg sm:text-xl font-bold text-foreground/80 max-w-2xl">
              From corner shops to multi-branch operations, Soko-OS adapts to your unique workflow. Explore our industry-specific solutions.
            </p>
            <div className="mt-10">
              <Link href="#solutions">
                <Button size="lg" className="shadow">
                  Explore Solutions <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section id="solutions" className="border-b-4 border-black bg-secondary-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {solutions.map((solution) => {
              const icons: Record<string, any> = {
                Store: () => (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M9 7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1H9z"/></svg>
                ),
                ShoppingCart: () => (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                ),
                Utensils: () => (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 2v20"/><path d="M18 12h.01"/></svg>
                ),
                HeartPulse: () => (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/></svg>
                ),
                Truck: () => (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
                ),
                Package: () => (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
                ),
                Building2: () => (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
                ),
              };
              const Icon = icons[solution.icon] || icons['Store'];
              return (
                <Link
                  key={solution.id}
                  href={`/solutions/${solution.id}`}
                  className="group bg-muted border-2 border-black rounded-xl p-6 shadow hover:shadow-[6px_6px_0px_0px_var(--border)] transition-all"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-warning border-2 border-black rounded-lg">
                      <Icon />
                    </div>
                    <h3 className="text-xl font-black">{solution.name}</h3>
                  </div>
                  <p className="font-bold text-muted-foreground mb-4">{solution.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {solution.features.slice(0, 3).map((feature) => (
                      <span key={feature} className="bg-info text-foreground px-2 py-1 rounded-full text-xs font-black border-2 border-black">
                        {feature}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 font-black text-sm group-hover:translate-x-1 transition-transform">
                    {solution.cta} <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-b-4 border-black bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Ready to transform your business?
            </h2>
            <p className="mt-4 text-lg font-bold text-muted-foreground">
              See Soko-OS in action. Request a personalized demo for your industry.
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
