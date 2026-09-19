'use client';

import AppLayout from '@/app/app/layout';
import { useBills, useApproveBill } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Plus, Check } from 'lucide-react';
import Link from 'next/link';
import { formatMoney } from '@soko/utils';
import { toast } from 'sonner';

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  pending: 'outline',
  paid: 'default',
  overdue: 'destructive',
  cancelled: 'destructive',
  void: 'destructive',
};

export default function BillsPage() {
  const { data, isLoading, isError, error } = useBills();
  const approveBill = useApproveBill();
  const bills = data?.data ?? [];

  const handleApprove = (id: string) => {
    approveBill.mutate(id, {
      onSuccess: () => toast.success('Bill approved'),
      onError: () => toast.error('Failed to approve bill'),
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Bills</h1>
            <p className="text-muted-foreground font-bold">Manage supplier bills</p>
          </div>
          <Button asChild className="border-2 border-black shadow">
            <Link href="/bills/create">
              <Plus className="mr-2 h-4 w-4" /> Create Bill
            </Link>
          </Button>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Input placeholder="Search bills..." className="border-2 border-black" />
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
                <p className="text-sm font-bold text-destructive">Failed to load bills</p>
                <p className="text-xs text-muted-foreground">{error instanceof Error ? error.message : 'Unknown error'}</p>
              </div>
            )}

            {!isLoading && !isError && bills.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No bills yet</p>
                <p className="text-sm text-muted-foreground">Create your first bill to get started</p>
              </div>
            )}

            {!isLoading && !isError && bills.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th className="p-2 text-left font-bold">Bill #</th>
                      <th className="p-2 text-left font-bold">Supplier</th>
                      <th className="p-2 text-left font-bold">Issue Date</th>
                      <th className="p-2 text-left font-bold">Due Date</th>
                      <th className="p-2 text-left font-bold">Status</th>
                      <th className="p-2 text-right font-bold">Grand Total</th>
                      <th className="p-2 text-right font-bold">Balance</th>
                      <th className="p-2 text-right font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bills.map((bill) => (
                      <tr key={bill.id} className="border-b border-black hover:bg-muted/50">
                        <td className="p-2 font-mono font-bold">
                          <Link href={`/bills/${bill.id}`} className="hover:underline">
                            {bill.bill_number}
                          </Link>
                        </td>
                        <td className="p-2">{bill.supplier_name}</td>
                        <td className="p-2">{new Date(bill.bill_date).toLocaleDateString()}</td>
                        <td className="p-2">{new Date(bill.due_date).toLocaleDateString()}</td>
                        <td className="p-2">
                          <Badge variant={statusColors[bill.status] || 'secondary'} className="border-2 border-black capitalize">
                            {bill.status}
                          </Badge>
                        </td>
                        <td className="p-2 text-right font-mono">{formatMoney(bill.grand_total_minor)}</td>
                        <td className="p-2 text-right font-mono font-bold">{formatMoney(bill.balance_minor)}</td>
                        <td className="p-2 text-right">
                          {(bill.status === 'draft' || bill.status === 'pending') && (
                            <Button
                              size="sm"
                              onClick={() => handleApprove(bill.id)}
                              disabled={approveBill.isPending}
                              className="border-2 border-black shadow"
                            >
                              <Check className="h-4 w-4 mr-1" /> Approve
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
