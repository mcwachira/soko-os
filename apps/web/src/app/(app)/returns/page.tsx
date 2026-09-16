'use client';

import AppLayout from '@/app/(app)/layout';
import { useReturns, useCreateReturn } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { CreateReturnSchema } from '@soko/validation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { fromMinorUnits } from '@soko/utils';

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  received: 'default',
  completed: 'default',
  cancelled: 'destructive',
};

export default function ReturnsPage() {
  const [returnOpen, setReturnOpen] = useState(false);
  const { data, isLoading, isError, error, refetch } = useReturns();
  const createReturnMutation = useCreateReturn();
  const returns = data?.data ?? [];

  const form = useForm({
    resolver: zodResolver(CreateReturnSchema),
    defaultValues: {
      sale_id: '',
      return_type: 'refund',
      reason: '',
      notes: '',
      items: [{ sale_item_id: '', quantity: 1 }],
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    createReturnMutation.mutate(values, {
      onSuccess: () => {
        setReturnOpen(false);
        form.reset();
        refetch();
      },
    });
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Returns</h1>
            <p className="text-muted-foreground font-bold">Process customer returns and refunds</p>
          </div>
          <Dialog open={returnOpen} onOpenChange={setReturnOpen}>
            <DialogTrigger asChild>
              <Button className="border-2 border-black shadow">
                <RotateCcw className="mr-2 h-4 w-4" />
                New Return
              </Button>
            </DialogTrigger>
            <DialogContent className="border-2 border-black">
              <DialogHeader>
                <DialogTitle className="text-lg font-black">Create Return</DialogTitle>
              </DialogHeader>
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-bold">Sale ID</Label>
                  <Input {...form.register('sale_id')} className="border-2 border-black" />
                  {form.formState.errors.sale_id && (
                    <p className="text-sm text-destructive">{form.formState.errors.sale_id.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Return Type</Label>
                  <select
                    {...form.register('return_type')}
                    className="w-full rounded-lg border-2 border-black bg-background p-2 font-bold"
                  >
                    <option value="refund">Refund</option>
                    <option value="exchange">Exchange</option>
                    <option value="store_credit">Store Credit</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Reason</Label>
                  <Textarea {...form.register('reason')} className="border-2 border-black" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Notes</Label>
                  <Textarea {...form.register('notes')} className="border-2 border-black" />
                </div>
                <Button type="submit" disabled={createReturnMutation.isPending} className="w-full border-2 border-black shadow">
                  {createReturnMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Return
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>Recent Returns</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full border-2 border-black" />
                ))}
              </div>
            )}

            {isError && (
              <div className="py-8 text-center">
                <p className="text-sm font-bold text-destructive">Failed to load returns</p>
                <p className="text-xs text-muted-foreground">{error instanceof Error ? error.message : 'Unknown error'}</p>
              </div>
            )}

            {!isLoading && !isError && returns.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No returns yet</p>
                <p className="text-sm text-muted-foreground">Returns will appear here after processing</p>
              </div>
            )}

            {!isLoading && !isError && returns.length > 0 && (
              <div className="space-y-3">
                {returns.map((returnItem) => (
                  <div key={returnItem.id} className="flex items-center justify-between rounded-lg border-2 border-black p-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-black">Return #{returnItem.return_number}</p>
                        <p className="text-xs text-muted-foreground">Sale: {returnItem.sale_id}</p>
                        <p className="text-xs text-muted-foreground">{new Date(returnItem.created_at).toLocaleString()}</p>
                      </div>
                      <Badge variant={statusVariant[returnItem.status] || 'secondary'} className="border-2 border-black">
                        {returnItem.status}
                      </Badge>
                    </div>
                    <Button variant="outline" size="icon" className="border-2 border-black">
                      <Eye className="h-4 w-4" />
                    </Button>
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
