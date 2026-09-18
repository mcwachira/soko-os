'use client';

import AppLayout from '@/app/app/layout';
import { useLeads, useCreateLead } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateLeadSchema } from '@soko/validation';
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
import { useQueryClient } from '@tanstack/react-query';

type LeadItem = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  company_name?: string | null;
  email?: string | null;
  phone?: string | null;
  status: string;
  score: number;
  created_at: string;
};

export default function LeadsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { data, isLoading, isError, error, refetch } = useLeads();
  const createMutation = useCreateLead();
  const leads = (data?.data ?? []) as LeadItem[];

  const form = useForm({
    resolver: zodResolver(CreateLeadSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      company_name: '',
      email: '',
      phone: '',
      whatsapp_phone: '',
      source: '',
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
            <h1 className="text-3xl font-black tracking-tight">Leads</h1>
            <p className="text-muted-foreground font-bold">Capture and nurture prospective buyers</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="border-2 border-black shadow">
                <Plus className="mr-2 h-4 w-4" />
                Add Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="border-2 border-black">
              <DialogHeader>
                <DialogTitle className="text-lg font-black">Add Lead</DialogTitle>
              </DialogHeader>
              <form onSubmit={onCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold">First Name</Label>
                    <Input {...form.register('first_name')} className="border-2 border-black" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Last Name</Label>
                    <Input {...form.register('last_name')} className="border-2 border-black" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Company</Label>
                  <Input {...form.register('company_name')} className="border-2 border-black" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Email</Label>
                  <Input type="email" {...form.register('email')} className="border-2 border-black" />
                  {form.formState.errors.email && (
                    <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Phone</Label>
                  <Input {...form.register('phone')} className="border-2 border-black" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">WhatsApp Phone</Label>
                  <Input {...form.register('whatsapp_phone')} className="border-2 border-black" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Source</Label>
                  <Input {...form.register('source')} className="border-2 border-black" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Notes</Label>
                  <Textarea {...form.register('notes')} className="border-2 border-black" />
                </div>
                <Button type="submit" disabled={createMutation.isPending} className="w-full border-2 border-black shadow">
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Lead
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
                placeholder="Search leads..."
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
                <p>Failed to load leads</p>
              </div>
            ) : leads.length === 0 ? (
              <EmptyState
                title="No leads yet"
                description="Add your first lead to start tracking your pipeline."
              />
            ) : (
              <div className="space-y-2">
                {leads
                  .filter((lead) => {
                    if (!searchQuery) return true;
                    const q = searchQuery.toLowerCase();
                    return (
                      (lead.first_name || '').toLowerCase().includes(q) ||
                      (lead.last_name || '').toLowerCase().includes(q) ||
                      (lead.company_name || '').toLowerCase().includes(q) ||
                      (lead.email || '').toLowerCase().includes(q) ||
                      (lead.phone || '').toLowerCase().includes(q)
                    );
                  })
                  .map((lead) => (
                    <div
                      key={lead.id}
                      className="flex items-center justify-between rounded-lg border-2 border-black p-4"
                    >
                      <div>
                        <p className="font-bold">
                          {lead.first_name || lead.last_name
                            ? `${lead.first_name || ''} ${lead.last_name || ''}`.trim()
                            : lead.company_name || 'Unnamed Lead'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {lead.email || lead.phone || 'No contact info'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{lead.status.replace('_', ' ')}</p>
                        <p className="text-sm text-muted-foreground">Score: {lead.score}</p>
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
