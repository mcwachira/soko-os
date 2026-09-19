'use client';
export const dynamic = 'force-dynamic';

import AppLayout from '@/app/app/layout';
import { useRefunds } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import Link from 'next/link';

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  approved: 'outline',
  completed: 'default',
  rejected: 'destructive',
  cancelled: 'destructive',
};

export default function RefundsPage() {
  const { data, isLoading, isError, error } = useRefunds();
  const refunds = data?.data ?? [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Refunds</h1>
            <p className="text-muted-foreground font-bold">Manage customer refunds</p>
          </div>
          <Button asChild className="border-2 border-black shadow">
            <Link href="/refunds/create">
              <Plus className="mr-2 h-4 w-4" /> New Refund
            </Link>
          </Button>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Input placeholder="Search refunds..." className="border-2 border-black" />
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
                <p className="text-sm font-bold text-destructive">Failed to load refunds</p>
                <p className="text-xs text-muted-foreground">{error instanceof Error ? error.message : 'Unknown error'}</p>
              </div>
            )}

            {!isLoading && !isError && refunds.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No refunds yet</p>
                <p className="text-sm text-muted-foreground">Create your first refund to get started</p>
              </div>
            )}

            {!isLoading && !isError && refunds.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th className="p-2 text-left font-bold">Refund #</th>
                      <th className="p-2 text-left font-bold">Sale</th>
                      <th className="p-2 text-left font-bold">Date</th>
                      <th className="p-2 text-left font-bold">Status</th>
                      <th className="p-2 text-right font-bold">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {refunds.map((refund) => (
                      <tr key={refund.id} className="border-b border-black hover:bg-muted/50">
                        <td className="p-2 font-mono font-bold">
                          <Link href={`/refunds/${refund.id}`} className="hover:underline">
                            {refund.refund_number}
                          </Link>
                        </td>
                        <td className="p-2">{refund.sale_receipt_number ?? '-'}</td>
                        <td className="p-2">{new Date(refund.created_at).toLocaleDateString()}</td>
                        <td className="p-2">
                          <Badge variant={statusColors[refund.status] || 'secondary'} className="border-2 border-black capitalize">
                            {refund.status}
                          </Badge>
                        </td>
                        <td className="p-2 text-right font-mono font-bold">
                          {(refund.refund_amount_minor / 100).toLocaleString('en-KE', { style: 'currency', currency: 'KES' })}
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
