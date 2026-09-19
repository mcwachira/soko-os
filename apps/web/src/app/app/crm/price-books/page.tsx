'use client';

import AppLayout from '@/app/app/layout';
import { usePriceBooks, useCreatePriceBook } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreatePriceBookSchema } from '@soko/validation';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';

type PriceBookItem = {
  id: string;
  name: string;
  type: string;
  currency: string;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
};

export default function PriceBooksPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { data, isLoading, isError, error, refetch } = usePriceBooks();
  const createMutation = useCreatePriceBook();
  const priceBooks = (data?.data ?? []) as PriceBookItem[];

  const form = useForm({
    resolver: zodResolver(CreatePriceBookSchema),
    defaultValues: {
      name: '',
      type: 'standard',
      currency: 'KES',
      is_active: true,
      is_default: false,
    },
  });

  const onCreate = form.handleSubmit((values) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        setIsCreateOpen(false);
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
            <h1 className="text-3xl font-black tracking-tight">Price Books</h1>
            <p className="text-muted-foreground font-bold">Manage pricing lists</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="border-2 border-black shadow">
                <Plus className="mr-2 h-4 w-4" />
                Add Price Book
              </Button>
            </DialogTrigger>
            <DialogContent className="border-2 border-black">
              <DialogHeader>
                <DialogTitle className="text-lg font-black">Add Price Book</DialogTitle>
              </DialogHeader>
              <form onSubmit={onCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-bold">Name</Label>
                  <Input {...form.register('name')} className="border-2 border-black" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Type</Label>
                  <Input {...form.register('type')} className="border-2 border-black" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Currency</Label>
                  <Input {...form.register('currency')} className="border-2 border-black" />
                </div>
                <Button type="submit" disabled={createMutation.isPending} className="w-full border-2 border-black shadow">
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Price Book
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search price books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-2 border-black"
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full border-2 border-black" />
                ))}
              </div>
            ) : isError ? (
              <div className="text-center text-destructive">
                <p>Failed to load price books</p>
              </div>
            ) : priceBooks.length === 0 ? (
              <EmptyState title="No price books yet" description="Add your first price book to manage pricing." />
            ) : (
              <div className="space-y-2">
                {priceBooks
                  .filter((pb) => {
                    if (!searchQuery) return true;
                    return pb.name.toLowerCase().includes(searchQuery.toLowerCase());
                  })
                  .map((pb) => (
                    <div
                      key={pb.id}
                      className="flex items-center justify-between rounded-lg border-2 border-black p-4"
                    >
                      <div>
                        <p className="font-bold">{pb.name}</p>
                        <p className="text-sm text-muted-foreground">{pb.type} • {pb.currency}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{pb.is_active ? 'Active' : 'Inactive'}</p>
                      </div>
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
