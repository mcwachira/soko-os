'use client';

import AppLayout from '@/app/app/layout';
import { useWarehouses } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Warehouse } from '@soko/domain-types';

export default function WarehousesPage() {
  const { data, isLoading, isError, error } = useWarehouses();
  const warehouses = data?.data ?? [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Warehouses</h1>
            <p className="text-muted-foreground font-bold">
              Manage your warehouses and storage locations
            </p>
          </div>
          <Button className="border-2 border-black">
            <Plus className="mr-2 h-4 w-4" /> Add Warehouse
          </Button>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>Warehouses</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full border-2 border-black" />
                ))}
              </div>
            )}

            {isError && (
              <div className="py-8 text-center">
                <p className="text-sm font-bold text-destructive">Failed to load warehouses</p>
                <p className="text-xs text-muted-foreground">{error instanceof Error ? error.message : 'Unknown error'}</p>
              </div>
            )}

            {!isLoading && !isError && warehouses.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No warehouses found</p>
                <p className="text-sm text-muted-foreground">Add your first warehouse to start tracking inventory</p>
              </div>
            )}

            {!isLoading && !isError && warehouses.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {warehouses.map((warehouse: Warehouse) => (
                  <div key={warehouse.id} className="rounded-lg border-2 border-black p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-black">{warehouse.name}</p>
                      <Badge variant={warehouse.is_active ? 'default' : 'secondary'} className="border-2 border-black">
                        {warehouse.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Code: {warehouse.code}</p>
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
