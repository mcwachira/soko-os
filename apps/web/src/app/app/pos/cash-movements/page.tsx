'use client';

import AppLayout from '@/app/app/layout';
import { useCashMovements, useCreateCashMovement } from '@/hooks/useTanStackQuery';
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

const movementFormSchema = z.object({
  movement_type: z.enum(['cash_in', 'cash_out', 'safe_drop', 'float']),
  amount_minor: z.coerce.number().min(1),
  notes: z.string().optional(),
});

function formatMoney(minor: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2,
  }).format(minor / 100);
}

type MovementFormValues = z.infer<typeof movementFormSchema>;

const typeColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  cash_in: 'default',
  cash_out: 'destructive',
  safe_drop: 'secondary',
  float: 'outline',
};

export default function CashMovementsPage() {
  const [open, setOpen] = useState(false);
  const { data, isLoading, isError } = useCashMovements();
  const createMutation = useCreateCashMovement();
  const movements = data?.data ?? [];

  const form = useForm<MovementFormValues>({
    resolver: zodResolver(movementFormSchema),
    defaultValues: {
      movement_type: 'cash_in',
      amount_minor: 0,
      notes: '',
    },
  });

  const onSubmit = async (values: MovementFormValues) => {
    // Convert to minor units for API
    const apiValues = {
      ...values,
      amount_minor: Math.round(values.amount_minor * 100),
    };
    await createMutation.mutateAsync(apiValues);
    setOpen(false);
    form.reset();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Cash Movements</h1>
            <p className="text-muted-foreground font-bold">Track cash in, out, and safe drops</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="border-2 border-black shadow">
                <Plus className="mr-2 h-4 w-4" /> New Movement
              </Button>
            </DialogTrigger>
            <DialogContent className="border-2 border-black">
              <DialogHeader>
                <DialogTitle>Record Cash Movement</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="movement_type"
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
                            <SelectItem value="cash_in">Cash In</SelectItem>
                            <SelectItem value="cash_out">Cash Out</SelectItem>
                            <SelectItem value="safe_drop">Safe Drop</SelectItem>
                            <SelectItem value="float">Float</SelectItem>
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
                        <FormLabel>Amount (KES)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            {...field} 
                            className="border-2 border-black" 
                            placeholder="0.00"
                          />
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
                          <Input {...field} className="border-2 border-black" />
                        </FormControl>
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
            <CardTitle>Recent Movements</CardTitle>
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
                <p className="text-sm font-bold text-destructive">Failed to load movements</p>
              </div>
            )}

            {!isLoading && !isError && movements.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No movements yet</p>
              </div>
            )}

            {!isLoading && !isError && movements.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th className="p-2 text-left font-bold">Type</th>
                      <th className="p-2 text-left font-bold">Amount</th>
                      <th className="p-2 text-left font-bold">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movements.map((movement: { id: string; movement_type: string; amount_minor: number; notes?: string }) => (
                      <tr key={movement.id} className="border-b border-black hover:bg-muted/50">
                        <td className="p-2">
                          <Badge variant={typeColors[movement.movement_type] || 'secondary'} className="border-2 border-black">
                            {movement.movement_type}
                          </Badge>
                        </td>
                        <td className="p-2 font-bold">{formatMoney(movement.amount_minor)}</td>
                        <td className="p-2">{movement.notes || '-'}</td>
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
