'use client';

import AppLayout from '@/app/app/layout';
import { useContacts, useCreateContact } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus, PhoneCall } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateContactSchema } from '@soko/validation';
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

type ContactItem = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  job_title?: string | null;
  email?: string | null;
  phone?: string | null;
  account_id?: string | null;
  is_decision_maker: boolean;
  created_at: string;
};

export default function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { data, isLoading, isError, error, refetch } = useContacts();
  const createMutation = useCreateContact();
  const contacts = (data?.data ?? []) as ContactItem[];

  const form = useForm({
    resolver: zodResolver(CreateContactSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      job_title: '',
      department: '',
      email: '',
      phone: '',
      whatsapp_phone: '',
      preferred_channel: '',
      is_decision_maker: false,
      is_billing_contact: false,
      is_technical_contact: false,
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
            <h1 className="text-3xl font-black tracking-tight">Contacts</h1>
            <p className="text-muted-foreground font-bold">People linked to accounts and deals</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="border-2 border-black shadow">
                <Plus className="mr-2 h-4 w-4" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent className="border-2 border-black">
              <DialogHeader>
                <DialogTitle className="text-lg font-black">Add Contact</DialogTitle>
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
                  <Label className="font-bold">Job Title</Label>
                  <Input {...form.register('job_title')} className="border-2 border-black" />
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
                  <Label className="font-bold">WhatsApp</Label>
                  <Input {...form.register('whatsapp_phone')} className="border-2 border-black" />
                </div>
                <Button type="submit" disabled={createMutation.isPending} className="w-full border-2 border-black shadow">
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Contact
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
                placeholder="Search contacts..."
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
                <p>Failed to load contacts</p>
              </div>
            ) : contacts.length === 0 ? (
              <EmptyState
                title="No contacts yet"
                description="Add your first contact to start building relationships."
              />
            ) : (
              <div className="space-y-2">
                {contacts
                  .filter((contact) => {
                    if (!searchQuery) return true;
                    const q = searchQuery.toLowerCase();
                    return (
                      (contact.first_name || '').toLowerCase().includes(q) ||
                      (contact.last_name || '').toLowerCase().includes(q) ||
                      (contact.email || '').toLowerCase().includes(q) ||
                      (contact.phone || '').toLowerCase().includes(q)
                    );
                  })
                  .map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between rounded-lg border-2 border-black p-4"
                    >
                      <div>
                        <p className="font-bold">
                          {contact.first_name || contact.last_name
                            ? `${contact.first_name || ''} ${contact.last_name || ''}`.trim()
                            : 'Unnamed Contact'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {contact.job_title || 'No title'} {contact.email ? `• ${contact.email}` : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        {contact.is_decision_maker && (
                          <p className="text-sm font-bold">Decision Maker</p>
                        )}
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
