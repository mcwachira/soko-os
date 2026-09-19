'use client';

import AppLayout from '@/app/app/layout';
import { useCreateBill, useIsPeriodLocked } from '@/hooks/useTanStackQuery';
import { useSuppliers } from '@/hooks/useTanStackQuery';
import { useAccounts } from '@/hooks/useTanStackQuery';
import { useTaxRates } from '@/hooks/useTanStackQuery';
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

const billItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unit_cost_minor: z.number().min(0, 'Cost must be positive'),
  discount_minor: z.number().min(0),
  tax_rate_code: z.string(),
  tax_rate_percentage: z.number(),
});

const billFormSchema = z.object({
  supplier_id: z.string().min(1, 'Supplier is required'),
  bill_date: z.string().min(1, 'Date is required'),
  due_date: z.string().min(1, 'Due date is required'),
  notes: z.string().optional(),
  items: z.array(billItemSchema).min(1, 'At least one item is required'),
  subtotal_minor: z.number(),
  tax_total_minor: z.number(),
  grand_total_minor: z.number(),
});

type BillFormValues = z.infer<typeof billFormSchema>;

export default function CreateBillPage() {
  const createMutation = useCreateBill();
  const { data: suppliersData, isLoading: suppliersLoading } = useSuppliers();
  const { data: accountsData } = useAccounts();
  const { data: taxRatesData, isLoading: taxRatesLoading } = useTaxRates();
  const suppliers = suppliersData?.data ?? [];
  const accounts = accountsData?.data ?? [];
  const taxRates = taxRatesData?.data ?? [];

  const form = useForm<BillFormValues>({
    resolver: zodResolver(billFormSchema) as Resolver<any>,
    defaultValues: {
      supplier_id: '',
      bill_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: '',
      items: [],
      subtotal_minor: 0,
      tax_total_minor: 0,
      grand_total_minor: 0,
    },
  });

  const billDate = form.watch('bill_date');
  const { isLocked: isBillPeriodLocked } = useIsPeriodLocked(billDate);

  const items = form.watch('items');

  const onSubmit = async (values: BillFormValues) => {
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
            <h1 className="text-3xl font-black tracking-tight">Create Bill</h1>
            <p className="text-muted-foreground font-bold">Create a new supplier bill</p>
          </div>
          <Button variant="outline" asChild className="border-2 border-black">
            <Link href="/bills"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link>
          </Button>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>Bill Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                    name="bill_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bill Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} className="border-2 border-black" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="due_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} className="border-2 border-black" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-bold">Items</h3>
                    <Button type="button" variant="outline" onClick={() => form.setValue('items', [...items, { description: '', quantity: 1, unit_cost_minor: 0, discount_minor: 0, tax_rate_code: 'A', tax_rate_percentage: 16 }])} className="border-2 border-black">
                      Add Item
                    </Button>
                  </div>

                  {items.map((item, index) => (
                    <div key={index} className="mb-4 grid grid-cols-12 gap-2 rounded-lg border-2 border-black p-4">
                      <div className="col-span-12 md:col-span-4">
                        <label className="mb-1 block text-xs font-bold">Description</label>
                        <Input
                          value={item.description}
                          onChange={(e) => {
                            const newItems = [...items];
                            newItems[index].description = e.target.value;
                            form.setValue('items', newItems);
                          }}
                          className="border-2 border-black"
                        />
                      </div>
                      <div className="col-span-6 md:col-span-2">
                        <label className="mb-1 block text-xs font-bold">Qty</label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const newItems = [...items];
                            newItems[index].quantity = parseInt(e.target.value) || 1;
                            form.setValue('items', newItems);
                          }}
                          className="border-2 border-black"
                        />
                      </div>
                      <div className="col-span-6 md:col-span-2">
                        <label className="mb-1 block text-xs font-bold">Cost</label>
                        <Input
                          type="number"
                          value={item.unit_cost_minor / 100}
                          onChange={(e) => {
                            const newItems = [...items];
                            newItems[index].unit_cost_minor = toMinorUnits(parseFloat(e.target.value) || 0);
                            form.setValue('items', newItems);
                          }}
                          className="border-2 border-black"
                        />
                      </div>
                      <div className="col-span-6 md:col-span-2">
                        <label className="mb-1 block text-xs font-bold">Tax %</label>
                        <Input
                          type="number"
                          value={item.tax_rate_percentage}
                          onChange={(e) => {
                            const newItems = [...items];
                            newItems[index].tax_rate_percentage = parseFloat(e.target.value) || 0;
                            form.setValue('items', newItems);
                          }}
                          className="border-2 border-black"
                        />
                      </div>
                      <div className="col-span-6 md:col-span-2 flex items-end">
                        <Button type="button" variant="destructive" size="sm" onClick={() => {
                          form.setValue('items', items.filter((_, i) => i !== index));
                        }} className="border-2 border-black">
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 rounded-lg border-2 border-black bg-muted/30 p-4">
                  <div>
                    <p className="text-sm font-bold">Subtotal</p>
                    <p className="text-lg font-black">{formatMoney(form.getValues('subtotal_minor'))}</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold">Tax</p>
                    <p className="text-lg font-black">{formatMoney(form.getValues('tax_total_minor'))}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-bold">Grand Total</p>
                    <p className="text-2xl font-black">{formatMoney(form.getValues('grand_total_minor'))}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  {isBillPeriodLocked && (
                    <Alert variant="destructive" className="border-2 border-black">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Period Locked</AlertTitle>
                      <AlertDescription>The selected bill date falls in a closed accounting period. Creation is disabled.</AlertDescription>
                    </Alert>
                  )}
                  <Button type="submit" disabled={createMutation.isPending || isBillPeriodLocked} className="border-2 border-black shadow">
                    {createMutation.isPending ? 'Creating...' : 'Create Bill'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
