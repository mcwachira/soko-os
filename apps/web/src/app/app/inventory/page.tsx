'use client';

import { useInventoryMovements, useWarehouses } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { InventoryMovement, Warehouse } from '@soko/domain-types';
import { fromMinorUnits } from '@soko/utils';

const movementTypeColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  purchase_receive: 'default',
  sale: 'destructive',
  sale_return: 'outline',
  adjustment_in: 'default',
  adjustment_out: 'destructive',
  transfer_in: 'outline',
  transfer_out: 'destructive',
  stocktake: 'secondary',
};

export default function InventoryPage() {
  const [query, setQuery] = useState('');
  const { data: movementsData, isLoading: movementsLoading, isError: movementsError } = useInventoryMovements();
  const { data: warehouses } = useWarehouses();

  const movements = movementsData?.data ?? [];
  const warehouseMap = new Map((warehouses?.data ?? []).map((w: Warehouse) => [w.id, w.name]));

  const filtered = movements.filter((m: InventoryMovement) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      m.product_id.toLowerCase().includes(q) ||
      m.movement_type.toLowerCase().includes(q) ||
      (m.notes && m.notes.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Inventory</h1>
        <p className="text-muted-foreground font-bold">
          Track stock levels and movements across your warehouses
        </p>
      </div>

      <Card className="border-2 border-black">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by product ID, movement type, or notes..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="border-2 border-black pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {movementsLoading && (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full border-2 border-black" />
              ))}
            </div>
          )}

          {movementsError && (
            <div className="py-8 text-center">
              <p className="text-sm font-bold text-destructive">Failed to load inventory movements</p>
            </div>
          )}

          {!movementsLoading && !movementsError && filtered.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-lg font-bold">No inventory movements found</p>
              <p className="text-sm text-muted-foreground">
                {query ? 'Try a different search term' : 'Stock movements will appear here after sales, purchases, or adjustments'}
              </p>
            </div>
          )}

          {!movementsLoading && !movementsError && filtered.length > 0 && (
            <div className="space-y-2">
              {filtered.slice(0, 50).map((movement: InventoryMovement) => (
                <div key={movement.id} className="flex items-center justify-between rounded-lg border-2 border-black p-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-xs text-muted-foreground">
                        {movement.product_id.slice(0, 8)}...
                      </p>
                      <Badge variant={movementTypeColors[movement.movement_type] || 'secondary'} className="border-2 border-black">
                        {movement.movement_type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Warehouse: {warehouseMap.get(movement.warehouse_id ?? '') || movement.warehouse_id || 'N/A'}
                    </p>
                    {movement.notes && (
                      <p className="text-xs text-muted-foreground">{movement.notes}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(movement.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-black ${movement.quantity_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {movement.quantity_change >= 0 ? '+' : ''}{movement.quantity_change}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Balance: {movement.balance_after}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}