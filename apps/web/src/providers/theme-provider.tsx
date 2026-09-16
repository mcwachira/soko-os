'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'soko-theme',
}: {
  children: React.ReactNode;
  defaultTheme?: 'light' | 'dark' | 'system';
  storageKey?: string;
}) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      storageKey={storageKey}
    >
      {children}
    </NextThemesProvider>
  );
}
