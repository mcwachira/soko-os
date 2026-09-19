'use client';

import AppLayout from '@/app/app/layout';
import { useTransfers } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function TransfersPage() {
  const { data, isLoading, isError } = useTransfers();
  const transfers = data?.data ?? [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Transfers</h1>
          <p className="text-muted-foreground font-bold">Inter-warehouse stock transfers</p>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>Transfer Orders</CardTitle>
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
                <p className="text-sm font-bold text-destructive">Failed to load transfers</p>
              </div>
            )}

            {!isLoading && !isError && transfers.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No transfers found</p>
                <p className="text-sm text-muted-foreground">Create a transfer to move stock between warehouses</p>
              </div>
            )}

            {!isLoading && !isError && transfers.length > 0 && (
              <div className="space-y-2">
                {transfers.map((transfer: { id: string; transfer_number: string; status: string; source_warehouse_id: string; destination_warehouse_id: string }) => (
                  <div key={transfer.id} className="flex items-center justify-between border-b border-black p-2">
                    <div>
                      <div className="text-sm font-bold">{transfer.transfer_number}</div>
                      <div className="text-xs text-muted-foreground">
                        From: {transfer.source_warehouse_id.slice(0, 8)} → To: {transfer.destination_warehouse_id.slice(0, 8)}
                      </div>
                    </div>
                    <Badge variant={transfer.status === 'completed' ? 'default' : 'secondary'} className="border-2 border-black">
                      {transfer.status}
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
