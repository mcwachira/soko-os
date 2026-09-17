'use client';

import AppLayout from '@/app/app/layout';
import { usePriceLists, useCreatePriceList } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';

const priceListFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['retail', 'wholesale', 'vip', 'customer_specific', 'vendor']),
  currency: z.string().length(3).optional(),
  is_active: z.boolean().optional(),
});

type PriceListFormValues = z.infer<typeof priceListFormSchema>;

export default function PriceListsPage() {
  const [open, setOpen] = useState(false);
  const { data, isLoading, isError } = usePriceLists();
  const createMutation = useCreatePriceList();
  const priceLists = data?.data ?? [];

  const form = useForm<PriceListFormValues>({
    resolver: zodResolver(priceListFormSchema),
    defaultValues: {
      name: '',
      type: 'retail',
      currency: 'KES',
      is_active: true,
    },
  });

  const onSubmit = async (values: PriceListFormValues) => {
    await createMutation.mutateAsync(values);
    setOpen(false);
    form.reset();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Price Lists</h1>
            <p className="text-muted-foreground font-bold">Manage tiered pricing</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="border-2 border-black shadow">
                <Plus className="mr-2 h-4 w-4" /> Add Price List
              </Button>
            </DialogTrigger>
            <DialogContent className="border-2 border-black">
              <DialogHeader>
                <DialogTitle>Add Price List</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} className="border-2 border-black" />
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
                            <SelectItem value="retail">Retail</SelectItem>
                            <SelectItem value="wholesale">Wholesale</SelectItem>
                            <SelectItem value="vip">VIP</SelectItem>
                            <SelectItem value="customer_specific">Customer Specific</SelectItem>
                            <SelectItem value="vendor">Vendor</SelectItem>
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
            <CardTitle>Price Lists</CardTitle>
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
                <p className="text-sm font-bold text-destructive">Failed to load price lists</p>
              </div>
            )}

            {!isLoading && !isError && priceLists.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No price lists configured</p>
                <p className="text-sm text-muted-foreground">Add your first price list to get started</p>
              </div>
            )}

            {!isLoading && !isError && priceLists.length > 0 && (
              <div className="space-y-2">
                {priceLists.map((pl: { id: string; name: string; type: string; currency: string; is_active: boolean }) => (
                  <div key={pl.id} className="flex items-center justify-between border-b border-black p-2">
                    <div>
                      <div className="text-sm font-bold">{pl.name}</div>
                      <div className="text-xs text-muted-foreground">{pl.type} · {pl.currency}</div>
                    </div>
                    <Badge variant={pl.is_active ? 'default' : 'secondary'} className="border-2 border-black">
                      {pl.is_active ? 'Active' : 'Inactive'}
                    </Badge>
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
