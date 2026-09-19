'use client';

import AppLayout from '@/app/app/layout';
import { useSupplierPayments } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { SupplierPayment } from '@soko/domain-types';
import { fromMinorUnits } from '@soko/utils';

export default function SupplierPaymentsPage() {
  const [query, setQuery] = useState('');
  const { data, isLoading, isError, error } = useSupplierPayments();
  const payments = data?.data ?? [];

  const filtered = payments.filter((p: SupplierPayment) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      p.id.toLowerCase().includes(q) ||
      p.payment_method.toLowerCase().includes(q) ||
      p.status.toLowerCase().includes(q) ||
      p.currency.toLowerCase().includes(q)
    );
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Supplier Payments</h1>
            <p className="text-muted-foreground font-bold">
              Supplier payment execution
            </p>
          </div>
          <Button className="border-2 border-black">
            <Plus className="mr-2 h-4 w-4" /> New Payment
          </Button>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search payments..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="border-2 border-black pl-10"
                />
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
                <p className="text-sm font-bold text-destructive">Failed to load payments</p>
                <p className="text-xs text-muted-foreground">{error instanceof Error ? error.message : 'Unknown error'}</p>
              </div>
            )}

            {!isLoading && !isError && filtered.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No payments found</p>
                <p className="text-sm text-muted-foreground">
                  {query ? 'Try a different search term' : 'Create your first payment to get started'}
                </p>
              </div>
            )}

            {!isLoading && !isError && filtered.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th className="p-2 text-left font-bold">ID</th>
                      <th className="p-2 text-left font-bold">Method</th>
                      <th className="p-2 text-left font-bold">Amount</th>
                      <th className="p-2 text-left font-bold">Status</th>
                      <th className="p-2 text-left font-bold">Paid At</th>
                      <th className="p-2 text-left font-bold">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((payment: SupplierPayment) => (
                      <tr key={payment.id} className="border-b border-black hover:bg-muted/50">
                        <td className="p-2 font-mono text-xs">{payment.id.slice(0, 8)}</td>
                        <td className="p-2 capitalize">{payment.payment_method}</td>
                        <td className="p-2 font-mono">{fromMinorUnits(payment.amount_minor)}</td>
                        <td className="p-2">
                          <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'} className="border-2 border-black capitalize">
                            {payment.status}
                          </Badge>
                        </td>
                        <td className="p-2">
                          {payment.paid_at ? new Date(payment.paid_at).toLocaleDateString() : '-'}
                        </td>
                        <td className="p-2">{new Date(payment.created_at).toLocaleDateString()}</td>
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
