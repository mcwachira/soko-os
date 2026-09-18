import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { faqs } from '@/config/faq';

export const metadata = {
  title: 'Frequently Asked Questions',
  description: 'Find answers to common questions about Soko-OS, pricing, features, and technical support.',
};

export default function FAQPage() {
  return (
    <div>
      <section className="border-b-4 border-black bg-warning">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground">
              Frequently Asked Questions
            </h1>
            <p className="mt-4 text-lg font-bold text-foreground/80 max-w-2xl">
              Everything you need to know about Soko-OS. Can not find what you are looking for? Contact our team.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b-4 border-black bg-secondary-background">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="space-y-8">
            {faqs.map((group) => (
              <div key={group.category}>
                <h2 className="text-xl font-black mb-4">{group.category}</h2>
                <Accordion multiple={false} className="border-2 border-black rounded-xl shadow overflow-hidden">
                  {group.questions.map((item, idx) => (
                    <AccordionItem key={item.question} value={`${group.category}-${idx}`} className="border-b-2 border-black last:border-0">
                      <AccordionTrigger className="px-4 py-4 font-black text-left hover:bg-black/5 dark:hover:bg-white/5">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="px-4 font-bold text-muted-foreground dark:text-muted-foreground">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/contact">
              <Button variant="outline" size="lg" className="w-full shadow">
                Contact Us <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/request-demo">
              <Button size="lg" className="w-full shadow">
                Request a Demo <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
