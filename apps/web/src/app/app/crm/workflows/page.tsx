'use client';

import AppLayout from '@/app/app/layout';
import { useWorkflows, useCreateWorkflow } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateWorkflowSchema } from '@soko/validation';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { EmptyState } from '@/components/shared/empty-state';

type WorkflowItem = {
  id: string;
  name: string;
  trigger_entity?: string | null;
  trigger_event?: string | null;
  is_active: boolean;
  created_at: string;
};

export default function WorkflowsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { data, isLoading, isError, error, refetch } = useWorkflows();
  const createMutation = useCreateWorkflow();
  const workflows = (data?.data ?? []) as WorkflowItem[];

  const form = useForm({
    resolver: zodResolver(CreateWorkflowSchema),
    defaultValues: {
      name: '',
      description: '',
      trigger_entity: '',
      trigger_event: '',
      is_active: true,
      priority: 0,
    },
  });

  const onCreate = form.handleSubmit((values) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        setIsCreateOpen(false);
        form.reset();
        refetch();
      },
    });
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Workflows</h1>
            <p className="text-muted-foreground font-bold">Automate CRM processes</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="border-2 border-black shadow">
                <Plus className="mr-2 h-4 w-4" />
                Add Workflow
              </Button>
            </DialogTrigger>
            <DialogContent className="border-2 border-black">
              <DialogHeader>
                <DialogTitle className="text-lg font-black">Add Workflow</DialogTitle>
              </DialogHeader>
              <form onSubmit={onCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-bold">Name</Label>
                  <Input {...form.register('name')} className="border-2 border-black" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Trigger Entity</Label>
                  <Input {...form.register('trigger_entity')} className="border-2 border-black" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Trigger Event</Label>
                  <Input {...form.register('trigger_event')} className="border-2 border-black" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Description</Label>
                  <Textarea {...form.register('description')} className="border-2 border-black" />
                </div>
                <Button type="submit" disabled={createMutation.isPending} className="w-full border-2 border-black shadow">
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Workflow
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search workflows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-2 border-black"
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full border-2 border-black" />
                ))}
              </div>
            ) : isError ? (
              <div className="text-center text-destructive">
                <p>Failed to load workflows</p>
              </div>
            ) : workflows.length === 0 ? (
              <EmptyState title="No workflows yet" description="Create your first workflow to automate processes." />
            ) : (
              <div className="space-y-2">
                {workflows
                  .filter((workflow) => {
                    if (!searchQuery) return true;
                    return workflow.name.toLowerCase().includes(searchQuery.toLowerCase());
                  })
                  .map((workflow) => (
                    <div
                      key={workflow.id}
                      className="flex items-center justify-between rounded-lg border-2 border-black p-4"
                    >
                      <div>
                        <p className="font-bold">{workflow.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {workflow.trigger_entity || 'No trigger'} {workflow.trigger_event ? `• ${workflow.trigger_event}` : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{workflow.is_active ? 'Active' : 'Inactive'}</p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
