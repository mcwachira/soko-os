'use client';

import AppLayout from '@/app/(app)/layout';
import { useLedger } from '@/hooks/useTanStackQuery';
import { useAccounts } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useMemo } from 'react';
import { formatMoney } from '@soko/utils';

export default function LedgerPage() {
  const [accountId, setAccountId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [branchId, setBranchId] = useState('');

  const { data, isLoading, isError, error } = useLedger({ account_id: accountId, from_date: fromDate, to_date: toDate, branch_id: branchId });
  const { data: accountsData } = useAccounts();
  const accounts = accountsData?.data ?? [];

  const lines = (data?.data as Record<string, unknown>[]) ?? [];

  const enrichedLines = useMemo(() => {
    let balance = 0;
    return lines.map((line) => {
      const debit = (line.debit_minor as number) || 0;
      const credit = (line.credit_minor as number) || 0;
      balance += debit - credit;
      return { ...line, running_balance: balance };
    });
  }, [lines]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">General Ledger</h1>
          <p className="text-muted-foreground font-bold">View account transactions and balances</p>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div>
                <label className="mb-1 block text-sm font-bold">Account</label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full rounded-lg border-2 border-black bg-background p-2"
                >
                  <option value="">All Accounts</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.code} - {account.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold">From Date</label>
                <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border-2 border-black" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold">To Date</label>
                <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border-2 border-black" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold">Branch</label>
                <Input value={branchId} onChange={(e) => setBranchId(e.target.value)} placeholder="Branch ID" className="border-2 border-black" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>Ledger Entries</CardTitle>
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
                <p className="text-sm font-bold text-destructive">Failed to load ledger</p>
                <p className="text-xs text-muted-foreground">{error instanceof Error ? error.message : 'Unknown error'}</p>
              </div>
            )}

            {!isLoading && !isError && enrichedLines.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No ledger entries</p>
                <p className="text-sm text-muted-foreground">Adjust filters to view transactions</p>
              </div>
            )}

            {!isLoading && !isError && enrichedLines.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th className="p-2 text-left font-bold">Date</th>
                      <th className="p-2 text-left font-bold">Account</th>
                      <th className="p-2 text-left font-bold">Description</th>
                      <th className="p-2 text-right font-bold">Debit</th>
                      <th className="p-2 text-right font-bold">Credit</th>
                      <th className="p-2 text-right font-bold">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrichedLines.map((line: Record<string, unknown>, idx: number) => (
                      <tr key={idx} className="border-b border-black hover:bg-muted/50">
                        <td className="p-2">{new Date(line.transaction_date as string).toLocaleDateString()}</td>
                        <td className="p-2 font-mono text-sm">{line.account_code as string} - {line.account_name as string}</td>
                        <td className="p-2 text-sm text-muted-foreground">{line.description as string || '-'}</td>
                        <td className="p-2 text-right font-mono">{formatMoney((line.debit_minor as number) || 0)}</td>
                        <td className="p-2 text-right font-mono">{formatMoney((line.credit_minor as number) || 0)}</td>
                        <td className="p-2 text-right font-mono font-bold">{formatMoney((line.running_balance as number) || 0)}</td>
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
