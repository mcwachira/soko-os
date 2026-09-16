import { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, HelpCircle, Shield, Star } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Resources',
  description: 'Explore Soko-OS resources including blog articles, FAQs, compliance guides, and customer reviews.',
};

const resources = [
  { name: 'Blog', href: '/blog', description: 'Insights, updates, and stories from the Soko-OS team.', icon: BookOpen },
  { name: 'FAQ', href: '/faq', description: 'Answers to common questions about Soko-OS.', icon: HelpCircle },
  { name: 'Compliance', href: '/compliance', description: 'Tax, regulatory, and security information.', icon: Shield },
  { name: 'Reviews', href: '/reviews', description: 'See what African businesses say about Soko-OS.', icon: Star },
];

export default function ResourcesPage() {
  return (
    <div>
      <section className="border-b-4 border-black bg-warning">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground">
              Resources
            </h1>
            <p className="mt-4 text-lg font-bold text-foreground/80 max-w-2xl">
              Learn more about Soko-OS, get support, and stay up to date with the latest news.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b-4 border-black bg-secondary-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {resources.map((resource) => (
              <Link key={resource.href} href={resource.href} className="group">
                <div className="bg-muted border-2 border-black rounded-xl p-6 shadow h-full transition-all group-hover:shadow-[6px_6px_0px_0px_var(--border)]">
                  <div className="p-2 bg-info border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_var(--border)] w-fit mb-4">
                    <resource.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-black">{resource.name}</h3>
                  <p className="mt-2 font-bold text-muted-foreground text-sm">{resource.description}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-16 bg-warning border-2 border-black rounded-xl p-6 shadow">
            <h2 className="text-xl font-black text-foreground">Coming Soon</h2>
            <p className="mt-2 font-bold text-foreground/80">
              We are adding more resources including case studies, implementation guides, and video tutorials. Stay tuned.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
