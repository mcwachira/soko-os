'use client';

import AppLayout from '@/app/app/layout';
import { useCrmAccounts, useCreateCrmAccount } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus, Handshake } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateCrmAccountSchema } from '@soko/validation';
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

type CrmAccountItem = {
  id: string;
  legal_name?: string | null;
  trading_name?: string | null;
  account_type: string;
  industry?: string | null;
  phone?: string | null;
  email?: string | null;
  city?: string | null;
  created_at: string;
};

export default function CrmAccountsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { data, isLoading, isError, error, refetch } = useCrmAccounts();
  const createMutation = useCreateCrmAccount();
  const accounts = (data?.data ?? []) as CrmAccountItem[];

  const form = useForm({
    resolver: zodResolver(CreateCrmAccountSchema),
    defaultValues: {
      legal_name: '',
      trading_name: '',
      account_type: 'prospect',
      industry: '',
      country_code: 'KE',
      county: '',
      city: '',
      address: '',
      website: '',
      phone: '',
      email: '',
      credit_limit_minor: 0,
      payment_terms: '',
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
            <h1 className="text-3xl font-black tracking-tight">Accounts</h1>
            <p className="text-muted-foreground font-bold">Manage organisations and partner accounts</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="border-2 border-black shadow">
                <Plus className="mr-2 h-4 w-4" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent className="border-2 border-black">
              <DialogHeader>
                <DialogTitle className="text-lg font-black">Add Account</DialogTitle>
              </DialogHeader>
              <form onSubmit={onCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-bold">Legal Name</Label>
                  <Input {...form.register('legal_name')} className="border-2 border-black" />
                  {form.formState.errors.legal_name && (
                    <p className="text-sm text-destructive">{form.formState.errors.legal_name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Trading Name</Label>
                  <Input {...form.register('trading_name')} className="border-2 border-black" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Industry</Label>
                  <Input {...form.register('industry')} className="border-2 border-black" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Phone</Label>
                  <Input {...form.register('phone')} className="border-2 border-black" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Email</Label>
                  <Input type="email" {...form.register('email')} className="border-2 border-black" />
                  {form.formState.errors.email && (
                    <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">City</Label>
                  <Input {...form.register('city')} className="border-2 border-black" />
                </div>
                <Button type="submit" disabled={createMutation.isPending} className="w-full border-2 border-black shadow">
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
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
                placeholder="Search accounts..."
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
                <p>Failed to load accounts</p>
              </div>
            ) : accounts.length === 0 ? (
              <EmptyState
                title="No accounts yet"
                description="Add your first account to start building relationships."
              />
            ) : (
              <div className="space-y-2">
                {accounts
                  .filter((account) => {
                    if (!searchQuery) return true;
                    const q = searchQuery.toLowerCase();
                    return (
                      (account.legal_name || '').toLowerCase().includes(q) ||
                      (account.trading_name || '').toLowerCase().includes(q) ||
                      (account.industry || '').toLowerCase().includes(q)
                    );
                  })
                  .map((account) => (
                    <div
                      key={account.id}
                      className="flex items-center justify-between rounded-lg border-2 border-black p-4"
                    >
                      <div>
                        <p className="font-bold">{account.legal_name || account.trading_name || 'Unnamed Account'}</p>
                        <p className="text-sm text-muted-foreground">
                          {account.industry || 'No industry'} {account.city ? `• ${account.city}` : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold capitalize">{account.account_type}</p>
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
