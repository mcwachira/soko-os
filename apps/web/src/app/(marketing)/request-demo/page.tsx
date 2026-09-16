import { Metadata } from 'next';
import { Check } from 'lucide-react';
import DemoForm from '@/components/marketing/demo-form';

export const metadata = {
  title: 'Request a Demo',
  description: 'Request a personalized demo of Soko-OS and see how it can transform your business operations.',
};

const benefits = [
  'See Soko-OS tailored to your industry',
  'Understand offline-first workflows',
  'Explore tax and payment integrations',
  'Get answers from our product specialists',
];

export default function RequestDemoPage() {
  return (
    <div>
      <section className="border-b-4 border-black bg-warning">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground">
              Request a Demo
            </h1>
            <p className="mt-4 text-lg font-bold text-foreground/80 max-w-2xl">
              See Soko-OS in action. Fill out the form and our team will schedule a personalized demo for your business.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b-4 border-black bg-secondary-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <DemoForm />
            </div>
            <div className="bg-muted border-2 border-black rounded-xl p-6 shadow">
              <h2 className="text-2xl font-black mb-4">What to expect</h2>
              <ul className="space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-info border-2 border-black shrink-0">
                      <Check className="h-4 w-4 text-foreground" />
                    </span>
                    <span className="font-bold">{benefit}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-6 border-t-2 border-black">
                <p className="text-sm font-bold text-muted-foreground">
                  No commitment required. We will tailor the demo to your business needs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
