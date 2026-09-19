'use client';

import AppLayout from '@/app/app/layout';
import { useTimesheets, useCreateTimesheet, useDeleteTimesheet } from '@/hooks/useTanStackQuery';
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
import { Plus, Trash2 } from 'lucide-react';
import { useProjects } from '@/hooks/useTanStackQuery';

const timesheetFormSchema = z.object({
  project_id: z.string().min(1, 'Project is required'),
  task_id: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  hours: z.coerce.number().min(0.01, 'Hours is required'),
  is_billable: z.boolean(),
  rate_minor: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
});

type TimesheetFormValues = z.infer<typeof timesheetFormSchema>;

const getDefaultValues = (): TimesheetFormValues => ({
  project_id: '',
  task_id: '',
  date: new Date().toISOString().split('T')[0],
  hours: 0,
  is_billable: true,
  rate_minor: 0,
  notes: '',
});

export default function TimesheetsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data, isLoading, isError, error } = useTimesheets();
  const { data: projectsData } = useProjects();
  const createMutation = useCreateTimesheet();
  const deleteMutation = useDeleteTimesheet();
  const timesheets = data?.data ?? [];
  const projects = projectsData?.data ?? [];

  const form = useForm({
    resolver: zodResolver(timesheetFormSchema),
    defaultValues: getDefaultValues(),
  });

  const onSubmit = async (values: TimesheetFormValues) => {
    await createMutation.mutateAsync({
      ...values,
      task_id: values.task_id || null,
      rate_minor: values.rate_minor || 0,
    });
    setDialogOpen(false);
    form.reset();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Timesheets</h1>
            <p className="text-muted-foreground font-bold">Track time spent on projects</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="border-2 border-black shadow">
                <Plus className="mr-2 h-4 w-4" /> Log Time
              </Button>
            </DialogTrigger>
            <DialogContent className="border-2 border-black">
              <DialogHeader>
                <DialogTitle>Log Time</DialogTitle>
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
                    name="date"
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
                    name="hours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hours</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} className="border-2 border-black" />
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
                      Log Time
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>Recent Timesheets</CardTitle>
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
                <p className="text-sm font-bold text-destructive">Failed to load timesheets</p>
              </div>
            )}

            {!isLoading && !isError && timesheets.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No timesheets yet</p>
                <p className="text-sm text-muted-foreground">Log your first time entry to get started</p>
              </div>
            )}

            {!isLoading && !isError && timesheets.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th className="p-2 text-left font-bold">Date</th>
                      <th className="p-2 text-left font-bold">Project</th>
                      <th className="p-2 text-left font-bold">Hours</th>
                      <th className="p-2 text-left font-bold">Billable</th>
                      <th className="p-2 text-left font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timesheets.map((timesheet: { id: string; date: string; hours: number; is_billable: boolean; project?: { name?: string } }) => (
                      <tr key={timesheet.id} className="border-b border-black hover:bg-muted/50">
                        <td className="p-2">{timesheet.date}</td>
                        <td className="p-2">{timesheet.project?.name || '-'}</td>
                        <td className="p-2">{timesheet.hours.toFixed(2)}</td>
                        <td className="p-2">
                          <Badge variant={timesheet.is_billable ? 'default' : 'secondary'} className="border-2 border-black">
                            {timesheet.is_billable ? 'Yes' : 'No'}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => deleteMutation.mutate(timesheet.id)}
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
