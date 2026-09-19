'use client';

import AppLayout from '@/app/app/layout';
import { useTerritories, useCreateTerritory } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateTerritorySchema } from '@soko/validation';
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

type TerritoryItem = {
  id: string;
  name: string;
  code?: string | null;
  type: string;
  country_code: string;
  created_at: string;
};

export default function TerritoriesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { data, isLoading, isError, error, refetch } = useTerritories();
  const createMutation = useCreateTerritory();
  const territories = (data?.data ?? []) as TerritoryItem[];

  const form = useForm({
    resolver: zodResolver(CreateTerritorySchema),
    defaultValues: {
      name: '',
      code: '',
      type: 'region',
      country_code: 'KE',
      parent_territory_id: '',
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
            <h1 className="text-3xl font-black tracking-tight">Territories</h1>
            <p className="text-muted-foreground font-bold">Manage sales regions and territories</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="border-2 border-black shadow">
                <Plus className="mr-2 h-4 w-4" />
                Add Territory
              </Button>
            </DialogTrigger>
            <DialogContent className="border-2 border-black">
              <DialogHeader>
                <DialogTitle className="text-lg font-black">Add Territory</DialogTitle>
              </DialogHeader>
              <form onSubmit={onCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-bold">Name</Label>
                  <Input {...form.register('name')} className="border-2 border-black" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Code</Label>
                  <Input {...form.register('code')} className="border-2 border-black" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Type</Label>
                  <Input {...form.register('type')} className="border-2 border-black" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Country Code</Label>
                  <Input {...form.register('country_code')} className="border-2 border-black" />
                </div>
                <Button type="submit" disabled={createMutation.isPending} className="w-full border-2 border-black shadow">
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Territory
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
                placeholder="Search territories..."
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
                <p>Failed to load territories</p>
              </div>
            ) : territories.length === 0 ? (
              <EmptyState title="No territories yet" description="Add your first territory to organise sales." />
            ) : (
              <div className="space-y-2">
                {territories
                  .filter((territory) => {
                    if (!searchQuery) return true;
                    return territory.name.toLowerCase().includes(searchQuery.toLowerCase());
                  })
                  .map((territory) => (
                    <div
                      key={territory.id}
                      className="flex items-center justify-between rounded-lg border-2 border-black p-4"
                    >
                      <div>
                        <p className="font-bold">{territory.name}</p>
                        <p className="text-sm text-muted-foreground">{territory.type} • {territory.country_code}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{territory.code || 'No code'}</p>
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
