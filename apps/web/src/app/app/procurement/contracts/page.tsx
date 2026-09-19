'use client';

import AppLayout from '@/app/app/layout';
import { useProcurementContracts } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { ProcurementContract } from '@soko/domain-types';
import { fromMinorUnits } from '@soko/utils';

export default function ContractsPage() {
  const [query, setQuery] = useState('');
  const { data, isLoading, isError, error } = useProcurementContracts();
  const contracts = data?.data ?? [];

  const filtered = contracts.filter((c: ProcurementContract) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      c.contract_number.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.status.toLowerCase().includes(q) ||
      c.currency.toLowerCase().includes(q)
    );
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Contracts</h1>
            <p className="text-muted-foreground font-bold">
              Procurement contracts management
            </p>
          </div>
          <Button className="border-2 border-black">
            <Plus className="mr-2 h-4 w-4" /> New Contract
          </Button>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search contracts..."
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
                <p className="text-sm font-bold text-destructive">Failed to load contracts</p>
                <p className="text-xs text-muted-foreground">{error instanceof Error ? error.message : 'Unknown error'}</p>
              </div>
            )}

            {!isLoading && !isError && filtered.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No contracts found</p>
                <p className="text-sm text-muted-foreground">
                  {query ? 'Try a different search term' : 'Create your first contract to get started'}
                </p>
              </div>
            )}

            {!isLoading && !isError && filtered.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th className="p-2 text-left font-bold">Contract #</th>
                      <th className="p-2 text-left font-bold">Title</th>
                      <th className="p-2 text-left font-bold">Value</th>
                      <th className="p-2 text-left font-bold">Start Date</th>
                      <th className="p-2 text-left font-bold">End Date</th>
                      <th className="p-2 text-left font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((contract: ProcurementContract) => (
                      <tr key={contract.id} className="border-b border-black hover:bg-muted/50">
                        <td className="p-2 font-mono font-bold">{contract.contract_number}</td>
                        <td className="p-2">{contract.title}</td>
                        <td className="p-2 font-mono">{fromMinorUnits(contract.contract_value_minor)}</td>
                        <td className="p-2">{new Date(contract.start_date).toLocaleDateString()}</td>
                        <td className="p-2">{new Date(contract.end_date).toLocaleDateString()}</td>
                        <td className="p-2">
                          <Badge variant={contract.status === 'active' ? 'default' : 'secondary'} className="border-2 border-black capitalize">
                            {contract.status}
                          </Badge>
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
