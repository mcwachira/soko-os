'use client';

import AppLayout from '@/app/app/layout';
import { useSales, useCreateSale } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { format } from 'date-fns';
import { fromMinorUnits } from '@soko/utils';

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  completed: 'default',
  pending: 'secondary',
  cancelled: 'destructive',
  refunded: 'outline',
};

export default function SalesHistoryPage() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const params = new URLSearchParams();
  if (dateFrom) params.set('from_date', dateFrom);
  if (dateTo) params.set('to_date', dateTo);

  const { data, isLoading, isError } = useSales(params.toString() ? Object.fromEntries(params) : undefined);

  const sales = data?.data ?? [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Sales History</h1>
          <p className="text-muted-foreground font-bold">View all POS sales transactions</p>
        </div>

        <div className="flex gap-4">
          <div className="space-y-1">
            <label className="text-sm font-bold">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-lg border-2 border-black bg-background p-2"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-bold">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-lg border-2 border-black bg-background p-2"
            />
          </div>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>Sales ({sales.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="space-y-3">
                {Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full border-2 border-black" />
                ))}
              </div>
            )}

            {isError && (
              <div className="py-8 text-center">
                <p className="text-sm font-bold text-destructive">Failed to load sales</p>
              </div>
            )}

            {!isLoading && !isError && sales.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No sales found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
              </div>
            )}

            {!isLoading && !isError && sales.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th className="p-2 text-left font-bold">Receipt #</th>
                      <th className="p-2 text-left font-bold">Date</th>
                      <th className="p-2 text-left font-bold">Cashier</th>
                      <th className="p-2 text-left font-bold">Customer</th>
                      <th className="p-2 text-left font-bold">Total</th>
                      <th className="p-2 text-left font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((sale: { id: string; receipt_number: string; created_at: string; cashier?: { name?: string }; customer?: { name?: string }; grand_total_minor: number; status: string }) => (
                      <tr key={sale.id} className="border-b border-black hover:bg-muted/50">
                        <td className="p-2 font-mono text-sm">{sale.receipt_number}</td>
                        <td className="p-2">{format(new Date(sale.created_at), 'yyyy-MM-dd HH:mm')}</td>
                        <td className="p-2">{sale.cashier?.name || '-'}</td>
                        <td className="p-2">{sale.customer?.name || 'Walk-in'}</td>
                        <td className="p-2 font-bold">{fromMinorUnits(sale.grand_total_minor)}</td>
                        <td className="p-2">
                          <Badge variant={statusColors[sale.status] || 'secondary'} className="border-2 border-black">
                            {sale.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
