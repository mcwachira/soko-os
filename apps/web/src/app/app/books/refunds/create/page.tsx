'use client';
export const dynamic = 'force-dynamic';

import AppLayout from '@/app/app/layout';
import { useCreateRefund, useIsPeriodLocked } from '@/hooks/useTanStackQuery';
import { useSales } from '@/hooks/useTanStackQuery';
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

const refundFormSchema = z.object({
  sale_id: z.string().min(1, 'Sale is required'),
  refund_amount_minor: z.number().min(1, 'Refund amount is required'),
  reason: z.string().min(1, 'Reason is required'),
  notes: z.string().default(''),
});

type RefundFormValues = z.infer<typeof refundFormSchema>;

export default function CreateRefundPage() {
  const createMutation = useCreateRefund();
  const { data: salesData, isLoading: salesLoading } = useSales();
  const sales = salesData?.data ?? [];

  const form = useForm<RefundFormValues>({
    resolver: zodResolver(refundFormSchema) as Resolver<any>,
    defaultValues: {
      sale_id: '',
      refund_amount_minor: 0,
      reason: '',
      notes: '',
    },
  });

  const refundDate = new Date().toISOString().split('T')[0];
  const { isLocked: isRefundPeriodLocked } = useIsPeriodLocked(refundDate);

  const onSubmit = async (values: RefundFormValues) => {
    await createMutation.mutateAsync(values);
  };

  if (salesLoading) {
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
            <h1 className="text-3xl font-black tracking-tight">Create Refund</h1>
            <p className="text-muted-foreground font-bold">Process a customer refund</p>
          </div>
          <Button variant="outline" asChild className="border-2 border-black">
            <Link href="/refunds"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link>
          </Button>
        </div>

        {isRefundPeriodLocked && (
          <Alert variant="destructive" className="border-2 border-black">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Period Locked</AlertTitle>
            <AlertDescription>
              The selected date falls within a closed accounting period. You cannot create a refund for this period.
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>Refund Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sale_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sale</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-2 border-black">
                            <SelectValue placeholder="Select sale" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sales.map((sale: { id: string; receipt_number: string; grand_total_minor: number }) => (
                            <SelectItem key={sale.id} value={sale.id}>
                              {sale.receipt_number} - {formatMoney(sale.grand_total_minor)}
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
                  name="refund_amount_minor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Refund Amount (KES)</FormLabel>
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
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason</FormLabel>
                    <FormControl>
                      <Input {...field} className="border-2 border-black" />
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
                      <Textarea {...field} className="border-2 border-black" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" asChild className="border-2 border-black">
                  <Link href="/refunds">Cancel</Link>
                </Button>
                <Button type="submit" disabled={createMutation.isPending || isRefundPeriodLocked} className="border-2 border-black shadow">
                  Create Refund
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
