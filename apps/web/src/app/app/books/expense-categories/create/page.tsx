'use client';
export const dynamic = 'force-dynamic';

import AppLayout from '@/app/app/layout';
import { useCreateExpenseCategory } from '@/hooks/useTanStackQuery';
import { useAccounts } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

const expenseCategoryFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  account_id: z.string().uuid().optional().nullable(),
  is_active: z.boolean().default(true),
});

type ExpenseCategoryFormValues = z.infer<typeof expenseCategoryFormSchema>;

export default function CreateExpenseCategoryPage() {
  const createMutation = useCreateExpenseCategory();
  const { data: accountsData } = useAccounts();
  const accounts = accountsData?.data ?? [];

  const form = useForm<ExpenseCategoryFormValues>({
    resolver: zodResolver(expenseCategoryFormSchema) as Resolver<any>,
    defaultValues: {
      name: '',
      code: '',
      account_id: null,
      is_active: true,
    },
  });

  const onSubmit = async (values: ExpenseCategoryFormValues) => {
    await createMutation.mutateAsync(values);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Create Expense Category</h1>
            <p className="text-muted-foreground font-bold">Add a new expense category</p>
          </div>
          <Button variant="outline" asChild className="border-2 border-black">
            <Link href="/expense-categories"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link>
          </Button>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>Category Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  name="account_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || undefined}>
                        <FormControl>
                          <SelectTrigger className="border-2 border-black">
                            <SelectValue placeholder="Select account" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {accounts.map((account: { id: string; code: string; name: string }) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.code} - {account.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" asChild className="border-2 border-black">
                  <Link href="/expense-categories">Cancel</Link>
                </Button>
                <Button type="submit" disabled={createMutation.isPending} className="border-2 border-black shadow">
                  Create Category
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
