'use client';

import AppLayout from '@/app/(app)/layout';
import { useCustomers, useCreateCustomer } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus, Phone, Mail, MapPin } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateCustomerSchema } from '@soko/validation';
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

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { data, isLoading, isError, error, refetch } = useCustomers();
  const createCustomerMutation = useCreateCustomer();
  const customers = data?.data ?? [];

  const form = useForm({
    resolver: zodResolver(CreateCustomerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      country: 'Kenya',
      tax_pin: '',
    },
  });

  const onCreate = form.handleSubmit((values) => {
    createCustomerMutation.mutate(values, {
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
            <h1 className="text-3xl font-black tracking-tight">Customers</h1>
            <p className="text-muted-foreground font-bold">Manage your customer relationships</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="border-2 border-black shadow">
                <Plus className="mr-2 h-4 w-4" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="border-2 border-black">
              <DialogHeader>
                <DialogTitle className="text-lg font-black">Add Customer</DialogTitle>
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
                  <Label className="font-bold">Email</Label>
                  <Input type="email" {...form.register('email')} className="border-2 border-black" />
                  {form.formState.errors.email && (
                    <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Phone</Label>
                  <Input {...form.register('phone')} className="border-2 border-black" />
                  {form.formState.errors.phone && (
                    <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Address</Label>
                  <Textarea {...form.register('address')} className="border-2 border-black" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Tax PIN</Label>
                  <Input {...form.register('tax_pin')} className="border-2 border-black" />
                </div>
                <Button type="submit" disabled={createCustomerMutation.isPending} className="w-full border-2 border-black shadow">
                  {createCustomerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Customer
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
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-2 border-black pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full border-2 border-black" />
                ))}
              </div>
            )}

            {isError && (
              <div className="py-8 text-center">
                <p className="text-sm font-bold text-destructive">Failed to load customers</p>
                <p className="text-xs text-muted-foreground">{error instanceof Error ? error.message : 'Unknown error'}</p>
              </div>
            )}

            {!isLoading && !isError && customers.length === 0 && (
              <EmptyState
                title="No customers yet"
                description="Add your first customer to start building relationships."
                action={
                  <Button onClick={() => setIsCreateOpen(true)}>Add Customer</Button>
                }
              />
            )}

            {!isLoading && !isError && customers.length > 0 && (
              <div className="space-y-3">
                {customers.map((customer: { id: string; name: string; email?: string; phone?: string; address?: string; city?: string }) => (
                  <div key={customer.id} className="flex items-center justify-between rounded-lg border-2 border-black p-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-black">{customer.name}</p>
                        <div className="mt-1 space-y-1 text-xs text-muted-foreground">
                          {customer.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              <span>{customer.email}</span>
                            </div>
                          )}
                          {customer.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              <span>{customer.phone}</span>
                            </div>
                          )}
                          {customer.address && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{customer.address}{customer.city ? `, ${customer.city}` : ''}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="icon" className="border-2 border-black">
                      <Mail className="h-4 w-4" />
                    </Button>
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
