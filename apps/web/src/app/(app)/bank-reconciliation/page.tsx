'use client';

import AppLayout from '@/app/(app)/layout';
import { useBankReconciliations } from '@/hooks/useTanStackQuery';
import { useCreateBankReconciliation } from '@/hooks/useTanStackQuery';
import { useBankAccounts } from '@/hooks/useTanStackQuery';
import { useBankTransactions } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { formatMoney } from '@soko/utils';

const reconciliationFormSchema = z.object({
  bank_account_id: z.string().min(1, 'Bank account is required'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  statement_opening_balance_minor: z.number().min(0, 'Opening balance is required'),
  statement_closing_balance_minor: z.number().min(0, 'Closing balance is required'),
});

type ReconciliationFormValues = z.infer<typeof reconciliationFormSchema>;

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  in_progress: 'outline',
  completed: 'default',
  discrepancy: 'destructive',
};

export default function BankReconciliationPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data, isLoading, isError, error } = useBankReconciliations();
  const { data: accountsData } = useBankAccounts();
  const { data: transactionsData } = useBankTransactions();
  const createMutation = useCreateBankReconciliation();
  const reconciliations = data?.data ?? [];
  const accounts = accountsData?.data ?? [];
  const transactions = transactionsData?.data ?? [];

  const form = useForm<ReconciliationFormValues>({
    resolver: zodResolver(reconciliationFormSchema),
    defaultValues: {
      bank_account_id: '',
      start_date: '',
      end_date: '',
      statement_opening_balance_minor: 0,
      statement_closing_balance_minor: 0,
    },
  });

  const onSubmit = async (values: ReconciliationFormValues) => {
    await createMutation.mutateAsync(values);
    setDialogOpen(false);
    form.reset();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Bank Reconciliation</h1>
            <p className="text-muted-foreground font-bold">Match transactions with bank statements</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="border-2 border-black shadow">
                <Plus className="mr-2 h-4 w-4" /> New Reconciliation
              </Button>
            </DialogTrigger>
            <DialogContent className="border-2 border-black">
              <DialogHeader>
                <DialogTitle>New Reconciliation</DialogTitle>
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
                            {accounts.map((acc) => (
                              <SelectItem key={acc.id} value={acc.id}>{acc.bank_name} - {acc.account_name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="start_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} className="border-2 border-black" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="end_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} className="border-2 border-black" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="statement_opening_balance_minor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Opening Balance</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              value={field.value / 100}
                              onChange={(e) => field.onChange(Math.round((parseFloat(e.target.value) || 0) * 100))}
                              className="border-2 border-black"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="statement_closing_balance_minor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Closing Balance</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              value={field.value / 100}
                              onChange={(e) => field.onChange(Math.round((parseFloat(e.target.value) || 0) * 100))}
                              className="border-2 border-black"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="border-2 border-black">Cancel</Button>
                    <Button type="submit" className="border-2 border-black shadow">Create</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>Reconciliations</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full border-2 border-black" />
                ))}
              </div>
            )}

            {isError && (
              <div className="py-8 text-center">
                <p className="text-sm font-bold text-destructive">Failed to load reconciliations</p>
                <p className="text-xs text-muted-foreground">{error instanceof Error ? error.message : 'Unknown error'}</p>
              </div>
            )}

            {!isLoading && !isError && reconciliations.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No reconciliations yet</p>
                <p className="text-sm text-muted-foreground">Start a new reconciliation to match transactions</p>
              </div>
            )}

            {!isLoading && !isError && reconciliations.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th className="p-2 text-left font-bold">Bank</th>
                      <th className="p-2 text-left font-bold">Period</th>
                      <th className="p-2 text-left font-bold">Opening</th>
                      <th className="p-2 text-left font-bold">Closing</th>
                      <th className="p-2 text-left font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reconciliations.map((rec) => (
                      <tr key={rec.id} className="border-b border-black hover:bg-muted/50">
                        <td className="p-2">{accounts.find((a) => a.id === rec.bank_account_id)?.bank_name || '-'}</td>
                        <td className="p-2">{new Date(rec.start_date).toLocaleDateString()} - {new Date(rec.end_date).toLocaleDateString()}</td>
                        <td className="p-2 text-right font-mono">{formatMoney(rec.statement_opening_balance_minor)}</td>
                        <td className="p-2 text-right font-mono">{formatMoney(rec.statement_closing_balance_minor)}</td>
                        <td className="p-2">
                          <Badge variant={statusColors[rec.status] || 'secondary'} className="border-2 border-black capitalize">
                            {rec.status.replace('_', ' ')}
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
