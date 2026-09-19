'use client';

import AppLayout from '@/app/app/layout';
import { useStoreCredits, useCreateStoreCredit } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { fromMinorUnits } from '@soko/utils';
import { useCustomers } from '@/hooks/useTanStackQuery';

const creditFormSchema = z.object({
  customer_id: z.string().min(1, 'Customer is required'),
  amount_minor: z.coerce.number().min(1, 'Amount is required'),
  type: z.enum(['issued', 'redeemed', 'refunded', 'adjusted']),
  notes: z.string().optional(),
});

type CreditFormValues = z.infer<typeof creditFormSchema>;

const typeColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  issued: 'default',
  redeemed: 'secondary',
  refunded: 'outline',
  adjusted: 'destructive',
};

export default function StoreCreditsPage() {
  const [open, setOpen] = useState(false);
  const { data, isLoading, isError } = useStoreCredits();
  const { data: customersData } = useCustomers();
  const createMutation = useCreateStoreCredit();
  const credits = data?.data ?? [];
  const customers = customersData?.data ?? [];

  const form = useForm<CreditFormValues>({
    resolver: zodResolver(creditFormSchema),
    defaultValues: {
      customer_id: '',
      amount_minor: 0,
      type: 'issued',
      notes: '',
    },
  });

  const onSubmit = async (values: CreditFormValues) => {
    await createMutation.mutateAsync(values);
    setOpen(false);
    form.reset();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Store Credits</h1>
            <p className="text-muted-foreground font-bold">Manage customer store credits</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="border-2 border-black shadow">
                <Plus className="mr-2 h-4 w-4" /> Issue Credit
              </Button>
            </DialogTrigger>
            <DialogContent className="border-2 border-black">
              <DialogHeader>
                <DialogTitle>Issue Store Credit</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="customer_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-2 border-black">
                              <SelectValue placeholder="Select customer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {customers.map((customer: { id: string; name: string }) => (
                              <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="amount_minor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount (minor)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} className="border-2 border-black" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-2 border-black">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="issued">Issued</SelectItem>
                            <SelectItem value="redeemed">Redeemed</SelectItem>
                            <SelectItem value="refunded">Refunded</SelectItem>
                            <SelectItem value="adjusted">Adjusted</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-2 border-black">
                      Cancel
                    </Button>
                    <Button type="submit" className="border-2 border-black shadow">Save</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>Store Credits</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full border-2 border-black" />
                ))}
              </div>
            )}

            {isError && (
              <div className="py-8 text-center">
                <p className="text-sm font-bold text-destructive">Failed to load store credits</p>
              </div>
            )}

            {!isLoading && !isError && credits.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No store credits yet</p>
              </div>
            )}

            {!isLoading && !isError && credits.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th className="p-2 text-left font-bold">Customer</th>
                      <th className="p-2 text-left font-bold">Amount</th>
                      <th className="p-2 text-left font-bold">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {credits.map((credit: { id: string; customer?: { name?: string }; amount_minor: number; type: string }) => (
                      <tr key={credit.id} className="border-b border-black hover:bg-muted/50">
                        <td className="p-2 font-bold">{credit.customer?.name || '-'}</td>
                        <td className="p-2">{fromMinorUnits(credit.amount_minor)}</td>
                        <td className="p-2">
                          <Badge variant={typeColors[credit.type] || 'secondary'} className="border-2 border-black">
                            {credit.type}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
