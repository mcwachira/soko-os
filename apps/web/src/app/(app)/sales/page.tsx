'use client';

import AppLayout from '@/app/(app)/layout';
import { useSales } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Eye, Printer } from 'lucide-react';
import { useState } from 'react';
import { useReceipt } from '@/hooks/useTanStackQuery';
import { fromMinorUnits } from '@soko/utils';

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  completed: 'default',
  pending: 'secondary',
  cancelled: 'destructive',
  refunded: 'outline',
};

export default function SalesPage() {
  const [query, setQuery] = useState('');
  const { data, isLoading, isError, error } = useSales({ search: query });
  const sales = data?.data ?? [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Sales</h1>
            <p className="text-muted-foreground font-bold">View and manage sales transactions</p>
          </div>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by receipt number..."
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
                <p className="text-sm font-bold text-destructive">Failed to load sales</p>
                <p className="text-xs text-muted-foreground">{error instanceof Error ? error.message : 'Unknown error'}</p>
              </div>
            )}

            {!isLoading && !isError && sales.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No sales yet</p>
                <p className="text-sm text-muted-foreground">Sales will appear here after checkout</p>
              </div>
            )}

            {!isLoading && !isError && sales.length > 0 && (
              <div className="space-y-3">
                {sales.map((sale: { id: string; receipt_number: string; status: string; created_at: string; grand_total_minor: number; payment_method?: string }) => (
                  <div key={sale.id} className="flex items-center justify-between rounded-lg border-2 border-black p-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-black">{sale.receipt_number}</p>
                        <p className="text-xs text-muted-foreground">{new Date(sale.created_at).toLocaleString()}</p>
                      </div>
                      <Badge variant={statusVariant[sale.status] || 'secondary'} className="border-2 border-black">
                        {sale.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-black">{fromMinorUnits(sale.grand_total_minor)}</span>
                      <Button variant="outline" size="icon" className="border-2 border-black">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
