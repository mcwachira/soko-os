'use client';

import AppLayout from '@/app/app/layout';
import { useDeals, useCreateDeal } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus, Target } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateDealSchema } from '@soko/validation';
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

type DealItem = {
  id: string;
  deal_name: string;
  currency: string;
  value_minor: number;
  status: string;
  expected_close_date?: string | null;
  created_at: string;
};

export default function DealsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { data, isLoading, isError, error, refetch } = useDeals();
  const createMutation = useCreateDeal();
  const deals = (data?.data ?? []) as DealItem[];

  const form = useForm({
    resolver: zodResolver(CreateDealSchema),
    defaultValues: {
      deal_name: '',
      pipeline_id: '',
      stage_id: '',
      currency: 'KES',
      value_minor: 0,
      expected_close_date: '',
      notes: '',
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
            <h1 className="text-3xl font-black tracking-tight">Deals</h1>
            <p className="text-muted-foreground font-bold">Track opportunities through your pipeline</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="border-2 border-black shadow">
                <Plus className="mr-2 h-4 w-4" />
                Add Deal
              </Button>
            </DialogTrigger>
            <DialogContent className="border-2 border-black">
              <DialogHeader>
                <DialogTitle className="text-lg font-black">Add Deal</DialogTitle>
              </DialogHeader>
              <form onSubmit={onCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-bold">Deal Name</Label>
                  <Input {...form.register('deal_name')} className="border-2 border-black" />
                  {form.formState.errors.deal_name && (
                    <p className="text-sm text-destructive">{form.formState.errors.deal_name.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold">Pipeline ID</Label>
                    <Input {...form.register('pipeline_id')} className="border-2 border-black" />
                    {form.formState.errors.pipeline_id && (
                      <p className="text-sm text-destructive">{form.formState.errors.pipeline_id.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Stage ID</Label>
                    <Input {...form.register('stage_id')} className="border-2 border-black" />
                    {form.formState.errors.stage_id && (
                      <p className="text-sm text-destructive">{form.formState.errors.stage_id.message}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold">Currency</Label>
                    <Input {...form.register('currency')} className="border-2 border-black" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Value (minor units)</Label>
                    <Input type="number" {...form.register('value_minor')} className="border-2 border-black" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Expected Close Date</Label>
                  <Input type="date" {...form.register('expected_close_date')} className="border-2 border-black" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Notes</Label>
                  <Textarea {...form.register('notes')} className="border-2 border-black" />
                </div>
                <Button type="submit" disabled={createMutation.isPending} className="w-full border-2 border-black shadow">
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Deal
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
                placeholder="Search deals..."
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
                <p>Failed to load deals</p>
              </div>
            ) : deals.length === 0 ? (
              <EmptyState
                title="No deals yet"
                description="Create your first deal to start tracking revenue."
              />
            ) : (
              <div className="space-y-2">
                {deals
                  .filter((deal) => {
                    if (!searchQuery) return true;
                    const q = searchQuery.toLowerCase();
                    return deal.deal_name.toLowerCase().includes(q);
                  })
                  .map((deal) => (
                    <div
                      key={deal.id}
                      className="flex items-center justify-between rounded-lg border-2 border-black p-4"
                    >
                      <div>
                        <p className="font-bold">{deal.deal_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {deal.currency} {(deal.value_minor / 100).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold capitalize">{deal.status.replace('_', ' ')}</p>
                        <p className="text-sm text-muted-foreground">
                          {deal.expected_close_date ? `Close: ${deal.expected_close_date}` : 'No date'}
                        </p>
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
