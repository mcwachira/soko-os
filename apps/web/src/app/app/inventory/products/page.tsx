'use client';

import AppLayout from '@/app/app/layout';
import { useProducts, useCreateProduct } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';
import { useState } from 'react';
import { Product } from '@soko/domain-types';
import { fromMinorUnits } from '@soko/utils';

export default function ProductsPage() {
  const [query, setQuery] = useState('');
  const { data, isLoading, isError, error } = useProducts();
  const products = data?.data ?? [];

  const filtered = products.filter((p: Product) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      (p.barcode && p.barcode.toLowerCase().includes(q))
    );
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Products</h1>
            <p className="text-muted-foreground font-bold">
              Manage your product catalog
            </p>
          </div>
          <Button className="border-2 border-black">
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products by name, SKU, or barcode..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="border-2 border-black pl-10"
                />
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

            {isError && (
              <div className="py-8 text-center">
                <p className="text-sm font-bold text-destructive">Failed to load products</p>
                <p className="text-xs text-muted-foreground">{error instanceof Error ? error.message : 'Unknown error'}</p>
              </div>
            )}

            {!isLoading && !isError && filtered.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No products found</p>
                <p className="text-sm text-muted-foreground">
                  {query ? 'Try a different search term' : 'Add your first product to start selling'}
                </p>
              </div>
            )}

            {!isLoading && !isError && filtered.length > 0 && (
              <div className="space-y-2">
                {filtered.map((product: Product) => (
                  <div key={product.id} className="flex items-center justify-between rounded-lg border-2 border-black p-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-black">{product.name}</p>
                        <Badge variant={product.is_active ? 'default' : 'secondary'} className="border-2 border-black">
                          {product.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        {product.track_inventory && (
                          <Badge variant="outline" className="border-2 border-black">
                            Tracked
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        SKU: {product.sku} {product.barcode && `• Barcode: ${product.barcode}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Unit: {product.unit} • Tax: {product.tax_category_code}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">Cost: {fromMinorUnits(product.cost_price_minor)}</p>
                      <p className="text-lg font-black">Price: {fromMinorUnits(product.selling_price_minor)}</p>
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
