'use client';

import AppLayout from '@/app/(app)/layout';
import { useCreateInvoice, useIsPeriodLocked } from '@/hooks/useTanStackQuery';
import { useCustomers } from '@/hooks/useTanStackQuery';
import { useAccounts } from '@/hooks/useTanStackQuery';
import { useTaxRates } from '@/hooks/useTanStackQuery';
import { useProductSearch } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, ArrowLeft, Trash2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { formatMoney, toMinorUnits } from '@soko/utils';
import type { InvoiceItem, TaxRate } from '@soko/domain-types';

const invoiceItemSchema = z.object({
  product_id: z.string().min(1, 'Product is required'),
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unit_price_minor: z.number().min(0, 'Price must be positive'),
  discount_minor: z.number().min(0),
  tax_rate_code: z.string(),
  tax_rate_percentage: z.number(),
});

const invoiceFormSchema = z.object({
  customer_id: z.string().min(1, 'Customer is required'),
  invoice_date: z.string().min(1, 'Date is required'),
  due_date: z.string().min(1, 'Due date is required'),
  notes: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
  subtotal_minor: z.number(),
  tax_total_minor: z.number(),
  discount_total_minor: z.number(),
  grand_total_minor: z.number(),
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

export default function CreateInvoicePage() {
  const createMutation = useCreateInvoice();
  const { data: customersData, isLoading: customersLoading } = useCustomers();
  const { data: accountsData } = useAccounts();
  const { data: taxRatesData, isLoading: taxRatesLoading } = useTaxRates();
  const [productQuery, setProductQuery] = useState('');
  const { data: searchData, isLoading: searchLoading } = useProductSearch(productQuery, 10);
  const customers = customersData?.data ?? [];
  const taxRates = (taxRatesData?.data as TaxRate[]) ?? [];
  const searchResults = searchData?.data ?? [];

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      customer_id: '',
      invoice_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: '',
      items: [],
      subtotal_minor: 0,
      tax_total_minor: 0,
      discount_total_minor: 0,
      grand_total_minor: 0,
    },
  });

  const invoiceDate = form.watch('invoice_date');
  const { isLocked: isInvoicePeriodLocked } = useIsPeriodLocked(invoiceDate);

  const items = form.watch('items');

  useEffect(() => {
    let subtotal = 0;
    let taxTotal = 0;
    items.forEach((item) => {
      const lineSubtotal = (item.quantity * item.unit_price_minor) - item.discount_minor;
      const lineTax = Math.round(lineSubtotal * (item.tax_rate_percentage / 100));
      subtotal += lineSubtotal;
      taxTotal += lineTax;
    });
    const grandTotal = subtotal + taxTotal;
    form.setValue('subtotal_minor', subtotal);
    form.setValue('tax_total_minor', taxTotal);
    form.setValue('grand_total_minor', grandTotal);
  }, [items, form]);

  const addItem = (product?: { id: string; name: string; selling_price_minor: number }) => {
    const currentItems = form.getValues('items');
    if (product) {
      form.setValue('items', [
        ...currentItems,
        {
          product_id: product.id,
          description: product.name,
          quantity: 1,
          unit_price_minor: product.selling_price_minor,
          discount_minor: 0,
          tax_rate_code: 'A',
          tax_rate_percentage: 16,
        },
      ]);
    } else {
      form.setValue('items', [
        ...currentItems,
        {
          product_id: '',
          description: '',
          quantity: 1,
          unit_price_minor: 0,
          discount_minor: 0,
          tax_rate_code: 'A',
          tax_rate_percentage: 16,
        },
      ]);
    }
    setProductQuery('');
  };

  const removeItem = (index: number) => {
    const currentItems = form.getValues('items');
    form.setValue('items', currentItems.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: InvoiceFormValues) => {
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
            <h1 className="text-3xl font-black tracking-tight">Create Invoice</h1>
            <p className="text-muted-foreground font-bold">Create a new customer invoice</p>
          </div>
          <Button variant="outline" asChild className="border-2 border-black">
            <Link href="/invoices"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link>
          </Button>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                            {customers.map((customer) => (
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
                    name="invoice_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Invoice Date</FormLabel>
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
                    <div className="flex gap-2">
                      <div className="relative">
                        <Input
                          placeholder="Search products..."
                          value={productQuery}
                          onChange={(e) => setProductQuery(e.target.value)}
                          className="border-2 border-black"
                        />
                        {searchResults.length > 0 && (
                          <div className="absolute z-10 mt-1 w-full rounded-lg border-2 border-black bg-secondary-background shadow">
                            {searchResults.map((product) => (
                              <div
                                key={product.id}
                                className="cursor-pointer p-2 hover:bg-muted"
                                onClick={() => addItem(product)}
                              >
                                {product.name} - {formatMoney(product.selling_price_minor)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button type="button" variant="outline" onClick={() => addItem()} className="border-2 border-black">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
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
                        <label className="mb-1 block text-xs font-bold">Price</label>
                        <Input
                          type="number"
                          value={item.unit_price_minor / 100}
                          onChange={(e) => {
                            const newItems = [...items];
                            newItems[index].unit_price_minor = toMinorUnits(parseFloat(e.target.value) || 0);
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
                      <div className="col-span-6 md:col-span-1 flex items-end">
                        <Button type="button" variant="destructive" size="icon" onClick={() => removeItem(index)} className="border-2 border-black">
                          <Trash2 className="h-4 w-4" />
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
                  {isInvoicePeriodLocked && (
                    <Alert variant="destructive" className="border-2 border-black">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Period Locked</AlertTitle>
                      <AlertDescription>The selected invoice date falls in a closed accounting period. Creation is disabled.</AlertDescription>
                    </Alert>
                  )}
                  <Button type="submit" disabled={createMutation.isPending || isInvoicePeriodLocked} className="border-2 border-black shadow">
                    {createMutation.isPending ? 'Creating...' : 'Create Invoice'}
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
