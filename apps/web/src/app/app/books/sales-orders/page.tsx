'use client';
export const dynamic = 'force-dynamic';

import AppLayout from '@/app/app/layout';
import { useSalesOrders } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import Link from 'next/link';

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  confirmed: 'outline',
  processing: 'outline',
  shipped: 'default',
  delivered: 'default',
  cancelled: 'destructive',
};

export default function SalesOrdersPage() {
  const { data, isLoading, isError, error } = useSalesOrders();
  const salesOrders = data?.data ?? [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Sales Orders</h1>
            <p className="text-muted-foreground font-bold">Manage sales orders</p>
          </div>
          <Button asChild className="border-2 border-black shadow">
            <Link href="/sales-orders/create">
              <Plus className="mr-2 h-4 w-4" /> New Sales Order
            </Link>
          </Button>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Input placeholder="Search sales orders..." className="border-2 border-black" />
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
                <p className="text-sm font-bold text-destructive">Failed to load sales orders</p>
                <p className="text-xs text-muted-foreground">{error instanceof Error ? error.message : 'Unknown error'}</p>
              </div>
            )}

            {!isLoading && !isError && salesOrders.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No sales orders yet</p>
                <p className="text-sm text-muted-foreground">Create your first sales order to get started</p>
              </div>
            )}

            {!isLoading && !isError && salesOrders.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th className="p-2 text-left font-bold">SO #</th>
                      <th className="p-2 text-left font-bold">Customer</th>
                      <th className="p-2 text-left font-bold">Order Date</th>
                      <th className="p-2 text-left font-bold">Delivery Date</th>
                      <th className="p-2 text-left font-bold">Status</th>
                      <th className="p-2 text-right font-bold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesOrders.map((order) => (
                      <tr key={order.id} className="border-b border-black hover:bg-muted/50">
                        <td className="p-2 font-mono font-bold">
                          <Link href={`/sales-orders/${order.id}`} className="hover:underline">
                            {order.sales_order_number}
                          </Link>
                        </td>
                        <td className="p-2">{order.customer_name}</td>
                        <td className="p-2">{new Date(order.order_date).toLocaleDateString()}</td>
                        <td className="p-2">{order.expected_delivery_date ? new Date(order.expected_delivery_date).toLocaleDateString() : '-'}</td>
                        <td className="p-2">
                          <Badge variant={statusColors[order.status] || 'secondary'} className="border-2 border-black capitalize">
                            {order.status}
                          </Badge>
                        </td>
                        <td className="p-2 text-right font-mono font-bold">
                          {(order.grand_total_minor / 100).toLocaleString('en-KE', { style: 'currency', currency: 'KES' })}
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
