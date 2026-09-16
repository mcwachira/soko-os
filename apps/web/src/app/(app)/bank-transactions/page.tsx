'use client';

import AppLayout from '@/app/(app)/layout';
import { useBankTransactions, useIsPeriodLocked } from '@/hooks/useTanStackQuery';
import { useBankAccounts } from '@/hooks/useTanStackQuery';
import { useCreateBankTransaction } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Plus, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { formatMoney, toMinorUnits } from '@soko/utils';
import type { BankTransaction, BankAccount } from '@soko/domain-types';

const transactionFormSchema = z.object({
  bank_account_id: z.string().min(1, 'Bank account is required'),
  transaction_type: z.enum(['deposit', 'withdrawal', 'transfer', 'fee', 'interest', 'other']),
  direction: z.enum(['in', 'out']),
  amount_minor: z.number().min(1, 'Amount is required'),
  transaction_date: z.string().min(1, 'Date is required'),
  currency: z.string(),
  reference: z.string().optional(),
  description: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionFormSchema>;

const typeColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  deposit: 'default',
  withdrawal: 'destructive',
  transfer: 'secondary',
  fee: 'destructive',
  interest: 'default',
  other: 'secondary',
};

export default function BankTransactionsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data, isLoading, isError, error } = useBankTransactions();
  const { data: accountsData } = useBankAccounts();
  const createMutation = useCreateBankTransaction();
  const transactions = data?.data ?? [];
  const accounts = accountsData?.data ?? [];

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      bank_account_id: '',
      transaction_type: 'deposit',
      direction: 'in',
      amount_minor: 0,
      currency: 'KES',
      reference: '',
      description: '',
      transaction_date: new Date().toISOString().split('T')[0],
    },
  });

  const transactionDate = form.watch('transaction_date');
  const { isLocked: isTxPeriodLocked } = useIsPeriodLocked(transactionDate);

  const onSubmit = async (values: TransactionFormValues) => {
    await createMutation.mutateAsync(values);
    setDialogOpen(false);
    form.reset();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Bank Transactions</h1>
            <p className="text-muted-foreground font-bold">View and manage bank transactions</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="border-2 border-black shadow">
                <Plus className="mr-2 h-4 w-4" /> Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="border-2 border-black">
              <DialogHeader>
                <DialogTitle>Add Transaction</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="bank_account_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Account</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-2 border-black">
                              <SelectValue placeholder="Select account" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {accounts.map((acc: BankAccount) => (
                              <SelectItem key={acc.id} value={acc.id}>{acc.bank_name} - {acc.account_name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="transaction_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-2 border-black">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="deposit">Deposit</SelectItem>
                            <SelectItem value="withdrawal">Withdrawal</SelectItem>
                            <SelectItem value="transfer">Transfer</SelectItem>
                            <SelectItem value="fee">Fee</SelectItem>
                            <SelectItem value="interest">Interest</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="amount_minor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              value={field.value / 100}
                              onChange={(e) => field.onChange(toMinorUnits(parseFloat(e.target.value) || 0))}
                              className="border-2 border-black"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="transaction_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} className="border-2 border-black" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="reference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reference</FormLabel>
                        <FormControl>
                          <Input {...field} className="border-2 border-black" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input {...field} className="border-2 border-black" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    {isTxPeriodLocked && (
                      <Alert variant="destructive" className="border-2 border-black">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Period Locked</AlertTitle>
                        <AlertDescription>The selected transaction date falls in a closed accounting period. Creation is disabled.</AlertDescription>
                      </Alert>
                    )}
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="border-2 border-black">Cancel</Button>
                    <Button type="submit" disabled={createMutation.isPending || isTxPeriodLocked} className="border-2 border-black shadow">Save</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>Bank Transactions</CardTitle>
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
                <p className="text-sm font-bold text-destructive">Failed to load transactions</p>
                <p className="text-xs text-muted-foreground">{error instanceof Error ? error.message : 'Unknown error'}</p>
              </div>
            )}

            {!isLoading && !isError && transactions.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No transactions yet</p>
                <p className="text-sm text-muted-foreground">Add your first transaction to get started</p>
              </div>
            )}

            {!isLoading && !isError && transactions.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th className="p-2 text-left font-bold">Date</th>
                      <th className="p-2 text-left font-bold">Account</th>
                      <th className="p-2 text-left font-bold">Type</th>
                      <th className="p-2 text-left font-bold">Description</th>
                      <th className="p-2 text-right font-bold">Amount</th>
                      <th className="p-2 text-left font-bold">Reconciled</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx: BankTransaction) => (
                      <tr key={tx.id} className="border-b border-black hover:bg-muted/50">
                        <td className="p-2">{new Date(tx.transaction_date).toLocaleDateString()}</td>
                        <td className="p-2">{accounts.find((a: BankAccount) => a.id === tx.bank_account_id)?.bank_name || '-'}</td>
                        <td className="p-2">
                          <Badge variant={typeColors[tx.transaction_type] || 'secondary'} className="border-2 border-black capitalize">
                            {tx.transaction_type}
                          </Badge>
                        </td>
                        <td className="p-2 text-sm text-muted-foreground">{tx.description || tx.reference || '-'}</td>
                        <td className={`p-2 text-right font-mono font-bold ${tx.direction === 'in' ? 'text-success' : 'text-destructive'}`}>
                          {tx.direction === 'in' ? '+' : '-'}{formatMoney(tx.amount_minor)}
                        </td>
                        <td className="p-2">
                          <Badge variant={tx.reconciled ? 'default' : 'secondary'} className="border-2 border-black">
                            {tx.reconciled ? 'Yes' : 'No'}
                          </Badge>
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
