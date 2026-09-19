'use client';
export const dynamic = 'force-dynamic';

import AppLayout from '@/app/app/layout';
import { useCreateDebitNote, useIsPeriodLocked } from '@/hooks/useTanStackQuery';
import { useSuppliers } from '@/hooks/useTanStackQuery';
import { useBills } from '@/hooks/useTanStackQuery';
import type { Supplier } from '@soko/domain-types';
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

const debitNoteItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unit_cost_minor: z.number().min(0, 'Cost must be positive'),
  discount_minor: z.number().min(0),
  tax_rate_percentage: z.number().min(0),
});

const debitNoteFormSchema = z.object({
  supplier_id: z.string().min(1, 'Supplier is required'),
  bill_id: z.string().default(''),
  debit_date: z.string().min(1, 'Date is required'),
  currency: z.string().default('KES'),
  notes: z.string().default(''),
  items: z.array(debitNoteItemSchema).min(1, 'At least one item is required'),
  subtotal_minor: z.number(),
  tax_total_minor: z.number(),
  total_minor: z.number(),
});

type DebitNoteFormValues = z.infer<typeof debitNoteFormSchema>;

export default function CreateDebitNotePage() {
  const createMutation = useCreateDebitNote();
  const { data: suppliersData, isLoading: suppliersLoading } = useSuppliers();
  const { data: billsData } = useBills();
  const suppliers = suppliersData?.data ?? [];
  const bills = billsData?.data ?? [];

  const form = useForm<DebitNoteFormValues>({
    resolver: zodResolver(debitNoteFormSchema) as Resolver<any>,
    defaultValues: {
      supplier_id: '',
      bill_id: '',
      debit_date: new Date().toISOString().split('T')[0],
      currency: 'KES',
      notes: '',
      items: [],
      subtotal_minor: 0,
      tax_total_minor: 0,
      total_minor: 0,
    },
  });

  const debitDate = form.watch('debit_date');
  const { isLocked: isDebitPeriodLocked } = useIsPeriodLocked(debitDate);

  const items = form.watch('items');

  const onSubmit = async (values: DebitNoteFormValues) => {
    await createMutation.mutateAsync(values);
  };

  if (suppliersLoading) {
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
            <h1 className="text-3xl font-black tracking-tight">Create Debit Note</h1>
            <p className="text-muted-foreground font-bold">Create a new vendor debit note</p>
          </div>
          <Button variant="outline" asChild className="border-2 border-black">
            <Link href="/debit-notes"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link>
          </Button>
        </div>

        {isDebitPeriodLocked && (
          <Alert variant="destructive" className="border-2 border-black">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Period Locked</AlertTitle>
            <AlertDescription>
              The selected date falls within a closed accounting period. You cannot create a debit note for this period.
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>Debit Note Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="supplier_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-2 border-black">
                            <SelectValue placeholder="Select supplier" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {suppliers.map((supplier: Supplier) => (
                            <SelectItem key={supplier.id} value={supplier.id}>{supplier.legal_name || supplier.trading_name || 'Unnamed Supplier'}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bill_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Related Bill</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-2 border-black">
                            <SelectValue placeholder="Select bill" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {bills.map((bill: { id: string; bill_number: string }) => (
                            <SelectItem key={bill.id} value={bill.id}>
                              {bill.bill_number}
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
                  name="debit_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Debit Date</FormLabel>
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
                  <Link href="/debit-notes">Cancel</Link>
                </Button>
                <Button type="submit" disabled={createMutation.isPending || isDebitPeriodLocked} className="border-2 border-black shadow">
                  Create Debit Note
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
