'use client';

import AppLayout from '@/app/app/layout';
import { useReplenishmentSuggestions } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function ReplenishmentPage() {
  const { data, isLoading, isError } = useReplenishmentSuggestions();
  const suggestions = data?.data ?? [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Replenishment</h1>
          <p className="text-muted-foreground font-bold">Auto-reorder suggestions and rules</p>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>Replenishment Suggestions</CardTitle>
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
                <p className="text-sm font-bold text-destructive">Failed to load suggestions</p>
              </div>
            )}

            {!isLoading && !isError && suggestions.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No suggestions</p>
                <p className="text-sm text-muted-foreground">Configure replenishment rules to get suggestions</p>
              </div>
            )}

            {!isLoading && !isError && suggestions.length > 0 && (
              <div className="space-y-2">
                {suggestions.map((s: { id: string; product_id: string; suggested_quantity: number; reason: string; status: string }) => (
                  <div key={s.id} className="flex items-center justify-between border-b border-black p-2">
                    <div>
                      <div className="text-sm font-bold">Product: {s.product_id.slice(0, 8)}</div>
                      <div className="text-xs text-muted-foreground">{s.reason}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">Qty: {s.suggested_quantity}</div>
                      <Badge variant={s.status === 'pending' ? 'secondary' : 'default'} className="border-2 border-black">
                        {s.status}
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
