'use client';

import AppLayout from '@/app/app/layout';
import { useCampaigns, useCreateCampaign } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus, Megaphone } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateCampaignSchema } from '@soko/validation';
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

type CampaignItem = {
  id: string;
  name: string;
  type: string;
  status: string;
  channel?: string | null;
  budget_minor: number;
  currency: string;
  start_date?: string | null;
  end_date?: string | null;
  created_at: string;
};

export default function CampaignsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { data, isLoading, isError, error, refetch } = useCampaigns();
  const createMutation = useCreateCampaign();
  const campaigns = (data?.data ?? []) as CampaignItem[];

  const form = useForm({
    resolver: zodResolver(CreateCampaignSchema),
    defaultValues: {
      name: '',
      type: 'marketing',
      channel: '',
      start_date: '',
      end_date: '',
      budget_minor: 0,
      currency: 'KES',
      description: '',
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
            <h1 className="text-3xl font-black tracking-tight">Campaigns</h1>
            <p className="text-muted-foreground font-bold">Plan and track marketing and sales campaigns</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="border-2 border-black shadow">
                <Plus className="mr-2 h-4 w-4" />
                Add Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="border-2 border-black">
              <DialogHeader>
                <DialogTitle className="text-lg font-black">Add Campaign</DialogTitle>
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
                  <Label className="font-bold">Channel</Label>
                  <Input {...form.register('channel')} className="border-2 border-black" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold">Start Date</Label>
                    <Input type="date" {...form.register('start_date')} className="border-2 border-black" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">End Date</Label>
                    <Input type="date" {...form.register('end_date')} className="border-2 border-black" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Description</Label>
                  <Textarea {...form.register('description')} className="border-2 border-black" />
                </div>
                <Button type="submit" disabled={createMutation.isPending} className="w-full border-2 border-black shadow">
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Campaign
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
                placeholder="Search campaigns..."
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
                <p>Failed to load campaigns</p>
              </div>
            ) : campaigns.length === 0 ? (
              <EmptyState
                title="No campaigns yet"
                description="Launch your first campaign to reach prospects."
              />
            ) : (
              <div className="space-y-2">
                {campaigns
                  .filter((campaign) => {
                    if (!searchQuery) return true;
                    return campaign.name.toLowerCase().includes(searchQuery.toLowerCase());
                  })
                  .map((campaign) => (
                    <div
                      key={campaign.id}
                      className="flex items-center justify-between rounded-lg border-2 border-black p-4"
                    >
                      <div>
                        <p className="font-bold">{campaign.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {campaign.type} {campaign.channel ? `• ${campaign.channel}` : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold capitalize">{campaign.status.replace('_', ' ')}</p>
                        <p className="text-sm text-muted-foreground">
                          {campaign.currency} {(campaign.budget_minor / 100).toFixed(2)}
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
