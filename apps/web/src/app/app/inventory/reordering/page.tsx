'use client';

import AppLayout from '@/app/app/layout';
import { useProducts } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, TrendingDown, AlertTriangle, ArrowUpDown } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Product } from '@soko/domain-types';
import { fromMinorUnits } from '@soko/utils';

export default function ReorderingPage() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, out, low, overstocked
  
  const { data: productsData, isLoading } = useProducts();
  const products = (productsData?.data ?? []) as Product[];

  const trackedProducts = products.filter(p => p.track_inventory);

  const productsWithReorder = useMemo(() => {
    return trackedProducts.map(product => {
      // For demo, we'll simulate current stock based on reorder level
      // In real implementation, this would come from stock movements
      const currentStock = product.reorder_level > 0 ? product.reorder_level - 5 : 50; // Simulated
      const reorderLevel = product.reorder_level;
      const maxStock = product.reorder_level * 5; // Assumed max
      
      let status: 'out' | 'low' | 'healthy' | 'overstocked' = 'healthy';
      if (currentStock <= 0) status = 'out';
      else if (currentStock <= reorderLevel) status = 'low';
      else if (currentStock >= maxStock) status = 'overstocked';
      
      const suggestedQty = Math.max(0, maxStock - currentStock);
      
      return {
        ...product,
        currentStock,
        reorderLevel,
        maxStock,
        status,
        suggestedQty,
        estimatedCost: product.cost_price_minor * suggestedQty,
      };
    });
  }, [trackedProducts]);

  const filteredProducts = useMemo(() => {
    return productsWithReorder.filter(product => {
      if (query) {
        const q = query.toLowerCase();
        if (!product.name.toLowerCase().includes(q) &&
            !product.sku.toLowerCase().includes(q) &&
            !(product.barcode && product.barcode.toLowerCase().includes(q))) {
          return false;
        }
      }
      if (filter !== 'all' && product.status !== filter) {
        return false;
      }
      return true;
    });
  }, [productsWithReorder, query, filter]);

  const stats = useMemo(() => {
    return {
      out: productsWithReorder.filter(p => p.status === 'out').length,
      low: productsWithReorder.filter(p => p.status === 'low').length,
      healthy: productsWithReorder.filter(p => p.status === 'healthy').length,
      overstocked: productsWithReorder.filter(p => p.status === 'overstocked').length,
    };
  }, [productsWithReorder]);

  const filters = ['all', 'out', 'low', 'healthy', 'overstocked'];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Reordering</h1>
            <p className="text-muted-foreground font-bold">Manage reorder points and low stock alerts</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-2 border-black">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <CardTitle className="text-sm font-bold text-muted-foreground">Out of Stock</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-destructive">{stats.out}</div>
            </CardContent>
          </Card>
          <Card className="border-2 border-black">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-warning" />
                <CardTitle className="text-sm font-bold text-muted-foreground">Low Stock</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-warning">{stats.low}</div>
            </CardContent>
          </Card>
          <Card className="border-2 border-black">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-success" />
                <CardTitle className="text-sm font-bold text-muted-foreground">Healthy</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-success">{stats.healthy}</div>
            </CardContent>
          </Card>
          <Card className="border-2 border-black">
            <CardHeader>
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-5 w-5 text-info" />
                <CardTitle className="text-sm font-bold text-muted-foreground">Overstocked</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-info">{stats.overstocked}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by product name, SKU, or barcode..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="border-2 border-black pl-10"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="rounded-base border-2 border-black bg-background px-3 py-2 font-base"
                >
                  {filters.map(f => (
                    <option key={f} value={f}>
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full border-2 border-black" />
                ))}
              </div>
            )}

            {!isLoading && filteredProducts.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No products found</p>
                <p className="text-sm text-muted-foreground">
                  {query || filter !== 'all' ? 'Try adjusting your filters' : 'No tracked products with reorder levels'}
                </p>
              </div>
            )}

            {!isLoading && filteredProducts.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full" role="grid">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th scope="col" className="p-2 text-left font-bold">Product</th>
                      <th scope="col" className="p-2 text-left font-bold">SKU</th>
                      <th scope="col" className="p-2 text-right font-bold">Current Stock</th>
                      <th scope="col" className="p-2 text-right font-bold">Reorder Level</th>
                      <th scope="col" className="p-2 text-right font-bold">Max Stock</th>
                      <th scope="col" className="p-2 text-left font-bold">Status</th>
                      <th scope="col" className="p-2 text-right font-bold">Suggested Qty</th>
                      <th scope="col" className="p-2 text-right font-bold">Est. Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.slice(0, 100).map((product) => (
                      <tr key={product.id} className="border-b border-black hover:bg-muted/50">
                        <td className="p-2 font-bold truncate max-w-[200px]">{product.name}</td>
                        <td className="p-2 font-mono text-xs">{product.sku}</td>
                        <td className="p-2 text-right font-bold tabular-nums">{product.currentStock.toLocaleString()}</td>
                        <td className="p-2 text-right tabular-nums">{product.reorderLevel.toLocaleString()}</td>
                        <td className="p-2 text-right text-muted-foreground tabular-nums">{product.maxStock.toLocaleString()}</td>
                        <td className="p-2">
                          <Badge 
                            variant={product.status === 'out' ? 'destructive' : 
                              product.status === 'low' ? 'warning' : 
                              product.status === 'overstocked' ? 'info' : 'default'} 
                            className="border-2 border-black capitalize"
                          >
                            {product.status}
                          </Badge>
                        </td>
                        <td className="p-2 text-right font-bold tabular-nums">
                          {product.suggestedQty.toLocaleString()}
                        </td>
                        <td className="p-2 text-right font-mono">
                          {product.estimatedCost > 0 ? fromMinorUnits(product.estimatedCost) : '—'}
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