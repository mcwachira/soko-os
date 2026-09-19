'use client';

import AppLayout from '@/app/app/layout';
import { usePurchaseRequisitions } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { PurchaseRequisition, RequisitionStatus } from '@soko/domain-types';
import { fromMinorUnits } from '@soko/utils';

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  submitted: 'outline',
  under_review: 'outline',
  approved: 'default',
  rejected: 'destructive',
  cancelled: 'destructive',
  converted: 'default',
  partially_ordered: 'outline',
  fully_ordered: 'default',
};

const priorityColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  low: 'secondary',
  medium: 'outline',
  high: 'default',
  urgent: 'destructive',
};

export default function RequisitionsPage() {
  const [query, setQuery] = useState('');
  const { data, isLoading, isError, error } = usePurchaseRequisitions();
  const requisitions = data?.data ?? [];

  const filtered = requisitions.filter((r: PurchaseRequisition) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      r.id.toLowerCase().includes(q) ||
      r.department?.toLowerCase().includes(q) ||
      r.status.toLowerCase().includes(q) ||
      r.priority.toLowerCase().includes(q)
    );
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Purchase Requisitions</h1>
            <p className="text-muted-foreground font-bold">
              Manage purchase requisitions and approvals
            </p>
          </div>
          <Button className="border-2 border-black">
            <Plus className="mr-2 h-4 w-4" /> New Requisition
          </Button>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search requisitions..."
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
                <p className="text-sm font-bold text-destructive">Failed to load requisitions</p>
                <p className="text-xs text-muted-foreground">{error instanceof Error ? error.message : 'Unknown error'}</p>
              </div>
            )}

            {!isLoading && !isError && filtered.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No requisitions found</p>
                <p className="text-sm text-muted-foreground">
                  {query ? 'Try a different search term' : 'Create your first requisition to get started'}
                </p>
              </div>
            )}

            {!isLoading && !isError && filtered.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th className="p-2 text-left font-bold">ID</th>
                      <th className="p-2 text-left font-bold">Department</th>
                      <th className="p-2 text-left font-bold">Priority</th>
                      <th className="p-2 text-left font-bold">Budget</th>
                      <th className="p-2 text-left font-bold">Required Date</th>
                      <th className="p-2 text-left font-bold">Status</th>
                      <th className="p-2 text-left font-bold">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((req: PurchaseRequisition) => (
                      <tr key={req.id} className="border-b border-black hover:bg-muted/50">
                        <td className="p-2 font-mono text-xs">{req.id.slice(0, 8)}</td>
                        <td className="p-2">{req.department || '-'}</td>
                        <td className="p-2">
                          <Badge variant={priorityColors[req.priority] || 'secondary'} className="border-2 border-black capitalize">
                            {req.priority}
                          </Badge>
                        </td>
                        <td className="p-2 font-mono">
                          {req.budget_minor != null ? fromMinorUnits(req.budget_minor) : '-'}
                        </td>
                        <td className="p-2">
                          {req.required_date ? new Date(req.required_date).toLocaleDateString() : '-'}
                        </td>
                        <td className="p-2">
                          <Badge variant={statusColors[req.status] || 'secondary'} className="border-2 border-black capitalize">
                            {req.status}
                          </Badge>
                        </td>
                        <td className="p-2">{new Date(req.created_at).toLocaleDateString()}</td>
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
