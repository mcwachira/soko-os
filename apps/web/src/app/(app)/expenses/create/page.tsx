'use client';

import AppLayout from '@/app/(app)/layout';
import { useCreateExpense, useIsPeriodLocked } from '@/hooks/useTanStackQuery';
import { useAccounts } from '@/hooks/useTanStackQuery';
import { useExpenseCategories } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { formatMoney, toMinorUnits } from '@soko/utils';

const expenseFormSchema = z.object({
  payee: z.string().min(1, 'Payee is required'),
  expense_category_id: z.string().min(1, 'Category is required'),
  account_id: z.string().min(1, 'Account is required'),
  amount_minor: z.number().min(1, 'Amount is required'),
  tax: z.number().min(0),
  expense_date: z.string().min(1, 'Date is required'),
  description: z.string().min(1, 'Description is required'),
  notes: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

export default function CreateExpensePage() {
  const createMutation = useCreateExpense();
  const { data: accountsData, isLoading: accountsLoading } = useAccounts();
  const { data: categoriesData, isLoading: categoriesLoading } = useExpenseCategories();
  const accounts = accountsData?.data ?? [];
  const categories = categoriesData?.data ?? [];

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      payee: '',
      expense_category_id: '',
      account_id: '',
      amount_minor: 0,
      tax: 0,
      expense_date: new Date().toISOString().split('T')[0],
      description: '',
      notes: '',
    },
  });

  const expenseDate = form.watch('expense_date');
  const { isLocked: isExpensePeriodLocked } = useIsPeriodLocked(expenseDate);

  const onSubmit = async (values: ExpenseFormValues) => {
    await createMutation.mutateAsync(values);
  };

  if (accountsLoading || categoriesLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64 border-2 border-black" />
          <Skeleton className="h-96 w-full border-2 border-black" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Create Expense</h1>
            <p className="text-muted-foreground font-bold">Record a new business expense</p>
          </div>
          <Button variant="outline" asChild className="border-2 border-black">
            <Link href="/expenses"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link>
          </Button>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>Expense Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="payee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payee</FormLabel>
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
                        <Textarea {...field} className="border-2 border-black" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="expense_category_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-2 border-black">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((cat: { id: string; name: string }) => (
                              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-2 border-black">
                              <SelectValue placeholder="Select account" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {accounts.map((acc) => (
                              <SelectItem key={acc.id} value={acc.id}>{acc.code} - {acc.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="amount_minor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount (KES)</FormLabel>
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
                    name="tax"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax</FormLabel>
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
                </div>
                <FormField
                  control={form.control}
                  name="expense_date"
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
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="border-2 border-black" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  {isExpensePeriodLocked && (
                    <Alert variant="destructive" className="border-2 border-black">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Period Locked</AlertTitle>
                      <AlertDescription>The selected expense date falls in a closed accounting period. Creation is disabled.</AlertDescription>
                    </Alert>
                  )}
                  <Button type="submit" disabled={createMutation.isPending || isExpensePeriodLocked} className="border-2 border-black shadow">
                    {createMutation.isPending ? 'Saving...' : 'Save Expense'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
