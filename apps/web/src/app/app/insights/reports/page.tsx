'use client';

import AppLayout from '@/app/app/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileText, BarChart3, TrendingUp, Calculator, PieChart } from 'lucide-react';

const reports = [
  {
    title: 'Trial Balance',
    description: 'Verify that debits equal credits across all accounts',
    href: '/reports/trial-balance',
    icon: Calculator,
  },
  {
    title: 'Profit & Loss',
    description: 'Income statement showing revenue, expenses, and net profit',
    href: '/reports/profit-loss',
    icon: TrendingUp,
  },
  {
    title: 'Balance Sheet',
    description: 'Financial position showing assets, liabilities, and equity',
    href: '/reports/balance-sheet',
    icon: PieChart,
  },
  {
    title: 'General Ledger',
    description: 'Detailed transaction history for all accounts',
    href: '/ledger',
    icon: FileText,
  },
  {
    title: 'Accounts Receivable Aging',
    description: 'Track outstanding customer invoices by aging buckets',
    href: '/receivables',
    icon: BarChart3,
  },
  {
    title: 'Accounts Payable Aging',
    description: 'Track outstanding supplier bills by aging buckets',
    href: '/payables',
    icon: BarChart3,
  },
];

export default function ReportsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Reports</h1>
          <p className="text-muted-foreground font-bold">
            Generate and view business reports
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <Card key={report.title} className="border-2 border-black hover:shadow-[4px_4px_0px_0px_rgb(0,0,0)] transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <report.icon className="h-6 w-6 text-main" />
                  <CardTitle className="text-lg">{report.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
                <Button asChild className="w-full border-2 border-black shadow">
                  <Link href={report.href}>View Report</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
