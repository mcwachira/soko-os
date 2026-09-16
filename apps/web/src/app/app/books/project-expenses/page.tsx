'use client';

import AppLayout from '@/app/app/layout';
import { useProjectExpenses, useCreateProjectExpense, useDeleteProjectExpense } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { useProjects } from '@/hooks/useTanStackQuery';

const projectExpenseFormSchema = z.object({
  project_id: z.string().min(1, 'Project is required'),
  task_id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  amount_minor: z.coerce.number().min(1, 'Amount is required'),
  currency: z.string().default('KES'),
  is_billable: z.boolean().default(false),
});

type ProjectExpenseFormValues = z.infer<typeof projectExpenseFormSchema>;

export default function ProjectExpensesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data, isLoading, isError, error } = useProjectExpenses();
  const { data: projectsData } = useProjects();
  const createMutation = useCreateProjectExpense();
  const deleteMutation = useDeleteProjectExpense();
  const expenses = data?.data ?? [];
  const projects = projectsData?.data ?? [];

  const form = useForm({
    resolver: zodResolver(projectExpenseFormSchema),
    defaultValues: {
      project_id: '',
      task_id: '',
      name: '',
      description: '',
      amount_minor: 0,
      currency: 'KES',
      is_billable: false,
    },
  });

  const onSubmit = async (values: ProjectExpenseFormValues) => {
    await createMutation.mutateAsync({
      ...values,
      task_id: values.task_id || null,
    });
    setDialogOpen(false);
    form.reset();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Project Expenses</h1>
            <p className="text-muted-foreground font-bold">Track project-related expenses</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="border-2 border-black shadow">
                <Plus className="mr-2 h-4 w-4" /> Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="border-2 border-black">
              <DialogHeader>
                <DialogTitle>Add Project Expense</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="project_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-2 border-black">
                              <SelectValue placeholder="Select project" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {projects.map((project: { id: string; name: string }) => (
                              <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                    name="amount_minor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount (minor)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} className="border-2 border-black" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="border-2 border-black">
                      Cancel
                    </Button>
                    <Button type="submit" className="border-2 border-black shadow">
                      Add
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>Project Expenses</CardTitle>
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
                <p className="text-sm font-bold text-destructive">Failed to load expenses</p>
              </div>
            )}

            {!isLoading && !isError && expenses.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No expenses yet</p>
                <p className="text-sm text-muted-foreground">Add your first project expense to get started</p>
              </div>
            )}

            {!isLoading && !isError && expenses.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th className="p-2 text-left font-bold">Name</th>
                      <th className="p-2 text-left font-bold">Amount</th>
                      <th className="p-2 text-left font-bold">Billable</th>
                      <th className="p-2 text-left font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((expense: { id: string; name: string; amount_minor: number; is_billable: boolean }) => (
                      <tr key={expense.id} className="border-b border-black hover:bg-muted/50">
                        <td className="p-2 font-bold">{expense.name}</td>
                        <td className="p-2">KES {(expense.amount_minor / 100).toFixed(2)}</td>
                        <td className="p-2">
                          <Badge variant={expense.is_billable ? 'default' : 'secondary'} className="border-2 border-black">
                            {expense.is_billable ? 'Yes' : 'No'}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => deleteMutation.mutate(expense.id)}
                            className="border-2 border-black"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
