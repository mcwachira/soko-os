'use client';

import AppLayout from '@/app/app/layout';
import { useQuickKeys, useCreateQuickKey, useDeleteQuickKey } from '@/hooks/useTanStackQuery';
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
import { Plus, Trash2 } from 'lucide-react';

const quickKeyFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  action_type: z.enum(['product', 'variant', 'service', 'custom']),
  action_data: z.record(z.string(), z.unknown()),
  color: z.string().optional(),
  position: z.coerce.number().min(0).optional(),
});

type QuickKeyFormValues = z.infer<typeof quickKeyFormSchema>;

export default function QuickKeysPage() {
  const [open, setOpen] = useState(false);
  const { data, isLoading, isError } = useQuickKeys();
  const createMutation = useCreateQuickKey();
  const deleteMutation = useDeleteQuickKey();
  const keys = data?.data ?? [];

  const form = useForm<QuickKeyFormValues>({
    resolver: zodResolver(quickKeyFormSchema),
    defaultValues: {
      name: '',
      action_type: 'product',
      action_data: {},
      color: '#000000',
      position: 0,
    },
  });

  const onSubmit = async (values: QuickKeyFormValues) => {
    await createMutation.mutateAsync(values);
    setOpen(false);
    form.reset();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Quick Keys</h1>
            <p className="text-muted-foreground font-bold">Configure POS quick access buttons</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="border-2 border-black shadow">
                <Plus className="mr-2 h-4 w-4" /> Add Quick Key
              </Button>
            </DialogTrigger>
            <DialogContent className="border-2 border-black">
              <DialogHeader>
                <DialogTitle>Add Quick Key</DialogTitle>
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
                    name="action_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Action Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-2 border-black">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="product">Product</SelectItem>
                            <SelectItem value="variant">Variant</SelectItem>
                            <SelectItem value="service">Service</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
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
            <CardTitle>Quick Keys</CardTitle>
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
                <p className="text-sm font-bold text-destructive">Failed to load quick keys</p>
              </div>
            )}

            {!isLoading && !isError && keys.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No quick keys configured</p>
                <p className="text-sm text-muted-foreground">Add your first quick key to get started</p>
              </div>
            )}

            {!isLoading && !isError && keys.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {keys.map((key: { id: string; name: string; action_type: string; color: string }) => (
                  <Card key={key.id} className="border-2 border-black">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-bold">{key.name}</div>
                          <div className="text-xs text-muted-foreground">{key.action_type}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(key.id)}
                          className="h-6 w-6"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
