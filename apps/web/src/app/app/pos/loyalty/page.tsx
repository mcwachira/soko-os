'use client';

import AppLayout from '@/app/app/layout';
import { useLoyalty } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const tierColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  bronze: 'secondary',
  silver: 'outline',
  gold: 'default',
};

export default function LoyaltyPage() {
  const { data, isLoading, isError } = useLoyalty();
  const accounts = data?.data ?? [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Loyalty</h1>
          <p className="text-muted-foreground font-bold">Manage customer loyalty accounts</p>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>Loyalty Accounts</CardTitle>
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
                <p className="text-sm font-bold text-destructive">Failed to load loyalty accounts</p>
              </div>
            )}

            {!isLoading && !isError && accounts.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No loyalty accounts yet</p>
              </div>
            )}

            {!isLoading && !isError && accounts.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th className="p-2 text-left font-bold">Customer</th>
                      <th className="p-2 text-left font-bold">Tier</th>
                      <th className="p-2 text-left font-bold">Points</th>
                      <th className="p-2 text-left font-bold">Earned</th>
                      <th className="p-2 text-left font-bold">Redeemed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map((account: { id: string; customer?: { name?: string }; tier: string; points_balance: number; total_earned: number; total_redeemed: number }) => (
                      <tr key={account.id} className="border-b border-black hover:bg-muted/50">
                        <td className="p-2 font-bold">{account.customer?.name || '-'}</td>
                        <td className="p-2">
                          <Badge variant={tierColors[account.tier] || 'secondary'} className="border-2 border-black">
                            {account.tier}
                          </Badge>
                        </td>
                        <td className="p-2">{account.points_balance}</td>
                        <td className="p-2">{account.total_earned}</td>
                        <td className="p-2">{account.total_redeemed}</td>
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
