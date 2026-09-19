'use client';

import AppLayout from '@/app/app/layout';
import { useBills } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { formatMoney } from '@soko/utils';
import { Search, Filter } from 'lucide-react';
import { useState, useMemo } from 'react';

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  pending: 'outline',
  paid: 'default',
  overdue: 'destructive',
  cancelled: 'destructive',
  void: 'destructive',
};

export default function PayablesPage() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { data, isLoading, isError, error } = useBills();

  const filteredBills = useMemo(() => {
    const bills = data?.data ?? [];
    return bills.filter((bill) => {
      if (query) {
        const q = query.toLowerCase();
        if (
          !bill.bill_number.toLowerCase().includes(q) &&
          !bill.supplier_name.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      if (statusFilter !== 'all' && bill.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [data?.data, query, statusFilter]);

  const statuses = ['all', 'draft', 'pending', 'paid', 'overdue', 'cancelled', 'void'];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Payables</h1>
            <p className="text-muted-foreground font-bold">Track money you owe to suppliers</p>
          </div>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search bills by number or supplier..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="border-2 border-black pl-10"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full sm:w-48 rounded-base border-2 border-black bg-background p-2 pl-10 font-base appearance-none"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full border-2 border-black" />
                ))}
              </div>
            )}

            {isError && (
              <div className="py-8 text-center">
                <p className="text-sm font-bold text-destructive">Failed to load bills</p>
                <p className="text-xs text-muted-foreground">{error instanceof Error ? error.message : 'Unknown error'}</p>
              </div>
            )}

            {!isLoading && !isError && filteredBills.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No bills found</p>
                <p className="text-sm text-muted-foreground">
                  {query || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Create your first bill to get started'}
                </p>
              </div>
            )}

            {!isLoading && !isError && filteredBills.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th className="p-2 text-left font-bold">Bill #</th>
                      <th className="p-2 text-left font-bold">Supplier</th>
                      <th className="p-2 text-left font-bold">Issue Date</th>
                      <th className="p-2 text-left font-bold">Due Date</th>
                      <th className="p-2 text-left font-bold">Status</th>
                      <th className="p-2 text-right font-bold">Grand Total</th>
                      <th className="p-2 text-right font-bold">Balance</th>
                      <th className="p-2 text-right font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBills.map((bill) => (
                      <tr key={bill.id} className="border-b border-black hover:bg-muted/50">
                        <td className="p-2 font-mono font-bold">{bill.bill_number}</td>
                        <td className="p-2">{bill.supplier_name}</td>
                        <td className="p-2">{new Date(bill.bill_date).toLocaleDateString()}</td>
                        <td className="p-2">{new Date(bill.due_date).toLocaleDateString()}</td>
                        <td className="p-2">
                          <Badge variant={statusColors[bill.status] || 'secondary'} className="border-2 border-black capitalize">
                            {bill.status}
                          </Badge>
                        </td>
                        <td className="p-2 text-right font-mono">{formatMoney(bill.grand_total_minor)}</td>
                        <td className="p-2 text-right font-mono font-bold">{formatMoney(bill.balance_minor)}</td>
                        <td className="p-2 text-right">
                          <Button variant="outline" size="icon" asChild className="border-2 border-black">
                            <a href={`/bills/${bill.id}`}>
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </a>
                          </Button>
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
