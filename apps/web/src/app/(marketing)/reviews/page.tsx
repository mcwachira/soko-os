import Link from 'next/link';
import { ArrowRight, Quote, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { testimonials } from '@/config/testimonials';

export const metadata = {
  title: 'Reviews | Soko-OS',
  description: 'Customer reviews and testimonials for Soko-OS.',
};

export default function ReviewsPage() {
  const hasReal = testimonials.some((t) => t.author !== '[PLACEHOLDER]');

  return (
    <div>
      <section className="border-b-4 border-black bg-info">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground">
              Customer Reviews
            </h1>
            <p className="mt-6 text-lg sm:text-xl font-bold text-foreground/80 max-w-2xl">
              Hear from businesses across Africa using Soko-OS to transform their operations.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b-4 border-black bg-secondary-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          {hasReal ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="bg-muted border-2 border-black rounded-xl p-6 shadow">
                  <Quote className="h-8 w-8 mb-4 text-info" />
                  <p className="font-bold text-foreground">&ldquo;{testimonial.quote}&rdquo;</p>
                  <div className="mt-4">
                    <p className="font-black">{testimonial.author}</p>
                    <p className="text-sm font-bold text-muted-foreground">{testimonial.company} — {testimonial.location}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-muted border-2 border-black rounded-xl p-8 shadow">
                <div className="flex justify-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-6 w-6 text-warning fill-warning" />
                  ))}
                </div>
                <h2 className="text-2xl font-black">Verified customer reviews coming soon.</h2>
                <p className="mt-4 font-bold text-muted-foreground">
                  We are collecting verified reviews from businesses using Soko-OS across Africa. Check back soon to read real experiences from real customers.
                </p>
                <div className="mt-8">
                  <Link href="/request-demo">
                    <Button size="lg" className="shadow">
                      Be the First to Review <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
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
