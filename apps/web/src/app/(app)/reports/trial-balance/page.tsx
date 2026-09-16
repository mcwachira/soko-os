'use client';

import AppLayout from '@/app/(app)/layout';
import { useTrialBalance } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useMemo } from 'react';
import { formatMoney } from '@soko/utils';
import type { TrialBalanceRow } from '@soko/domain-types';

export default function TrialBalancePage() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const { data, isLoading, isError, error } = useTrialBalance({ from_date: fromDate, to_date: toDate });
  const rows = (data?.data as TrialBalanceRow[]) ?? [];

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        acc.debit += row.debit_minor || 0;
        acc.credit += row.credit_minor || 0;
        acc.closing += row.closing_balance_minor || 0;
        return acc;
      },
      { debit: 0, credit: 0, closing: 0 }
    );
  }, [rows]);

  const isBalanced = totals.debit === totals.credit;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Trial Balance</h1>
          <p className="text-muted-foreground font-bold">Verify that debits equal credits</p>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-bold">From Date</label>
                <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border-2 border-black" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold">To Date</label>
                <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border-2 border-black" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-black">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Trial Balance</CardTitle>
              {!isLoading && !isError && rows.length > 0 && (
                <span className={`text-sm font-bold ${isBalanced ? 'text-success' : 'text-destructive'}`}>
                  {isBalanced ? 'Balanced' : 'Out of Balance'}
                </span>
              )}
            </div>
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
                <p className="text-sm font-bold text-destructive">Failed to load trial balance</p>
                <p className="text-xs text-muted-foreground">{error instanceof Error ? error.message : 'Unknown error'}</p>
              </div>
            )}

            {!isLoading && !isError && rows.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No data</p>
                <p className="text-sm text-muted-foreground">Adjust filters to view trial balance</p>
              </div>
            )}

            {!isLoading && !isError && rows.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th className="p-2 text-left font-bold">Code</th>
                      <th className="p-2 text-left font-bold">Account Name</th>
                      <th className="p-2 text-left font-bold">Type</th>
                      <th className="p-2 text-right font-bold">Debit</th>
                      <th className="p-2 text-right font-bold">Credit</th>
                      <th className="p-2 text-right font-bold">Closing Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.account_id} className="border-b border-black hover:bg-muted/50">
                        <td className="p-2 font-mono">{row.account_code}</td>
                        <td className="p-2">{row.account_name}</td>
                        <td className="p-2 capitalize">{row.account_type}</td>
                        <td className="p-2 text-right font-mono">{formatMoney(row.debit_minor)}</td>
                        <td className="p-2 text-right font-mono">{formatMoney(row.credit_minor)}</td>
                        <td className="p-2 text-right font-mono font-bold">{formatMoney(row.closing_balance_minor)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-black bg-muted/50 font-bold">
                      <td colSpan={3} className="p-2 text-right">Totals</td>
                      <td className="p-2 text-right font-mono">{formatMoney(totals.debit)}</td>
                      <td className="p-2 text-right font-mono">{formatMoney(totals.credit)}</td>
                      <td className="p-2 text-right font-mono">{formatMoney(totals.closing)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
