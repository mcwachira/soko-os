import Link from 'next/link';
import { ArrowRight, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { countries } from '@/config/countries';

export const metadata = {
  title: 'Countries | Soko-OS',
  description: 'Soko-OS is available in Kenya, Nigeria, South Africa, and expanding across Africa.',
};

export default function CountriesPage() {
  const launching = countries.filter((c) => !c.comingSoon);
  const comingSoon = countries.filter((c) => c.comingSoon);

  return (
    <div>
      <section className="border-b-4 border-black bg-info">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-full text-sm font-bold mb-6 border-2 border-black">
              <Globe className="h-4 w-4" />
              Africa-first
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground">
              Soko-OS in Africa
            </h1>
            <p className="mt-6 text-lg sm:text-xl font-bold text-foreground/80 max-w-2xl">
              Built for the realities of African commerce. Launching in Kenya, Nigeria, and South Africa with more countries on the horizon.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b-4 border-black bg-secondary-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Launching Now</h2>
          <p className="mt-4 text-lg font-bold text-muted-foreground">Available today with local payment integrations and support.</p>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {launching.map((country) => (
              <Link key={country.id} href={`/countries/${country.id}`}>
                <Card className="h-full hover:shadow-[6px_6px_0px_0px_var(--border)] transition-all cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-5xl">{country.flag}</span>
                    <Badge variant="success">Live</Badge>
                  </div>
                  <h3 className="text-2xl font-black">{country.name}</h3>
                  <p className="mt-2 font-bold text-muted-foreground">{country.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {country.paymentMethods.map((pm) => (
                      <span key={pm} className="bg-info text-foreground px-2 py-1 rounded-full text-xs font-black border-2 border-black">{pm}</span>
                    ))}
                  </div>
                  <div className="mt-4 inline-flex items-center font-bold text-sm">
                    See Soko-OS for {country.name} <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {comingSoon.length > 0 && (
        <section className="border-b-4 border-black bg-muted">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Coming Soon</h2>
            <p className="mt-4 text-lg font-bold text-muted-foreground">We are expanding. Join the waitlist to be first in line.</p>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {comingSoon.map((country) => (
                <Card key={country.id} className="h-full opacity-80">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-5xl">{country.flag}</span>
                    <Badge variant="warning">Coming Soon</Badge>
                  </div>
                  <h3 className="text-2xl font-black">{country.name}</h3>
                  <p className="mt-2 font-bold text-muted-foreground">{country.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {country.paymentMethods.map((pm) => (
                      <span key={pm} className="bg-muted text-foreground px-2 py-1 rounded-full text-xs font-black border-2 border-black">{pm}</span>
                    ))}
                  </div>
                  <div className="mt-6">
                    <Link href="/request-demo">
                      <Button variant="outline" className="w-full">Join Waitlist</Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="border-b-4 border-black bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Ready to get started?</h2>
          <p className="mt-4 text-lg font-bold text-muted-foreground max-w-2xl mx-auto">
            Request a demo and see how Soko-OS works in your country.
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
