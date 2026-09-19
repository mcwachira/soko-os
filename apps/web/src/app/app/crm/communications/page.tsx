'use client';

import AppLayout from '@/app/app/layout';
import { useCommunications, useCreateCommunication } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateCommunicationSchema } from '@soko/validation';
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

type CommunicationItem = {
  id: string;
  channel: string;
  direction: string;
  status: string;
  subject?: string | null;
  created_at: string;
};

export default function CommunicationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { data, isLoading, isError, error, refetch } = useCommunications();
  const createMutation = useCreateCommunication();
  const communications = (data?.data ?? []) as CommunicationItem[];

  const form = useForm({
    resolver: zodResolver(CreateCommunicationSchema),
    defaultValues: {
      channel: 'email',
      direction: 'outbound',
      from_address: '',
      to_address: '',
      subject: '',
      body: '',
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
            <h1 className="text-3xl font-black tracking-tight">Communications</h1>
            <p className="text-muted-foreground font-bold">Log emails, WhatsApp, SMS and calls</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="border-2 border-black shadow">
                <Plus className="mr-2 h-4 w-4" />
                Add Communication
              </Button>
            </DialogTrigger>
            <DialogContent className="border-2 border-black">
              <DialogHeader>
                <DialogTitle className="text-lg font-black">Add Communication</DialogTitle>
              </DialogHeader>
              <form onSubmit={onCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-bold">Channel</Label>
                  <Input {...form.register('channel')} className="border-2 border-black" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Direction</Label>
                  <Input {...form.register('direction')} className="border-2 border-black" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Subject</Label>
                  <Input {...form.register('subject')} className="border-2 border-black" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Body</Label>
                  <Textarea {...form.register('body')} className="border-2 border-black" />
                </div>
                <Button type="submit" disabled={createMutation.isPending} className="w-full border-2 border-black shadow">
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Communication
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
                placeholder="Search communications..."
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
                <p>Failed to load communications</p>
              </div>
            ) : communications.length === 0 ? (
              <EmptyState title="No communications yet" description="Log your first communication to start tracking interactions." />
            ) : (
              <div className="space-y-2">
                {communications
                  .filter((comm) => {
                    if (!searchQuery) return true;
                    return (comm.subject || '').toLowerCase().includes(searchQuery.toLowerCase());
                  })
                  .map((comm) => (
                    <div
                      key={comm.id}
                      className="flex items-center justify-between rounded-lg border-2 border-black p-4"
                    >
                      <div>
                        <p className="font-bold">{comm.subject || comm.channel}</p>
                        <p className="text-sm text-muted-foreground">{comm.channel} • {comm.direction}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold capitalize">{comm.status.replace('_', ' ')}</p>
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
