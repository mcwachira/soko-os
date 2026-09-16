'use client';

import AppLayout from '@/app/(app)/layout';
import { useAccounts } from '@/hooks/useTanStackQuery';
import { useCreateAccount, useUpdateAccount } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { Account } from '@soko/domain-types';

const accountFormSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['asset', 'liability', 'equity', 'revenue', 'expense']),
  currency: z.string(),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

const typeColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  asset: 'default',
  liability: 'destructive',
  equity: 'secondary',
  revenue: 'outline',
  expense: 'secondary',
};

export default function AccountingPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const { data, isLoading, isError, error } = useAccounts();
  const accounts = data?.data ?? [];

  const createMutation = useCreateAccount();
  const updateMutation = useUpdateAccount();

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      code: '',
      name: '',
      type: 'asset',
      currency: 'KES',
    },
  });

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    form.reset({
      code: account.code,
      name: account.name,
      type: account.type as AccountFormValues['type'],
      currency: account.currency,
    });
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingAccount(null);
    form.reset({ code: '', name: '', type: 'asset', currency: 'KES' });
    setDialogOpen(true);
  };

  const onSubmit = async (values: AccountFormValues) => {
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
            <h1 className="text-3xl font-black tracking-tight">Accounting</h1>
            <p className="text-muted-foreground font-bold">Chart of Accounts and journal entries</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreate} className="border-2 border-black shadow">
                <Plus className="mr-2 h-4 w-4" /> Add Account
              </Button>
            </DialogTrigger>
            <DialogContent className="border-2 border-black">
              <DialogHeader>
                <DialogTitle>{editingAccount ? 'Edit Account' : 'Add Account'}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Code</FormLabel>
                        <FormControl>
                          <Input {...field} className="border-2 border-black" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} className="border-2 border-black" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="type"
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
                            <SelectItem value="asset">Asset</SelectItem>
                            <SelectItem value="liability">Liability</SelectItem>
                            <SelectItem value="equity">Equity</SelectItem>
                            <SelectItem value="revenue">Revenue</SelectItem>
                            <SelectItem value="expense">Expense</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="border-2 border-black">
                      Cancel
                    </Button>
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
            <CardTitle>Chart of Accounts</CardTitle>
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
                <p className="text-sm font-bold text-destructive">Failed to load accounts</p>
                <p className="text-xs text-muted-foreground">{error instanceof Error ? error.message : 'Unknown error'}</p>
              </div>
            )}

            {!isLoading && !isError && accounts.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No accounts yet</p>
                <p className="text-sm text-muted-foreground">Add your first account to get started</p>
              </div>
            )}

            {!isLoading && !isError && accounts.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th className="p-2 text-left font-bold">Code</th>
                      <th className="p-2 text-left font-bold">Name</th>
                      <th className="p-2 text-left font-bold">Type</th>
                      <th className="p-2 text-left font-bold">Currency</th>
                      <th className="p-2 text-left font-bold">Status</th>
                      <th className="p-2 text-left font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map((account) => (
                      <tr key={account.id} className="border-b border-black hover:bg-muted/50">
                        <td className="p-2 font-mono font-bold">{account.code}</td>
                        <td className="p-2">{account.name}</td>
                        <td className="p-2">
                          <Badge variant={typeColors[account.type] || 'secondary'} className="border-2 border-black">
                            {account.type}
                          </Badge>
                        </td>
                        <td className="p-2">{account.currency}</td>
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
