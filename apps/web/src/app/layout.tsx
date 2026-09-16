import './globals.css';
import { ThemeProvider } from '@/providers/theme-provider';
import { AuthProvider } from '@/hooks/useAuth';
import { QueryProvider } from '@/hooks/useTanStackQuery';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'Soko-OS | The Operating System for African Businesses',
    template: '%s | Soko-OS',
  },
  description: 'Soko-OS is an offline-first business operating system built for African businesses. Soko POS, inventory, payments, tax, and accounting that work anywhere.',
  keywords: ['POS', 'Africa', 'offline POS', 'retail', 'inventory', 'M-Pesa', 'KRA', 'SARS', 'Nigerian tax', 'Kenya POS', 'Nigeria POS', 'South Africa POS'],
  authors: [{ name: 'Soko-OS' }],
  openGraph: {
    type: 'website',
    locale: 'en_KE',
    url: '/',
    siteName: 'Soko-OS',
    title: 'Soko-OS | The Operating System for African Businesses',
    description: 'Offline-first business software built for African retailers, restaurants, pharmacies, and wholesalers.',
    images: [{ url: '/og.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Soko-OS | The Operating System for African Businesses',
    description: 'Offline-first business software built for African businesses.',
    images: ['/og.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased bg-background text-foreground">
        <ThemeProvider defaultTheme="system" storageKey="soko-theme">
          <QueryProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
