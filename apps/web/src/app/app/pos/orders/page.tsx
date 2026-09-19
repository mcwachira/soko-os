'use client';

import AppLayout from '@/app/app/layout';
import { useSalesOrders } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Eye, Truck, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { fromMinorUnits } from '@soko/utils';

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  confirmed: 'default',
  processing: 'default',
  shipped: 'default',
  delivered: 'default',
  cancelled: 'destructive',
};

export default function OrdersPage() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { data, isLoading, isError, error } = useSalesOrders({ 
    search: query,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  } as Record<string, string>);
  const orders = data?.data ?? [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Orders</h1>
            <p className="text-muted-foreground font-bold">View and manage sales orders</p>
          </div>
        </div>

        <div className="flex gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by order number..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-2 border-black pl-10 w-full rounded-lg bg-background p-2"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border-2 border-black bg-background p-2 rounded-lg font-bold"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>Sales Orders ({orders.length})</CardTitle>
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
                <p className="text-sm font-bold text-destructive">Failed to load orders</p>
                <p className="text-xs text-muted-foreground">{error instanceof Error ? error.message : 'Unknown error'}</p>
              </div>
            )}

            {!isLoading && !isError && orders.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No orders found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
              </div>
            )}

            {!isLoading && !isError && orders.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th className="p-2 text-left font-bold">Order #</th>
                      <th className="p-2 text-left font-bold">Date</th>
                      <th className="p-2 text-left font-bold">Customer</th>
                      <th className="p-2 text-left font-bold">Total</th>
                      <th className="p-2 text-left font-bold">Status</th>
                      <th className="p-2 text-left font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order: { 
                      id: string; 
                      sales_order_number: string; 
                      created_at: string; 
                      customer?: { name?: string }; 
                      grand_total_minor: number; 
                      status: string 
                    }) => (
                      <tr key={order.id} className="border-b border-black hover:bg-muted/50">
                        <td className="p-2 font-mono text-sm">{order.sales_order_number}</td>
                        <td className="p-2">{format(new Date(order.created_at), 'yyyy-MM-dd HH:mm')}</td>
                        <td className="p-2">{order.customer?.name || 'Walk-in'}</td>
                        <td className="p-2 font-bold">{fromMinorUnits(order.grand_total_minor)}</td>
                        <td className="p-2">
                          <Badge variant={statusVariant[order.status] || 'secondary'} className="border-2 border-black">
                            {order.status}
                          </Badge>
                        </td>
                        <td className="p-2 flex gap-2">
                          <Button variant="outline" size="icon" className="border-2 border-black">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {order.status === 'confirmed' && (
                            <Button variant="outline" size="icon" className="border-2 border-black text-info">
                              <Truck className="h-4 w-4" />
                            </Button>
                          )}
                          {order.status === 'processing' && (
                            <Button variant="outline" size="icon" className="border-2 border-black text-success">
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          {['draft', 'confirmed', 'processing'].includes(order.status) && (
                            <Button variant="outline" size="icon" className="border-2 border-black text-destructive">
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
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
