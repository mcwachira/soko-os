'use client';

import AppLayout from '@/app/app/layout';
import { usePaymentReconciliations } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { PaymentReconciliation } from '@soko/domain-types';
import { fromMinorUnits } from '@soko/utils';

export default function PaymentReconciliationsPage() {
  const [query, setQuery] = useState('');
  const { data, isLoading, isError, error } = usePaymentReconciliations();
  const reconciliations = data?.data ?? [];

  const filtered = reconciliations.filter((r: PaymentReconciliation) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      r.id.toLowerCase().includes(q) ||
      r.status.toLowerCase().includes(q) ||
      r.currency.toLowerCase().includes(q) ||
      r.provider_transaction_id?.toLowerCase().includes(q)
    );
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Payment Reconciliations</h1>
            <p className="text-muted-foreground font-bold">
              Payment reconciliation
            </p>
          </div>
          <Button className="border-2 border-black">
            <Plus className="mr-2 h-4 w-4" /> New Reconciliation
          </Button>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search reconciliations..."
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
                <p className="text-sm font-bold text-destructive">Failed to load reconciliations</p>
                <p className="text-xs text-muted-foreground">{error instanceof Error ? error.message : 'Unknown error'}</p>
              </div>
            )}

            {!isLoading && !isError && filtered.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No reconciliations found</p>
                <p className="text-sm text-muted-foreground">
                  {query ? 'Try a different search term' : 'Create your first reconciliation to get started'}
                </p>
              </div>
            )}

            {!isLoading && !isError && filtered.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th className="p-2 text-left font-bold">ID</th>
                      <th className="p-2 text-left font-bold">Amount</th>
                      <th className="p-2 text-left font-bold">Currency</th>
                      <th className="p-2 text-left font-bold">Provider TX ID</th>
                      <th className="p-2 text-left font-bold">Status</th>
                      <th className="p-2 text-left font-bold">Reconciled At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((rec: PaymentReconciliation) => (
                      <tr key={rec.id} className="border-b border-black hover:bg-muted/50">
                        <td className="p-2 font-mono text-xs">{rec.id.slice(0, 8)}</td>
                        <td className="p-2 font-mono">{fromMinorUnits(rec.amount_minor)}</td>
                        <td className="p-2">{rec.currency}</td>
                        <td className="p-2 font-mono text-xs">{rec.provider_transaction_id || '-'}</td>
                        <td className="p-2">
                          <Badge variant={rec.status === 'reconciled' ? 'default' : 'secondary'} className="border-2 border-black capitalize">
                            {rec.status}
                          </Badge>
                        </td>
                        <td className="p-2">
                          {rec.reconciled_at ? new Date(rec.reconciled_at).toLocaleDateString() : '-'}
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
