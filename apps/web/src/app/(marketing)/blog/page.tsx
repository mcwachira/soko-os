import { Metadata } from 'next';
import { PenLine } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Read the latest articles, updates, and insights from the Soko-OS team.',
};

export default function BlogPage() {
  return (
    <div>
      <section className="border-b-4 border-black bg-warning">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground">
              Blog
            </h1>
            <p className="mt-4 text-lg font-bold text-foreground/80 max-w-2xl">
              Insights, updates, and stories about building business software for Africa.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b-4 border-black bg-secondary-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-muted border-2 border-black rounded-xl p-6 shadow">
                <div className="w-10 h-10 bg-info border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_var(--border)] flex items-center justify-center mb-4">
                  <PenLine className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold text-muted-foreground mb-2">Coming Soon</p>
                <h3 className="text-lg font-black">Article Title Placeholder</h3>
                <p className="mt-2 font-bold text-muted-foreground text-sm">
                  This is a placeholder for a future blog article about Soko-OS and African business technology.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
