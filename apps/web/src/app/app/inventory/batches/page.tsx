'use client';

import AppLayout from '@/app/app/layout';
import { useBatches } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function BatchesPage() {
  const { data, isLoading, isError } = useBatches();
  const batches = data?.data ?? [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Batches</h1>
          <p className="text-muted-foreground font-bold">Track batch numbers and expiry</p>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>Batches</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full border-2 border-black" />
                ))}
              </div>
            )}

            {isError && (
              <div className="py-8 text-center">
                <p className="text-sm font-bold text-destructive">Failed to load batches</p>
              </div>
            )}

            {!isLoading && !isError && batches.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No batches found</p>
                <p className="text-sm text-muted-foreground">Batches are created during purchase receives</p>
              </div>
            )}

            {!isLoading && !isError && batches.length > 0 && (
              <div className="space-y-2">
                {batches.map((batch: { id: string; batch_number: string; product_id: string; quantity: number; expiry_date?: string; status: string }) => (
                  <div key={batch.id} className="flex items-center justify-between border-b border-black p-2">
                    <div>
                      <div className="text-sm font-bold">{batch.batch_number}</div>
                      <div className="text-xs text-muted-foreground">Product: {batch.product_id.slice(0, 8)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">Qty: {batch.quantity}</div>
                      {batch.expiry_date && (
                        <div className="text-xs text-muted-foreground">Exp: {batch.expiry_date}</div>
                      )}
                      <Badge variant={batch.status === 'active' ? 'default' : 'destructive'} className="border-2 border-black">
                        {batch.status}
                      </Badge>
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
