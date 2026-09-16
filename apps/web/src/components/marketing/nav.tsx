'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown } from 'lucide-react';
import { navigation, productLinks, solutionLinks, countryLinks, resourceLinks } from '@/config/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { cn } from '@/lib/utils';

export function MarketingNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b-4 border-black bg-secondary-background/80 dark:bg-background/80 backdrop-blur-md">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-black tracking-tight">Soko-OS</span>
            </Link>
            <div className="hidden lg:flex items-center gap-1">
              <div className="relative group">
                <button className="flex items-center gap-1 px-3 py-2 text-sm font-bold hover:bg-black/5 dark:hover:bg-white/5 rounded-lg">
                  Products <ChevronDown className="h-4 w-4" />
                </button>
                <div className="absolute top-full left-0 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all bg-secondary-background dark:bg-background border-2 border-black rounded-xl shadow p-2 z-50">
                  {productLinks.map((link) => (
                    <Link key={link.href} href={link.href} className="block px-3 py-2 text-sm font-bold hover:bg-black/5 dark:hover:bg-white/5 rounded-lg">
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="relative group">
                <button className="flex items-center gap-1 px-3 py-2 text-sm font-bold hover:bg-black/5 dark:hover:bg-white/5 rounded-lg">
                  Solutions <ChevronDown className="h-4 w-4" />
                </button>
                <div className="absolute top-full left-0 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all bg-secondary-background dark:bg-background border-2 border-black rounded-xl shadow p-2 z-50">
                  {solutionLinks.map((link) => (
                    <Link key={link.href} href={link.href} className="block px-3 py-2 text-sm font-bold hover:bg-black/5 dark:hover:bg-white/5 rounded-lg">
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="relative group">
                <button className="flex items-center gap-1 px-3 py-2 text-sm font-bold hover:bg-black/5 dark:hover:bg-white/5 rounded-lg">
                  Countries <ChevronDown className="h-4 w-4" />
                </button>
                <div className="absolute top-full left-0 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all bg-secondary-background dark:bg-background border-2 border-black rounded-xl shadow p-2 z-50">
                  {countryLinks.map((link) => (
                    <Link key={link.href} href={link.href} className="block px-3 py-2 text-sm font-bold hover:bg-black/5 dark:hover:bg-white/5 rounded-lg">
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>
              <Link href="/pricing" className="px-3 py-2 text-sm font-bold hover:bg-black/5 dark:hover:bg-white/5 rounded-lg">
                Pricing
              </Link>
              <div className="relative group">
                <button className="flex items-center gap-1 px-3 py-2 text-sm font-bold hover:bg-black/5 dark:hover:bg-white/5 rounded-lg">
                  Resources <ChevronDown className="h-4 w-4" />
                </button>
                <div className="absolute top-full left-0 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all bg-secondary-background dark:bg-background border-2 border-black rounded-xl shadow p-2 z-50">
                  {resourceLinks.map((link) => (
                    <Link key={link.href} href={link.href} className="block px-3 py-2 text-sm font-bold hover:bg-black/5 dark:hover:bg-white/5 rounded-lg">
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />
            <Link href="/customers">
              <Button variant="outline" size="sm">Customers</Button>
            </Link>
            <Link href="/request-demo">
              <Button size="sm">Request a Demo</Button>
            </Link>
          </div>
          <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 border-2 border-black rounded-lg">
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {isOpen && (
          <div className="lg:hidden border-t-2 border-black py-4 space-y-2">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} className="block px-3 py-2 text-sm font-bold hover:bg-black/5 dark:hover:bg-white/5 rounded-lg" onClick={() => setIsOpen(false)}>
                {item.name}
              </Link>
            ))}
            <div className="pt-2 flex flex-col gap-2">
              <Link href="/request-demo" onClick={() => setIsOpen(false)}>
                <Button className="w-full">Request a Demo</Button>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
