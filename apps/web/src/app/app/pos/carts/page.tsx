'use client';

import AppLayout from '@/app/app/layout';
import { useState } from 'react';
import { useCarts, useHoldCart, useRecallCart, useDeleteCart } from '@/hooks/useTanStackQuery';
import type { Cart } from '@soko/domain-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default',
  held: 'secondary',
  completed: 'outline',
  abandoned: 'destructive',
};

export default function CartsPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const { data, isLoading, isError } = useCarts(selectedStatus !== 'all' ? { status: selectedStatus } : undefined);
  const holdMutation = useHoldCart();
  const recallMutation = useRecallCart();
  const deleteMutation = useDeleteCart();
  const carts = data?.data ?? [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Carts</h1>
          <p className="text-muted-foreground font-bold">Manage held and active carts</p>
        </div>

        <div className="flex gap-2">
          {['all', 'active', 'held', 'completed'].map((status) => (
            <Button
              key={status}
              variant={selectedStatus === status ? 'default' : 'outline'}
              onClick={() => setSelectedStatus(status)}
              className="border-2 border-black capitalize"
            >
              {status}
            </Button>
          ))}
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>All Carts</CardTitle>
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
                <p className="text-sm font-bold text-destructive">Failed to load carts</p>
              </div>
            )}

            {!isLoading && !isError && carts.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No carts found</p>
                <p className="text-sm text-muted-foreground">Create a cart to get started</p>
              </div>
            )}

            {!isLoading && !isError && carts.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th className="p-2 text-left font-bold">ID</th>
                      <th className="p-2 text-left font-bold">Status</th>
                      <th className="p-2 text-left font-bold">Total</th>
                      <th className="p-2 text-left font-bold">Customer</th>
                      <th className="p-2 text-left font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {carts.map((cart: Cart) => (
                      <tr key={cart.id} className="border-b border-black hover:bg-muted/50">
                        <td className="p-2 font-mono text-sm">{cart.id.slice(0, 8)}</td>
                        <td className="p-2">
                          <Badge variant={statusColors[cart.status] || 'secondary'} className="border-2 border-black">
                            {cart.status}
                          </Badge>
                        </td>
                        <td className="p-2">KES {(cart.grand_total_minor / 100).toFixed(2)}</td>
                        <td className="p-2">{cart.customer?.name || 'Walk-in'}</td>
                        <td className="p-2 flex gap-2">
                          {cart.status === 'active' && (
                            <Button size="sm" variant="outline" onClick={() => holdMutation.mutate(cart.id)} className="border-2 border-black">
                              Hold
                            </Button>
                          )}
                          {cart.status === 'held' && (
                            <Button size="sm" variant="outline" onClick={() => recallMutation.mutate(cart.id)} className="border-2 border-black">
                              Recall
                            </Button>
                          )}
                          <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(cart.id)} className="border-2 border-black">
                            Delete
                          </Button>
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
