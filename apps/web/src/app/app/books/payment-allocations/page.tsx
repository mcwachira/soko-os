'use client';
export const dynamic = 'force-dynamic';

import AppLayout from '@/app/app/layout';
import { usePaymentAllocations } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function PaymentAllocationsPage() {
  const { data, isLoading, isError, error } = usePaymentAllocations();
  const allocations = data?.data ?? [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Payment Allocations</h1>
            <p className="text-muted-foreground font-bold">Manage payment allocations</p>
          </div>
          <Button asChild className="border-2 border-black shadow">
            <Link href="/payment-allocations/create">
              <Plus className="mr-2 h-4 w-4" /> New Allocation
            </Link>
          </Button>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Input placeholder="Search allocations..." className="border-2 border-black" />
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
                <p className="text-sm font-bold text-destructive">Failed to load allocations</p>
                <p className="text-xs text-muted-foreground">{error instanceof Error ? error.message : 'Unknown error'}</p>
              </div>
            )}

            {!isLoading && !isError && allocations.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No allocations yet</p>
                <p className="text-sm text-muted-foreground">Create your first allocation to get started</p>
              </div>
            )}

            {!isLoading && !isError && allocations.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th className="p-2 text-left font-bold">Payment</th>
                      <th className="p-2 text-left font-bold">Type</th>
                      <th className="p-2 text-left font-bold">Reference</th>
                      <th className="p-2 text-right font-bold">Allocated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allocations.map((allocation) => (
                      <tr key={allocation.id} className="border-b border-black hover:bg-muted/50">
                        <td className="p-2 font-mono font-bold">
                          <Link href={`/payment-allocations/${allocation.id}`} className="hover:underline">
                            {allocation.payment_id}
                          </Link>
                        </td>
                        <td className="p-2 capitalize">{allocation.allocatable_type}</td>
                        <td className="p-2 font-mono">{allocation.allocatable_id}</td>
                        <td className="p-2 text-right font-mono font-bold">
                          {(allocation.allocated_minor / 100).toLocaleString('en-KE', { style: 'currency', currency: 'KES' })}
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
