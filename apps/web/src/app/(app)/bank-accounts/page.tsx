'use client';

import AppLayout from '@/app/(app)/layout';
import { useBankAccounts } from '@/hooks/useTanStackQuery';
import { useCreateBankAccount, useUpdateBankAccount, useDeleteBankAccount } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { formatMoney } from '@soko/utils';
import type { BankAccount } from '@soko/domain-types';

const bankAccountFormSchema = z.object({
  account_name: z.string().min(1, 'Account name is required'),
  account_number: z.string().min(1, 'Account number is required'),
  bank_name: z.string().min(1, 'Bank name is required'),
  currency: z.string(),
  opening_balance_minor: z.number(),
  is_active: z.boolean(),
});

type BankAccountFormValues = z.infer<typeof bankAccountFormSchema>;

export default function BankAccountsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const { data, isLoading, isError, error } = useBankAccounts();
  const createMutation = useCreateBankAccount();
  const updateMutation = useUpdateBankAccount();
  const deleteMutation = useDeleteBankAccount();
  const accounts = data?.data ?? [];

  const form = useForm<BankAccountFormValues>({
    resolver: zodResolver(bankAccountFormSchema),
    defaultValues: {
      account_name: '',
      account_number: '',
      bank_name: '',
      currency: 'KES',
      opening_balance_minor: 0,
      is_active: true,
    },
  });

  const handleEdit = (account: BankAccount) => {
    setEditingAccount(account);
    form.reset({
      account_name: account.account_name,
      account_number: account.account_number,
      bank_name: account.bank_name,
      currency: account.currency,
      opening_balance_minor: account.opening_balance_minor,
      is_active: account.is_active,
    });
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingAccount(null);
    form.reset({ account_name: '', account_number: '', bank_name: '', currency: 'KES', opening_balance_minor: 0, is_active: true });
    setDialogOpen(true);
  };

  const onSubmit = async (values: BankAccountFormValues) => {
    if (editingAccount) {
      await updateMutation.mutateAsync({ id: editingAccount.id, data: values });
    } else {
      await createMutation.mutateAsync(values);
    }
    setDialogOpen(false);
    setEditingAccount(null);
    form.reset();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Bank Accounts</h1>
            <p className="text-muted-foreground font-bold">Manage linked bank accounts</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreate} className="border-2 border-black shadow">
                <Plus className="mr-2 h-4 w-4" /> Add Account
              </Button>
            </DialogTrigger>
            <DialogContent className="border-2 border-black">
              <DialogHeader>
                <DialogTitle>{editingAccount ? 'Edit Bank Account' : 'Add Bank Account'}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="bank_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Name</FormLabel>
                        <FormControl>
                          <Input {...field} className="border-2 border-black" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="account_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Name</FormLabel>
                        <FormControl>
                          <Input {...field} className="border-2 border-black" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="account_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Number</FormLabel>
                        <FormControl>
                          <Input {...field} className="border-2 border-black" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="border-2 border-black">Cancel</Button>
                    <Button type="submit" className="border-2 border-black shadow">
                      {editingAccount ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>Bank Accounts</CardTitle>
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
                <p className="text-sm font-bold text-destructive">Failed to load bank accounts</p>
                <p className="text-xs text-muted-foreground">{error instanceof Error ? error.message : 'Unknown error'}</p>
              </div>
            )}

            {!isLoading && !isError && accounts.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No bank accounts yet</p>
                <p className="text-sm text-muted-foreground">Add your first bank account to get started</p>
              </div>
            )}

            {!isLoading && !isError && accounts.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th className="p-2 text-left font-bold">Bank</th>
                      <th className="p-2 text-left font-bold">Account Name</th>
                      <th className="p-2 text-left font-bold">Account Number</th>
                      <th className="p-2 text-right font-bold">Balance</th>
                      <th className="p-2 text-left font-bold">Status</th>
                      <th className="p-2 text-left font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map((account) => (
                      <tr key={account.id} className="border-b border-black hover:bg-muted/50">
                        <td className="p-2">{account.bank_name}</td>
                        <td className="p-2">{account.account_name}</td>
                        <td className="p-2 font-mono">{account.account_number}</td>
                        <td className="p-2 text-right font-mono">{formatMoney(account.current_balance_minor)}</td>
                        <td className="p-2">
                          <Badge variant={account.is_active ? 'default' : 'secondary'} className="border-2 border-black">
                            {account.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <div className="flex gap-2">
                            <Button variant="outline" size="icon" onClick={() => handleEdit(account)} className="border-2 border-black">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="icon" onClick={() => deleteMutation.mutate(account.id)} className="border-2 border-black">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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
