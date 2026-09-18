'use client';

import AppLayout from '@/app/app/layout';
import { useLead, useUpdateLead, useConvertLead } from '@/hooks/useTanStackQuery';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, UserPlus, ArrowRight, Eye, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { formatMoney } from '@soko/utils';

const leadFormSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  company_name: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  whatsapp_phone: z.string().optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline' | 'success'> = {
  new: 'secondary',
  contacted: 'outline',
  qualified: 'default',
  unqualified: 'destructive',
  nurturing: 'secondary',
  converted: 'success',
};

export default function LeadDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data, isLoading, isError, error, refetch } = useLead(id);
  const updateMutation = useUpdateLead();
  const convertMutation = useConvertLead();
  const lead = data?.data;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isConvertOpen, setIsConvertOpen] = useState(false);

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
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

  const onEdit = form.handleSubmit((values) => {
    updateMutation.mutate({ id, data: values }, {
      onSuccess: () => {
        setIsEditOpen(false);
        refetch();
        toast.success('Lead updated');
      },
      onError: () => toast.error('Failed to update lead'),
    });
  });

  const onConvert = async () => {
    await convertMutation.mutateAsync({ id });
    setIsConvertOpen(false);
    refetch();
    toast.success('Lead converted');
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Lead Details</h1>
          </div>
          <Card className="border-2 border-border">
            <CardContent>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full border-2 border-border" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (isError || !lead) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="text-center py-8">
            <p className="text-sm font-bold text-destructive">Failed to load lead</p>
            <p className="text-xs text-muted-foreground">{error instanceof Error ? error.message : 'Unknown error'}</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">
              {lead.first_name || lead.last_name
                ? `${lead.first_name || ''} ${lead.last_name || ''}`.trim()
                : lead.company_name || 'Unnamed Lead'}
            </h1>
            <p className="text-muted-foreground font-bold">Lead ID: {lead.id}</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-2 border-border">
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="border-2 border-border">
                <DialogHeader>
                  <DialogTitle className="text-lg font-black">Edit Lead</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={onEdit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="first_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input {...field} className="border-2 border-border" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="last_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input {...field} className="border-2 border-border" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="company_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company</FormLabel>
                          <FormControl>
                            <Input {...field} className="border-2 border-border" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} className="border-2 border-border" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input {...field} className="border-2 border-border" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="whatsapp_phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>WhatsApp Phone</FormLabel>
                          <FormControl>
                            <Input {...field} className="border-2 border-border" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="source"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Source</FormLabel>
                          <FormControl>
                            <Input {...field} className="border-2 border-border" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea {...field} className="border-2 border-border" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} className="border-2 border-border">Cancel</Button>
                      <Button type="submit" disabled={updateMutation.isPending} className="border-2 border-border shadow">
                        {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            <Dialog open={isConvertOpen} onOpenChange={setIsConvertOpen}>
              <DialogContent className="border-2 border-border">
                <DialogHeader>
                  <DialogTitle className="text-lg font-black">Convert Lead</DialogTitle>
                  <p className="text-sm text-muted-foreground">This will create an Account, Contact, and Deal from this lead.</p>
                </DialogHeader>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsConvertOpen(false)} className="border-2 border-border">Cancel</Button>
                  <Button onClick={onConvert} disabled={convertMutation.isPending} className="border-2 border-border shadow">
                    {convertMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <UserPlus className="mr-2 h-4 w-4" /> Convert Lead
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="border-2 border-border lg:col-span-2">
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-bold">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-base text-xs font-bold border-2 border-border ${getStatusBadgeClass(lead.status)}`}>
                      {lead.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Score</p>
                  <p className="font-bold text-lg">{lead.score}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">First Name</p>
                  <p className="font-bold">{lead.first_name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Name</p>
                  <p className="font-bold">{lead.last_name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Company</p>
                  <p className="font-bold">{lead.company_name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Source</p>
                  <p className="font-bold">{lead.source || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-bold">{lead.email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-bold">{lead.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">WhatsApp</p>
                  <p className="font-bold">{lead.whatsapp_phone || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-bold">{new Date(lead.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {lead.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="font-bold whitespace-pre-wrap">{lead.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 border-border">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild className="w-full border-2 border-border shadow justify-start">
                <a href={`/crm/leads/${lead.id}/convert`}>
                  <UserPlus className="mr-2 h-4 w-4" /> Convert to Opportunity
                </a>
              </Button>
              <Button asChild className="w-full border-2 border-border justify-start">
                <a href={`/crm/accounts?lead=${lead.id}`}>
                  <span>Create Account</span>
                </a>
              </Button>
              <Button asChild className="w-full border-2 border-border justify-start">
                <a href={`/crm/contacts?lead=${lead.id}`}>
                  <span>Create Contact</span>
                </a>
              </Button>
              <Button asChild className="w-full border-2 border-border justify-start">
                <a href={`/crm/deals?lead=${lead.id}`}>
                  <span>Create Deal</span>
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border-2 border-border lg:col-span-3">
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-8">Activity timeline will be shown here once activities are linked to this lead.</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

function getStatusBadgeClass(status: string): string {
  const colors: Record<string, string> = {
    new: 'bg-secondary-background',
    contacted: 'bg-background',
    qualified: 'bg-main text-main-foreground',
    unqualified: 'bg-destructive text-destructive-foreground',
    nurturing: 'bg-secondary-background',
    converted: 'bg-success text-success-foreground',
  };
  return colors[status] || 'bg-secondary-background';
}