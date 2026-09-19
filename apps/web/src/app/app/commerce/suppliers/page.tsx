'use client';

import AppLayout from '@/app/app/layout';
import { useSuppliers } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';
import { useState } from 'react';
import { Supplier } from '@soko/domain-types';
import { fromMinorUnits } from '@soko/utils';

export default function SuppliersPage() {
  const [query, setQuery] = useState('');
  const { data, isLoading, isError, error } = useSuppliers();
  const suppliers = data?.data ?? [];

  const filtered = suppliers.filter((s: Supplier) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      (s.legal_name?.toLowerCase().includes(q) || s.trading_name?.toLowerCase().includes(q)) ||
      (s.email && s.email.toLowerCase().includes(q)) ||
      (s.phone && s.phone.toLowerCase().includes(q))
    );
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Suppliers</h1>
            <p className="text-muted-foreground font-bold">
              Manage your suppliers and vendor relationships
            </p>
          </div>
          <Button className="border-2 border-black">
            <Plus className="mr-2 h-4 w-4" /> Add Supplier
          </Button>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search suppliers by name, email, or phone..."
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
                <p className="text-sm font-bold text-destructive">Failed to load suppliers</p>
                <p className="text-xs text-muted-foreground">{error instanceof Error ? error.message : 'Unknown error'}</p>
              </div>
            )}

            {!isLoading && !isError && filtered.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No suppliers found</p>
                <p className="text-sm text-muted-foreground">
                  {query ? 'Try a different search term' : 'Add your first supplier to start purchasing'}
                </p>
              </div>
            )}

            {!isLoading && !isError && filtered.length > 0 && (
              <div className="space-y-2">
                {filtered.map((supplier: Supplier) => (
                  <div key={supplier.id} className="flex items-center justify-between rounded-lg border-2 border-black p-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-black">{supplier.legal_name || supplier.trading_name || 'Unnamed Supplier'}</p>
                        {supplier.primary_contact_name && (
                          <Badge variant="outline" className="border-2 border-black">
                            {supplier.primary_contact_name}
                          </Badge>
                        )}
                      </div>
                      {supplier.email && (
                        <p className="text-xs text-muted-foreground">{supplier.email}</p>
                      )}
                      {supplier.phone && (
                        <p className="text-xs text-muted-foreground">{supplier.phone}</p>
                      )}
                      {supplier.kra_pin && (
                        <p className="text-xs text-muted-foreground">PIN: {supplier.kra_pin}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        Balance: {fromMinorUnits(supplier.current_balance_minor)}
                      </p>
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
