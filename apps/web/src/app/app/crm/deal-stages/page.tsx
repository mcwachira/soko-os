'use client';

import AppLayout from '@/app/app/layout';
import { useDealStages, useCreateDealStage } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateDealStageSchema } from '@soko/validation';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';

type DealStageItem = {
  id: string;
  name: string;
  position: number;
  probability_percentage: number;
  created_at: string;
};

export default function DealStagesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { data, isLoading, isError, error, refetch } = useDealStages('');
  const createMutation = useCreateDealStage();
  const stages = (data?.data ?? []) as DealStageItem[];

  const form = useForm({
    resolver: zodResolver(CreateDealStageSchema),
    defaultValues: {
      pipeline_id: '',
      name: '',
      description: '',
      position: 0,
      probability_percentage: 0,
    },
  });

  const onCreate = form.handleSubmit((values) => {
    createMutation.mutate({ pipelineId: values.pipeline_id, data: values }, {
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
            <h1 className="text-3xl font-black tracking-tight">Deal Stages</h1>
            <p className="text-muted-foreground font-bold">Manage pipeline stages</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="border-2 border-black shadow">
                <Plus className="mr-2 h-4 w-4" />
                Add Stage
              </Button>
            </DialogTrigger>
            <DialogContent className="border-2 border-black">
              <DialogHeader>
                <DialogTitle className="text-lg font-black">Add Stage</DialogTitle>
              </DialogHeader>
              <form onSubmit={onCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-bold">Pipeline ID</Label>
                  <Input {...form.register('pipeline_id')} className="border-2 border-black" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Name</Label>
                  <Input {...form.register('name')} className="border-2 border-black" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold">Position</Label>
                    <Input type="number" {...form.register('position')} className="border-2 border-black" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Probability %</Label>
                    <Input type="number" {...form.register('probability_percentage')} className="border-2 border-black" />
                  </div>
                </div>
                <Button type="submit" disabled={createMutation.isPending} className="w-full border-2 border-black shadow">
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Stage
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
                placeholder="Search stages..."
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
                <p>Failed to load stages</p>
              </div>
            ) : stages.length === 0 ? (
              <EmptyState title="No stages yet" description="Create your first stage to organise your pipeline." />
            ) : (
              <div className="space-y-2">
                {stages
                  .filter((stage) => {
                    if (!searchQuery) return true;
                    return stage.name.toLowerCase().includes(searchQuery.toLowerCase());
                  })
                  .map((stage) => (
                    <div
                      key={stage.id}
                      className="flex items-center justify-between rounded-lg border-2 border-black p-4"
                    >
                      <div>
                        <p className="font-bold">{stage.name}</p>
                        <p className="text-sm text-muted-foreground">Position: {stage.position}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{stage.probability_percentage}%</p>
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
