import Link from 'next/link';
import { productLinks, solutionLinks, countryLinks, resourceLinks, companyLinks, legalLinks } from '@/config/navigation';

export function MarketingFooter() {
  return (
    <footer className="border-t-4 border-black bg-secondary-background dark:bg-background mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          <div>
            <h3 className="font-black text-sm mb-4">Products</h3>
            <ul className="space-y-2">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm font-bold text-muted-foreground dark:text-muted-foreground hover:text-foreground dark:hover:text-white">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-black text-sm mb-4">Solutions</h3>
            <ul className="space-y-2">
              {solutionLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm font-bold text-muted-foreground dark:text-muted-foreground hover:text-foreground dark:hover:text-white">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-black text-sm mb-4">Countries</h3>
            <ul className="space-y-2">
              {countryLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm font-bold text-muted-foreground dark:text-muted-foreground hover:text-foreground dark:hover:text-white">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-black text-sm mb-4">Resources</h3>
            <ul className="space-y-2">
              {resourceLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm font-bold text-muted-foreground dark:text-muted-foreground hover:text-foreground dark:hover:text-white">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-black text-sm mb-4">Company</h3>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm font-bold text-muted-foreground dark:text-muted-foreground hover:text-foreground dark:hover:text-white">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-black text-sm mb-4">Legal</h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm font-bold text-muted-foreground dark:text-muted-foreground hover:text-foreground dark:hover:text-white">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t-2 border-black flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm font-bold text-muted-foreground dark:text-muted-foreground">
            © 2026 Soko-OS. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-muted-foreground dark:text-muted-foreground hover:text-foreground dark:hover:text-white font-bold text-sm">Twitter</a>
            <a href="#" className="text-muted-foreground dark:text-muted-foreground hover:text-foreground dark:hover:text-white font-bold text-sm">LinkedIn</a>
            <a href="#" className="text-muted-foreground dark:text-muted-foreground hover:text-foreground dark:hover:text-white font-bold text-sm">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
