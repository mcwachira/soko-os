'use client';

import AppLayout from '@/app/app/layout';
import { usePipelines, useCreatePipeline } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus, Target } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreatePipelineSchema } from '@soko/validation';
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

type PipelineItem = {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
};

export default function PipelinesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { data, isLoading, isError, error, refetch } = usePipelines();
  const createMutation = useCreatePipeline();
  const pipelines = (data?.data ?? []) as PipelineItem[];

  const form = useForm({
    resolver: zodResolver(CreatePipelineSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'sales',
      is_active: true,
      is_default: false,
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
            <h1 className="text-3xl font-black tracking-tight">Pipelines</h1>
            <p className="text-muted-foreground font-bold">Configure deal stages and flows</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="border-2 border-black shadow">
                <Plus className="mr-2 h-4 w-4" />
                Add Pipeline
              </Button>
            </DialogTrigger>
            <DialogContent className="border-2 border-black">
              <DialogHeader>
                <DialogTitle className="text-lg font-black">Add Pipeline</DialogTitle>
              </DialogHeader>
              <form onSubmit={onCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-bold">Name</Label>
                  <Input {...form.register('name')} className="border-2 border-black" />
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Type</Label>
                  <Input {...form.register('type')} className="border-2 border-black" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Description</Label>
                  <Textarea {...form.register('description')} className="border-2 border-black" />
                </div>
                <Button type="submit" disabled={createMutation.isPending} className="w-full border-2 border-black shadow">
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Pipeline
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
                placeholder="Search pipelines..."
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
                <p>Failed to load pipelines</p>
              </div>
            ) : pipelines.length === 0 ? (
              <EmptyState
                title="No pipelines yet"
                description="Create your first pipeline to organise deals."
              />
            ) : (
              <div className="space-y-2">
                {pipelines
                  .filter((pipeline) => {
                    if (!searchQuery) return true;
                    return pipeline.name.toLowerCase().includes(searchQuery.toLowerCase());
                  })
                  .map((pipeline) => (
                    <div
                      key={pipeline.id}
                      className="flex items-center justify-between rounded-lg border-2 border-black p-4"
                    >
                      <div>
                        <p className="font-bold">{pipeline.name}</p>
                        <p className="text-sm text-muted-foreground">{pipeline.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{pipeline.is_active ? 'Active' : 'Inactive'}</p>
                        {pipeline.is_default && <p className="text-sm text-muted-foreground">Default</p>}
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
