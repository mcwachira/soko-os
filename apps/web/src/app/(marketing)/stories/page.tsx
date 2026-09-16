import Link from 'next/link';
import { ArrowRight, Building2, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { countries } from '@/config/countries';

export const metadata = {
  title: 'Customer Stories | Soko-OS',
  description: 'Learn how African businesses use Soko-OS to grow.',
};

export default function CustomersPage() {
  const launchedCountries = countries.filter((c) => !c.comingSoon);

  return (
    <div>
      <section className="border-b-4 border-black bg-warning">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground">
              Our Customers
            </h1>
            <p className="mt-6 text-lg sm:text-xl font-bold text-foreground/80 max-w-2xl">
              From corner shops to multi-branch retailers, Soko-OS powers businesses across Africa.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b-4 border-black bg-secondary-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Customer Stories</h2>
            <p className="mt-4 text-lg font-bold text-muted-foreground">
              Detailed case studies coming soon. Here is a preview of the businesses we serve.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {launchedCountries.map((country) => (
              <div key={country.id} className="bg-muted border-2 border-black rounded-xl p-6 shadow">
                <span className="text-5xl mb-4 block">{country.flag}</span>
                <h3 className="text-2xl font-black">{country.name}</h3>
                <p className="mt-2 font-bold text-muted-foreground">Businesses across {country.name} are using Soko-OS to streamline operations.</p>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5" />
                    <span className="font-bold text-sm">Retail, wholesale, F&B</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5" />
                    <span className="font-bold text-sm">Single and multi-branch</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5" />
                    <span className="font-bold text-sm">Offline-first workflows</span>
                  </div>
                </div>
                <div className="mt-6">
                  <Link href={`/countries/${country.id}`}>
                    <Button variant="outline" className="w-full">View Soko-OS in {country.name}</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b-4 border-black bg-muted">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-secondary-background border-2 border-black rounded-xl p-8 shadow text-center">
            <h2 className="text-3xl font-black">Case Studies Coming Soon</h2>
            <p className="mt-4 text-lg font-bold text-muted-foreground max-w-2xl mx-auto">
              We are working with our customers to document their success stories. Sign up to be notified when new case studies are published.
            </p>
            <div className="mt-8">
              <Link href="/request-demo">
                <Button size="lg" className="shadow">
                  Request a Demo <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b-4 border-black bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Become a customer story.</h2>
          <p className="mt-4 text-lg font-bold text-muted-foreground max-w-2xl mx-auto">
            Join hundreds of businesses already using Soko-OS to grow.
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
