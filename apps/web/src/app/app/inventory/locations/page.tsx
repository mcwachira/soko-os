'use client';

import AppLayout from '@/app/app/layout';
import { useWarehouses } from '@/hooks/useTanStackQuery';
import { useBins } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Building2, Archive, MapPin } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Warehouse, Bin } from '@soko/domain-types';

export default function LocationsPage() {
  const [query, setQuery] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  
  const { data: warehousesData } = useWarehouses();
  const { data: binsData } = useBins();

  const warehouses = (warehousesData?.data ?? []) as Warehouse[];
  const bins = (binsData?.data ?? []) as Bin[];

  const activeWarehouses = warehouses.filter(w => w.is_active);
  const activeBins = bins.filter(b => b.status === 'active');

  // Group bins by warehouse
  const binsByWarehouse = useMemo(() => {
    const map = new Map<string, Bin[]>();
    activeBins.forEach(bin => {
      if (!map.has(bin.warehouse_id)) {
        map.set(bin.warehouse_id, []);
      }
      map.get(bin.warehouse_id)!.push(bin);
    });
    return map;
  }, [activeBins]);

  const renderWarehouse = (warehouse: Warehouse) => {
    const warehouseBins = binsByWarehouse.get(warehouse.id) ?? [];
    
    return (
      <div key={warehouse.id} className="border-2 border-black rounded-lg overflow-hidden">
        <div className="bg-muted p-4 border-b-2 border-black flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-main" />
            <div>
              <p className="font-black">{warehouse.name}</p>
              <p className="text-xs text-muted-foreground">Code: {warehouse.code}</p>
            </div>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <p>{warehouseBins.length} bins</p>
          </div>
        </div>
        <div className="p-4">
          {warehouseBins.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No bins in this warehouse</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {warehouseBins.slice(0, 20).map(bin => (
                <Badge key={bin.id} variant="outline" className="border-2 border-black cursor-pointer hover:bg-muted">
                  {bin.name}
                  {bin.aisle && ` - A${bin.aisle}`}
                  {bin.rack && ` R${bin.rack}`}
                  {bin.shelf && ` S${bin.shelf}`}
                </Badge>
              ))}
              {warehouseBins.length > 20 && (
                <Badge variant="secondary" className="border-2 border-black">
                  +{warehouseBins.length - 20} more
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Locations</h1>
            <p className="text-muted-foreground font-bold">Manage warehouse bins and storage locations</p>
          </div>
          <Button className="border-2 border-black">
            <Plus className="mr-2 h-4 w-4" /> Add Location
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-2 border-black">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-main" />
                <CardTitle className="text-sm font-bold text-muted-foreground">Warehouses</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">{activeWarehouses.length}</div>
              <p className="text-sm text-muted-foreground">Active warehouses</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-black">
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-main" />
                <CardTitle className="text-sm font-bold text-muted-foreground">Bins</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">{activeBins.length}</div>
              <p className="text-sm text-muted-foreground">Active bins</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search locations..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="border-2 border-black pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {activeWarehouses.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No warehouses found</p>
                <p className="text-sm text-muted-foreground">Create a warehouse to start organizing locations</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeWarehouses
                  .filter(w => !query || w.name.toLowerCase().includes(query.toLowerCase()) || w.code.toLowerCase().includes(query.toLowerCase()))
                  .map(renderWarehouse)
                }
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}