'use client';

import AppLayout from '@/app/(app)/layout';
import { useProfitLoss } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useMemo } from 'react';
import { formatMoney } from '@soko/utils';
import type { ProfitLossRow } from '@soko/domain-types';

export default function ProfitLossPage() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const { data, isLoading, isError, error } = useProfitLoss({ from_date: fromDate, to_date: toDate });
  const rows = (data?.data as ProfitLossRow[]) ?? [];

  const totals = useMemo(() => {
    let revenue = 0;
    let expenses = 0;
    let netProfit = 0;
    rows.forEach((row) => {
      const amount = row.amount_minor || 0;
      if (row.account_type === 'revenue') {
        revenue += amount;
      } else if (row.account_type === 'expense') {
        expenses += amount;
      }
    });
    netProfit = revenue - expenses;
    return { revenue, expenses, netProfit };
  }, [rows]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Profit & Loss</h1>
          <p className="text-muted-foreground font-bold">Income statement for the selected period</p>
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
            <CardTitle>Profit & Loss Statement</CardTitle>
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
                <p className="text-sm font-bold text-destructive">Failed to load profit & loss</p>
                <p className="text-xs text-muted-foreground">{error instanceof Error ? error.message : 'Unknown error'}</p>
              </div>
            )}

            {!isLoading && !isError && rows.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No data</p>
                <p className="text-sm text-muted-foreground">Adjust filters to view report</p>
              </div>
            )}

            {!isLoading && !isError && rows.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th className="p-2 text-left font-bold">Account</th>
                      <th className="p-2 text-right font-bold">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.account_id} className={`border-b border-black hover:bg-muted/50 ${row.is_subtotal ? 'font-bold bg-muted/30' : ''}`}>
                        <td className="p-2" style={{ paddingLeft: `${row.level * 16 + 8}px` }}>
                          {row.account_code} - {row.account_name}
                        </td>
                        <td className="p-2 text-right font-mono">{formatMoney(row.amount_minor)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-black bg-muted/50">
                      <td className="p-2 font-bold">Total Revenue</td>
                      <td className="p-2 text-right font-mono font-bold">{formatMoney(totals.revenue)}</td>
                    </tr>
                    <tr className="border-t-2 border-black bg-muted/50">
                      <td className="p-2 font-bold">Total Expenses</td>
                      <td className="p-2 text-right font-mono font-bold">{formatMoney(totals.expenses)}</td>
                    </tr>
                    <tr className="border-t-2 border-black bg-muted/50">
                      <td className="p-2 font-bold text-lg">Net Profit</td>
                      <td className={`p-2 text-right font-mono font-bold text-lg ${totals.netProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {formatMoney(totals.netProfit)}
                      </td>
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
