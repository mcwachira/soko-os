'use client';
export const dynamic = 'force-dynamic';

import AppLayout from '@/app/app/layout';
import { useCreateQuote, useIsPeriodLocked } from '@/hooks/useTanStackQuery';
import { useCustomers } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { formatMoney, toMinorUnits } from '@soko/utils';

const quoteItemSchema = z.object({
  product_id: z.string().min(1, 'Product is required'),
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unit_price_minor: z.number().min(0, 'Price must be positive'),
  discount_minor: z.number().min(0),
  tax_rate_percentage: z.number().min(0),
});

const quoteFormSchema = z.object({
  customer_id: z.string().min(1, 'Customer is required'),
  quote_date: z.string().min(1, 'Date is required'),
  expiry_date: z.string().default(''),
  currency: z.string().default('KES'),
  discount_minor: z.number().min(0),
  notes: z.string().default(''),
  items: z.array(quoteItemSchema).min(1, 'At least one item is required'),
  subtotal_minor: z.number(),
  tax_total_minor: z.number(),
  grand_total_minor: z.number(),
});

type QuoteFormValues = z.infer<typeof quoteFormSchema>;

export default function CreateQuotePage() {
  const createMutation = useCreateQuote();
  const { data: customersData, isLoading: customersLoading } = useCustomers();
  const customers = customersData?.data ?? [];

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema) as Resolver<any>,
    defaultValues: {
      customer_id: '',
      quote_date: new Date().toISOString().split('T')[0],
      expiry_date: '',
      currency: 'KES',
      discount_minor: 0,
      notes: '',
      items: [],
      subtotal_minor: 0,
      tax_total_minor: 0,
      grand_total_minor: 0,
    },
  });

  const quoteDate = form.watch('quote_date');
  const { isLocked: isQuotePeriodLocked } = useIsPeriodLocked(quoteDate);

  const items = form.watch('items');

  const onSubmit = async (values: QuoteFormValues) => {
    await createMutation.mutateAsync(values);
  };

  if (customersLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64 border-2 border-black" />
          <Skeleton className="h-96 w-full border-2 border-black" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Create Quote</h1>
            <p className="text-muted-foreground font-bold">Create a new customer quotation</p>
          </div>
          <Button variant="outline" asChild className="border-2 border-black">
            <Link href="/quotes"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link>
          </Button>
        </div>

        {isQuotePeriodLocked && (
          <Alert variant="destructive" className="border-2 border-black">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Period Locked</AlertTitle>
            <AlertDescription>
              The selected date falls within a closed accounting period. You cannot create a quote for this period.
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>Quote Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quote_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quote Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="border-2 border-black" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expiry_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="border-2 border-black" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <FormControl>
                        <Input {...field} className="border-2 border-black" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="border-2 border-black" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" asChild className="border-2 border-black">
                  <Link href="/quotes">Cancel</Link>
                </Button>
                <Button type="submit" disabled={createMutation.isPending || isQuotePeriodLocked} className="border-2 border-black shadow">
                  Create Quote
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
