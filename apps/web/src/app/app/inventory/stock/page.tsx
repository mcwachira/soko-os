'use client';

import AppLayout from '@/app/app/layout';
import { useProducts } from '@/hooks/useTanStackQuery';
import { useInventoryMovements } from '@/hooks/useTanStackQuery';
import { useWarehouses } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Product, Warehouse, InventoryMovement } from '@soko/domain-types';
import { fromMinorUnits } from '@soko/utils';

export default function StockOverviewPage() {
  const [query, setQuery] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all'); // all, low, out, healthy
  
  const { data: productsData, isLoading: productsLoading } = useProducts();
  const { data: movementsData } = useInventoryMovements();
  const { data: warehousesData } = useWarehouses();

  const products = (productsData?.data ?? []) as Product[];
  const movements = (movementsData?.data ?? []) as InventoryMovement[];
  const warehouses = (warehousesData?.data ?? []) as Warehouse[];
  const warehouseMap = new Map(warehouses.map(w => [w.id, w.name]));

  const trackedProducts = products.filter(p => p.track_inventory);

  // Calculate current stock for each product by finding the latest movement balance
  const productStockMap = new Map<string, { balance: number; warehouse: string; lastMovement: string }>();
  
  movements.forEach(movement => {
    if (!productStockMap.has(movement.product_id) || 
        new Date(movement.created_at) > new Date(productStockMap.get(movement.product_id)!.lastMovement)) {
      const warehouse = warehouseMap.get(movement.warehouse_id ?? '') || 'N/A';
      productStockMap.set(movement.product_id, {
        balance: movement.balance_after,
        warehouse,
        lastMovement: movement.created_at,
      });
    }
  });

  const productsWithStock = trackedProducts.map(product => {
    const stockInfo = productStockMap.get(product.id);
    const currentStock = stockInfo?.balance ?? 0;
    const warehouse = stockInfo?.warehouse ?? 'N/A';
    const isLowStock = product.reorder_level > 0 && currentStock <= product.reorder_level;
    const isOutOfStock = currentStock <= 0;
    
    let stockStatus: 'healthy' | 'low' | 'out' = 'healthy';
    if (isOutOfStock) stockStatus = 'out';
    else if (isLowStock) stockStatus = 'low';
    
    return {
      ...product,
      currentStock,
      warehouse,
      stockStatus,
      isLowStock,
      isOutOfStock,
    };
  });

  const filteredProducts = useMemo(() => {
    return productsWithStock.filter(product => {
      if (query) {
        const q = query.toLowerCase();
        if (!product.name.toLowerCase().includes(q) &&
            !product.sku.toLowerCase().includes(q) &&
            !(product.barcode && product.barcode.toLowerCase().includes(q)) &&
            !product.warehouse.toLowerCase().includes(q)) {
          return false;
        }
      }
      if (warehouseFilter !== 'all' && product.warehouse !== warehouseFilter) {
        return false;
      }
      if (stockFilter !== 'all' && product.stockStatus !== stockFilter) {
        return false;
      }
      return true;
    });
  }, [productsWithStock, query, warehouseFilter, stockFilter]);

  const stats = useMemo(() => {
    return {
      total: productsWithStock.length,
      healthy: productsWithStock.filter(p => p.stockStatus === 'healthy').length,
      low: productsWithStock.filter(p => p.stockStatus === 'low').length,
      out: productsWithStock.filter(p => p.stockStatus === 'out').length,
    };
  }, [productsWithStock]);

  const activeWarehouses = warehouses.filter(w => w.is_active);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Stock Overview</h1>
            <p className="text-muted-foreground font-bold">Real-time stock levels across all warehouses</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-2 border-border">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-muted-foreground">Total Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="border-2 border-border">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-muted-foreground">Healthy Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-success">{stats.healthy}</div>
            </CardContent>
          </Card>
          <Card className="border-2 border-border">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-muted-foreground">Low Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-warning">{stats.low}</div>
            </CardContent>
          </Card>
          <Card className="border-2 border-border">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-muted-foreground">Out of Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-destructive">{stats.out}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-2 border-border">
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by product name, SKU, barcode, or warehouse..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="border-2 border-border pl-10"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={warehouseFilter}
                  onChange={(e) => setWarehouseFilter(e.target.value)}
                  className="rounded-base border-2 border-border bg-background px-3 py-2 font-base"
                >
                  <option value="all">All Warehouses</option>
                  {warehouses.map(w => (
                    <option key={w.id} value={w.name}>{w.name} ({w.code})</option>
                  ))}
                </select>
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  className="rounded-base border-2 border-border bg-background px-3 py-2 font-base"
                >
                  <option value="all">All Stock</option>
                  <option value="healthy">Healthy</option>
                  <option value="low">Low Stock</option>
                  <option value="out">Out of Stock</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {productsLoading && (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full border-2 border-border" />
                ))}
              </div>
            )}

            {!productsLoading && filteredProducts.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No products found</p>
                <p className="text-sm text-muted-foreground">
                  {query || warehouseFilter !== 'all' || stockFilter !== 'all' 
                    ? 'Try adjusting your filters' 
                    : 'No tracked products found'}
                </p>
              </div>
            )}

            {!productsLoading && filteredProducts.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full" role="grid">
                  <thead>
                    <tr className="border-b-2 border-border">
                      <th scope="col" className="p-2 text-left font-bold">Product</th>
                      <th scope="col" className="p-2 text-left font-bold">SKU</th>
                      <th scope="col" className="p-2 text-left font-bold">Warehouse</th>
                      <th scope="col" className="p-2 text-right font-bold">Current Stock</th>
                      <th scope="col" className="p-2 text-right font-bold">Reorder Level</th>
                      <th scope="col" className="p-2 text-left font-bold">Status</th>
                      <th scope="col" className="p-2 text-right font-bold">Cost Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.slice(0, 100).map((product) => (
                      <tr key={product.id} className="border-b border-border hover:bg-muted/50">
                        <td className="p-2 font-bold truncate max-w-[200px]">{product.name}</td>
                        <td className="p-2 font-mono text-xs">{product.sku}</td>
                        <td className="p-2 text-xs text-muted-foreground">{product.warehouse}</td>
                        <td className="p-2 text-right font-bold tabular-nums">{product.currentStock.toLocaleString()}</td>
                        <td className="p-2 text-right text-muted-foreground tabular-nums">{product.reorder_level.toLocaleString()}</td>
                        <td className="p-2">
                          <Badge 
                            variant={product.stockStatus === 'out' ? 'destructive' : 
                              product.stockStatus === 'low' ? 'warning' : 'default'} 
                            className="border-2 border-border capitalize"
                          >
                            {product.stockStatus}
                          </Badge>
                        </td>
                        <td className="p-2 text-right font-mono">
                          {fromMinorUnits(product.cost_price_minor * product.currentStock)}
                        </td>
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