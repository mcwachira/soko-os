import { Metadata } from 'next';
import Link from 'next/link';
import { Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ContactForm from '@/components/marketing/contact-form';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the Soko-OS team for sales, support, or partnership inquiries.',
};

export default function ContactPage() {
  return (
    <div>
      <section className="border-b-4 border-black bg-warning">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground">
              Contact Us
            </h1>
            <p className="mt-4 text-lg font-bold text-foreground/80 max-w-2xl">
              Have a question or need help? Reach out and our team will get back to you within 24 hours.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b-4 border-black bg-secondary-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-black mb-6">Send us a message</h2>
              <ContactForm />
            </div>
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-black mb-6">Contact Info</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-info border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_var(--border)]">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-black text-sm">Email</p>
                      <p className="font-bold text-muted-foreground dark:text-muted-foreground">hello@soko-os.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-info border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_var(--border)]">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-black text-sm">Phone</p>
                      <p className="font-bold text-muted-foreground dark:text-muted-foreground">+254 700 000 000</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-info border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_var(--border)]">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-black text-sm">Address</p>
                      <p className="font-bold text-muted-foreground dark:text-muted-foreground">Nairobi, Kenya</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-warning border-2 border-black rounded-xl p-6 shadow">
                <h3 className="text-xl font-black text-foreground">Want to see Soko-OS in action?</h3>
                <p className="mt-2 font-bold text-foreground/80">
                  Schedule a personalized demo with our team to see how Soko-OS can work for your business.
                </p>
                <Link href="/request-demo">
                  <Button size="lg" className="mt-4 w-full sm:w-auto shadow">
                    Request a Demo <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
