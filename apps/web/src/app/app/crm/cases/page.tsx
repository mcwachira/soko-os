'use client';

import AppLayout from '@/app/app/layout';
import { useCases, useCreateCase } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus, Ticket } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateCaseSchema } from '@soko/validation';
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

type CaseItem = {
  id: string;
  subject: string;
  priority: string;
  status: string;
  category?: string | null;
  channel?: string | null;
  created_at: string;
};

export default function CasesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { data, isLoading, isError, error, refetch } = useCases();
  const createMutation = useCreateCase();
  const cases = (data?.data ?? []) as CaseItem[];

  const form = useForm({
    resolver: zodResolver(CreateCaseSchema),
    defaultValues: {
      subject: '',
      description: '',
      priority: 'medium',
      category: '',
      channel: '',
      resolution: '',
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
            <h1 className="text-3xl font-black tracking-tight">Cases</h1>
            <p className="text-muted-foreground font-bold">Track support and service requests</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="border-2 border-black shadow">
                <Plus className="mr-2 h-4 w-4" />
                Add Case
              </Button>
            </DialogTrigger>
            <DialogContent className="border-2 border-black">
              <DialogHeader>
                <DialogTitle className="text-lg font-black">Add Case</DialogTitle>
              </DialogHeader>
              <form onSubmit={onCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-bold">Subject</Label>
                  <Input {...form.register('subject')} className="border-2 border-black" />
                  {form.formState.errors.subject && (
                    <p className="text-sm text-destructive">{form.formState.errors.subject.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Category</Label>
                  <Input {...form.register('category')} className="border-2 border-black" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Channel</Label>
                  <Input {...form.register('channel')} className="border-2 border-black" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Description</Label>
                  <Textarea {...form.register('description')} className="border-2 border-black" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Resolution</Label>
                  <Textarea {...form.register('resolution')} className="border-2 border-black" />
                </div>
                <Button type="submit" disabled={createMutation.isPending} className="w-full border-2 border-black shadow">
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Case
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
                placeholder="Search cases..."
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
                <p>Failed to load cases</p>
              </div>
            ) : cases.length === 0 ? (
              <EmptyState
                title="No cases yet"
                description="Create your first case to start resolving issues."
              />
            ) : (
              <div className="space-y-2">
                {cases
                  .filter((c) => {
                    if (!searchQuery) return true;
                    return c.subject.toLowerCase().includes(searchQuery.toLowerCase());
                  })
                  .map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between rounded-lg border-2 border-black p-4"
                    >
                      <div>
                        <p className="font-bold">{c.subject}</p>
                        <p className="text-sm text-muted-foreground">
                          {c.category || 'Uncategorised'} {c.channel ? `• ${c.channel}` : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold capitalize">{c.priority}</p>
                        <p className="text-sm text-muted-foreground capitalize">{c.status.replace('_', ' ')}</p>
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
