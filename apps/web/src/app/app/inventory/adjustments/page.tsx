'use client';

import AppLayout from '@/app/app/layout';
import { useInventoryAdjustments } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function InventoryAdjustmentsPage() {
  const { data, isLoading, isError } = useInventoryAdjustments();
  const adjustments = data?.data ?? [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Inventory Adjustments</h1>
          <p className="text-muted-foreground font-bold">Manual stock adjustments and corrections</p>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>Adjustments</CardTitle>
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
                <p className="text-sm font-bold text-destructive">Failed to load adjustments</p>
              </div>
            )}

            {!isLoading && !isError && adjustments.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No adjustments found</p>
                <p className="text-sm text-muted-foreground">Adjustments are created during stocktakes or manual corrections</p>
              </div>
            )}

            {!isLoading && !isError && adjustments.length > 0 && (
              <div className="space-y-2">
                {adjustments.map((adj: { id: string; adjustment_number: string; type: string; reason: string; status: string }) => (
                  <div key={adj.id} className="flex items-center justify-between border-b border-black p-2">
                    <div>
                      <div className="text-sm font-bold">{adj.adjustment_number}</div>
                      <div className="text-xs text-muted-foreground">{adj.type} · {adj.reason}</div>
                    </div>
                    <Badge variant={adj.status === 'approved' ? 'default' : 'secondary'} className="border-2 border-black">
                      {adj.status}
                    </Badge>
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
