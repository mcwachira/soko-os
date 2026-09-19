'use client';

import AppLayout from '@/app/app/layout';
import { useStocktakes } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function StocktakesPage() {
  const { data, isLoading, isError } = useStocktakes();
  const stocktakes = data?.data ?? [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Stocktakes</h1>
          <p className="text-muted-foreground font-bold">Physical inventory counts and cycle counts</p>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>Stocktakes</CardTitle>
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
                <p className="text-sm font-bold text-destructive">Failed to load stocktakes</p>
              </div>
            )}

            {!isLoading && !isError && stocktakes.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No stocktakes found</p>
                <p className="text-sm text-muted-foreground">Create a stocktake to begin physical counting</p>
              </div>
            )}

            {!isLoading && !isError && stocktakes.length > 0 && (
              <div className="space-y-2">
                {stocktakes.map((st: { id: string; stocktake_number: string; type: string; status: string; warehouse_id: string }) => (
                  <div key={st.id} className="flex items-center justify-between border-b border-black p-2">
                    <div>
                      <div className="text-sm font-bold">{st.stocktake_number}</div>
                      <div className="text-xs text-muted-foreground">{st.type} · Warehouse: {st.warehouse_id.slice(0, 8)}</div>
                    </div>
                    <Badge variant={st.status === 'approved' ? 'default' : 'secondary'} className="border-2 border-black">
                      {st.status}
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
