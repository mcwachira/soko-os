'use client';

import AppLayout from '@/app/(app)/layout';
import { useExpenses } from '@/hooks/useTanStackQuery';
import { useCreateExpense } from '@/hooks/useTanStackQuery';
import { useAccounts } from '@/hooks/useTanStackQuery';
import { useExpenseCategories } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { formatMoney } from '@soko/utils';
import type { Expense } from '@soko/domain-types';

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

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  submitted: 'outline',
  approved: 'default',
  rejected: 'destructive',
  paid: 'default',
  reimbursed: 'default',
};

export default function ExpensesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data, isLoading, isError, error } = useExpenses();
  const { data: accountsData } = useAccounts();
  const { data: categoriesData } = useExpenseCategories();
  const createMutation = useCreateExpense();
  const expenses = data?.data ?? [];
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

  const onSubmit = async (values: ExpenseFormValues) => {
    await createMutation.mutateAsync(values);
    setDialogOpen(false);
    form.reset();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Expenses</h1>
            <p className="text-muted-foreground font-bold">Track business expenses</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="border-2 border-black shadow">
                <Plus className="mr-2 h-4 w-4" /> Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto border-2 border-black">
              <DialogHeader>
                <DialogTitle>Add Expense</DialogTitle>
              </DialogHeader>
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
                      name="tax"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tax</FormLabel>
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
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="border-2 border-black">Cancel</Button>
                    <Button type="submit" className="border-2 border-black shadow">Save</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>Expenses</CardTitle>
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
                <p className="text-sm font-bold text-destructive">Failed to load expenses</p>
                <p className="text-xs text-muted-foreground">{error instanceof Error ? error.message : 'Unknown error'}</p>
              </div>
            )}

            {!isLoading && !isError && expenses.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No expenses yet</p>
                <p className="text-sm text-muted-foreground">Add your first expense to get started</p>
              </div>
            )}

            {!isLoading && !isError && expenses.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th className="p-2 text-left font-bold">#</th>
                      <th className="p-2 text-left font-bold">Payee</th>
                      <th className="p-2 text-left font-bold">Amount</th>
                      <th className="p-2 text-left font-bold">Tax</th>
                      <th className="p-2 text-left font-bold">Total</th>
                      <th className="p-2 text-left font-bold">Status</th>
                      <th className="p-2 text-left font-bold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((expense: Expense) => (
                      <tr key={expense.id} className="border-b border-black hover:bg-muted/50">
                        <td className="p-2 font-mono">{expense.reference_number}</td>
                        <td className="p-2">{expense.description}</td>
                        <td className="p-2 font-mono">{formatMoney(expense.amount_minor)}</td>
                        <td className="p-2 font-mono">{formatMoney(0)}</td>
                        <td className="p-2 font-mono font-bold">{formatMoney(expense.amount_minor)}</td>
                        <td className="p-2">
                          <Badge variant={statusColors[expense.status] || 'secondary'} className="border-2 border-black capitalize">
                            {expense.status}
                          </Badge>
                        </td>
                        <td className="p-2">{new Date(expense.expense_date).toLocaleDateString()}</td>
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
