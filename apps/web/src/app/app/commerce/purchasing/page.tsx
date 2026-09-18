'use client';

import AppLayout from '@/app/app/layout';
import { usePurchaseOrders } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { PurchaseOrder } from '@soko/domain-types';
import { fromMinorUnits } from '@soko/utils';

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  approved: 'default',
  sent: 'outline',
  partial_received: 'outline',
  completed: 'default',
  cancelled: 'destructive',
  closed: 'secondary',
};

export default function PurchasingPage() {
  const { data, isLoading, isError, error } = usePurchaseOrders();
  const purchaseOrders = data?.data ?? [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Purchasing</h1>
            <p className="text-muted-foreground font-bold">
              Manage purchase orders and supplier orders
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild className="border-2 border-black">
              <Link href="/procurement/requisitions">
                <ClipboardList className="mr-2 h-4 w-4" /> Requisitions
              </Link>
            </Button>
            <Button className="border-2 border-black">
              <Plus className="mr-2 h-4 w-4" /> New Purchase Order
            </Button>
          </div>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>Purchase Orders</CardTitle>
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
                <p className="text-sm font-bold text-destructive">Failed to load purchase orders</p>
                <p className="text-xs text-muted-foreground">{error instanceof Error ? error.message : 'Unknown error'}</p>
              </div>
            )}

            {!isLoading && !isError && purchaseOrders.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No purchase orders</p>
                <p className="text-sm text-muted-foreground">Create your first purchase order to start buying from suppliers</p>
              </div>
            )}

            {!isLoading && !isError && purchaseOrders.length > 0 && (
              <div className="space-y-2">
                {purchaseOrders.map((po: PurchaseOrder) => (
                  <div key={po.id} className="flex items-center justify-between rounded-lg border-2 border-black p-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-black">{po.po_number}</p>
                        <Badge variant={statusColors[po.status] || 'secondary'} className="border-2 border-black">
                          {po.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Supplier: {po.supplier?.name || 'N/A'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Warehouse: {po.warehouse?.name || 'N/A'}
                      </p>
                      {po.expected_date && (
                        <p className="text-xs text-muted-foreground">
                          Expected: {new Date(po.expected_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black">{fromMinorUnits(po.grand_total_minor)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(po.created_at).toLocaleDateString()}
                      </p>
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
