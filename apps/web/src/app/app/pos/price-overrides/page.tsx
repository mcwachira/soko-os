'use client';

import AppLayout from '@/app/app/layout';
import { usePriceOverrides, useApprovePriceOverride } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { fromMinorUnits } from '@soko/utils';

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  approved: 'default',
  rejected: 'destructive',
};

export default function PriceOverridesPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const { data, isLoading, isError } = usePriceOverrides(statusFilter !== 'all' ? { status: statusFilter } : undefined);
  const approveMutation = useApprovePriceOverride();
  const overrides = data?.data ?? [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Price Overrides</h1>
          <p className="text-muted-foreground font-bold">Manage price overrides and approvals</p>
        </div>

        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              onClick={() => setStatusFilter(status)}
              className="border-2 border-black capitalize"
            >
              {status}
            </Button>
          ))}
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>Price Overrides</CardTitle>
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
                <p className="text-sm font-bold text-destructive">Failed to load price overrides</p>
              </div>
            )}

            {!isLoading && !isError && overrides.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No price overrides found</p>
              </div>
            )}

            {!isLoading && !isError && overrides.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th className="p-2 text-left font-bold">Original</th>
                      <th className="p-2 text-left font-bold">New</th>
                      <th className="p-2 text-left font-bold">Difference</th>
                      <th className="p-2 text-left font-bold">Status</th>
                      <th className="p-2 text-left font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overrides.map((override: { id: string; original_price_minor: number; new_price_minor: number; difference_minor: number; status: string }) => (
                      <tr key={override.id} className="border-b border-black hover:bg-muted/50">
                        <td className="p-2">{fromMinorUnits(override.original_price_minor)}</td>
                        <td className="p-2">{fromMinorUnits(override.new_price_minor)}</td>
                        <td className="p-2">{fromMinorUnits(override.difference_minor)}</td>
                        <td className="p-2">
                          <Badge variant={statusColors[override.status] || 'secondary'} className="border-2 border-black">
                            {override.status}
                          </Badge>
                        </td>
                        <td className="p-2">
                          {override.status === 'pending' && (
                            <Button size="sm" onClick={() => approveMutation.mutate(override.id)} className="border-2 border-black">
                              Approve
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
