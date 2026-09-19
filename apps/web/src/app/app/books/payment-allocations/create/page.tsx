'use client';
export const dynamic = 'force-dynamic';

import AppLayout from '@/app/app/layout';
import { useCreatePaymentAllocation } from '@/hooks/useTanStackQuery';
import { useAccountingPayments } from '@/hooks/useTanStackQuery';
import { useInvoices } from '@/hooks/useTanStackQuery';
import { useBills } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { formatMoney, toMinorUnits } from '@soko/utils';

const paymentAllocationFormSchema = z.object({
  payment_id: z.string().min(1, 'Payment is required'),
  allocatable_type: z.string().min(1, 'Type is required'),
  allocatable_id: z.string().min(1, 'Entity is required'),
  allocated_minor: z.number().min(1, 'Amount is required'),
});

type PaymentAllocationFormValues = z.infer<typeof paymentAllocationFormSchema>;

export default function CreatePaymentAllocationPage() {
  const createMutation = useCreatePaymentAllocation();
  const { data: paymentsData, isLoading: paymentsLoading } = useAccountingPayments();
  const { data: invoicesData } = useInvoices();
  const { data: billsData } = useBills();
  const payments = paymentsData?.data ?? [];
  const invoices = invoicesData?.data ?? [];
  const bills = billsData?.data ?? [];

  const [allocatableType, setAllocatableType] = useState<string>('invoice');

  const form = useForm<PaymentAllocationFormValues>({
    resolver: zodResolver(paymentAllocationFormSchema) as Resolver<any>,
    defaultValues: {
      payment_id: '',
      allocatable_type: 'invoice',
      allocatable_id: '',
      allocated_minor: 0,
    },
  });

  const onSubmit = async (values: PaymentAllocationFormValues) => {
    await createMutation.mutateAsync(values);
  };

  if (paymentsLoading) {
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
            <h1 className="text-3xl font-black tracking-tight">Create Payment Allocation</h1>
            <p className="text-muted-foreground font-bold">Allocate a payment to an invoice or bill</p>
          </div>
          <Button variant="outline" asChild className="border-2 border-black">
            <Link href="/payment-allocations"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link>
          </Button>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>Allocation Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="payment_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-2 border-black">
                            <SelectValue placeholder="Select payment" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {payments.map((payment: { id: string; reference?: string; amount_minor: number }) => (
                            <SelectItem key={payment.id} value={payment.id}>
                              {payment.reference || payment.id} - {formatMoney(payment.amount_minor)}
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
                  name="allocatable_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={(value) => { if (value) { field.onChange(value); setAllocatableType(value); form.setValue('allocatable_id', ''); } }} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-2 border-black">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="invoice">Invoice</SelectItem>
                          <SelectItem value="bill">Bill</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="allocatable_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{allocatableType === 'invoice' ? 'Invoice' : 'Bill'}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-2 border-black">
                            <SelectValue placeholder={`Select ${allocatableType}`} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {allocatableType === 'invoice' ? (
                            invoices.map((invoice: { id: string; invoice_number: string }) => (
                              <SelectItem key={invoice.id} value={invoice.id}>
                                {invoice.invoice_number}
                              </SelectItem>
                            ))
                          ) : (
                            bills.map((bill: { id: string; bill_number: string }) => (
                              <SelectItem key={bill.id} value={bill.id}>
                                {bill.bill_number}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="allocated_minor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (KES)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value / 100}
                          onChange={(e) => field.onChange(Math.round((parseFloat(e.target.value) || 0) * 100))}
                          className="border-2 border-black"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" asChild className="border-2 border-black">
                  <Link href="/payment-allocations">Cancel</Link>
                </Button>
                <Button type="submit" disabled={createMutation.isPending} className="border-2 border-black shadow">
                  Create Allocation
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
