'use client';

import AppLayout from '@/app/app/layout';
import { useDashboard } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatMoney } from '@soko/utils';

export default function DashboardPage() {
  const { data, isLoading, isError, error } = useDashboard();
  const stats = data?.data;

  const formatCurrency = (value: number) => {
    if (value >= 1_000_000) {
      return `KES ${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1_000) {
      return `KES ${(value / 1_000).toFixed(1)}K`;
    }
    return `KES ${value}`;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground font-bold">
            Welcome to Soko-OS. Here&apos;s what&apos;s happening with your business.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border-2 border-black">
                <CardHeader>
                  <Skeleton className="h-4 w-24 border-2 border-black" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-32 border-2 border-black" />
                </CardContent>
              </Card>
            ))
          ) : (
            [
              { title: 'Total Sales', value: formatCurrency(Number(stats?.total_sales ?? 0)) },
              { title: 'Revenue', value: formatCurrency(Number(stats?.total_revenue ?? 0)) },
              { title: 'Customers', value: String(Number(stats?.total_customers ?? 0)) },
              { title: 'Products', value: String(Number(stats?.total_products ?? 0)) },
            ].map((stat) => (
              <Card key={stat.title} className="border-2 border-black">
                <CardHeader>
                  <CardTitle className="text-sm font-bold text-muted-foreground">{stat.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-black">{stat.value}</div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4 border-2 border-black">
            <CardHeader>
              <CardTitle className="text-lg font-black">Outstanding Balances</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-32 w-full border-2 border-black" />
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-bold">Outstanding Invoices</span>
                    <span className="font-black">{formatCurrency(Number(stats?.outstanding_invoices ?? 0))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold">Outstanding Bills</span>
                    <span className="font-black">{formatCurrency(Number(stats?.outstanding_bills ?? 0))}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="col-span-3 border-2 border-black">
            <CardHeader>
              <CardTitle className="text-lg font-black">Recent Sales</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-32 w-full border-2 border-black" />
              ) : (
                <div className="space-y-2">
                  {(stats?.recent_sales as Array<Record<string, unknown>> ?? []).slice(0, 5).map((sale) => (
                    <div key={sale.id as string} className="flex justify-between text-sm">
                      <span className="font-bold">{sale.receipt_number as string}</span>
                      <span className="font-black">{formatCurrency(Number(sale.grand_total_minor ?? 0))}</span>
                    </div>
                  ))}
                  {(stats?.recent_sales as unknown[] | undefined)?.length === 0 && (
                    <div className="text-sm font-bold text-muted-foreground">No recent sales</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
