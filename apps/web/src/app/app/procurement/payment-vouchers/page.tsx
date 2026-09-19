'use client';

import AppLayout from '@/app/app/layout';
import { usePaymentVouchers } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { PaymentVoucher } from '@soko/domain-types';
import { fromMinorUnits } from '@soko/utils';

export default function PaymentVouchersPage() {
  const [query, setQuery] = useState('');
  const { data, isLoading, isError, error } = usePaymentVouchers();
  const vouchers = data?.data ?? [];

  const filtered = vouchers.filter((v: PaymentVoucher) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      v.voucher_number.toLowerCase().includes(q) ||
      v.status.toLowerCase().includes(q) ||
      v.currency.toLowerCase().includes(q)
    );
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Payment Vouchers</h1>
            <p className="text-muted-foreground font-bold">
              Payment voucher processing
            </p>
          </div>
          <Button className="border-2 border-black">
            <Plus className="mr-2 h-4 w-4" /> New Voucher
          </Button>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search vouchers..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="border-2 border-black pl-10"
                />
              </div>
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
                <p className="text-sm font-bold text-destructive">Failed to load vouchers</p>
                <p className="text-xs text-muted-foreground">{error instanceof Error ? error.message : 'Unknown error'}</p>
              </div>
            )}

            {!isLoading && !isError && filtered.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No vouchers found</p>
                <p className="text-sm text-muted-foreground">
                  {query ? 'Try a different search term' : 'Create your first voucher to get started'}
                </p>
              </div>
            )}

            {!isLoading && !isError && filtered.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th className="p-2 text-left font-bold">Voucher #</th>
                      <th className="p-2 text-left font-bold">Currency</th>
                      <th className="p-2 text-left font-bold">Gross Amount</th>
                      <th className="p-2 text-left font-bold">Net Payable</th>
                      <th className="p-2 text-left font-bold">Status</th>
                      <th className="p-2 text-left font-bold">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((voucher: PaymentVoucher) => (
                      <tr key={voucher.id} className="border-b border-black hover:bg-muted/50">
                        <td className="p-2 font-mono font-bold">{voucher.voucher_number}</td>
                        <td className="p-2">{voucher.currency}</td>
                        <td className="p-2 font-mono">{fromMinorUnits(voucher.gross_amount_minor)}</td>
                        <td className="p-2 font-mono font-bold">{fromMinorUnits(voucher.net_payable_minor)}</td>
                        <td className="p-2">
                          <Badge variant={voucher.status === 'approved' ? 'default' : 'secondary'} className="border-2 border-black capitalize">
                            {voucher.status}
                          </Badge>
                        </td>
                        <td className="p-2">{new Date(voucher.created_at).toLocaleDateString()}</td>
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
