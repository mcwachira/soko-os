'use client';

import AppLayout from '@/app/app/layout';
import { useLandedCosts } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function LandedCostsPage() {
  const { data, isLoading, isError } = useLandedCosts();
  const costs = data?.data ?? [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Landed Costs</h1>
          <p className="text-muted-foreground font-bold">Import duties, freight, and cost allocation</p>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>Landed Costs</CardTitle>
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
                <p className="text-sm font-bold text-destructive">Failed to load landed costs</p>
              </div>
            )}

            {!isLoading && !isError && costs.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No landed costs found</p>
                <p className="text-sm text-muted-foreground">Landed costs are allocated during purchase receives</p>
              </div>
            )}

            {!isLoading && !isError && costs.length > 0 && (
              <div className="space-y-2">
                {costs.map((lc: { id: string; landed_cost_number: string; total_cost_minor: number; allocation_method: string; status: string }) => (
                  <div key={lc.id} className="flex items-center justify-between border-b border-black p-2">
                    <div>
                      <div className="text-sm font-bold">{lc.landed_cost_number}</div>
                      <div className="text-xs text-muted-foreground">Method: {lc.allocation_method}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">KES {(lc.total_cost_minor / 100).toFixed(2)}</div>
                      <Badge variant={lc.status === 'posted' ? 'default' : 'secondary'} className="border-2 border-black">
                        {lc.status}
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
