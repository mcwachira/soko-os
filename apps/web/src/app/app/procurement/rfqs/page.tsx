'use client';

import AppLayout from '@/app/app/layout';
import { useRfqs } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { Rfq, RfqStatus } from '@soko/domain-types';

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  published: 'default',
  sent: 'outline',
  partially_responded: 'outline',
  responses_received: 'default',
  evaluation: 'outline',
  awarded: 'default',
  closed: 'secondary',
  cancelled: 'destructive',
  expired: 'destructive',
};

export default function RfqsPage() {
  const [query, setQuery] = useState('');
  const { data, isLoading, isError, error } = useRfqs();
  const rfqs = data?.data ?? [];

  const filtered = rfqs.filter((r: Rfq) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      r.rfq_number.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      r.status.toLowerCase().includes(q)
    );
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">RFQs</h1>
            <p className="text-muted-foreground font-bold">
              Request for quotations
            </p>
          </div>
          <Button className="border-2 border-black">
            <Plus className="mr-2 h-4 w-4" /> New RFQ
          </Button>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search RFQs..."
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
                <p className="text-sm font-bold text-destructive">Failed to load RFQs</p>
                <p className="text-xs text-muted-foreground">{error instanceof Error ? error.message : 'Unknown error'}</p>
              </div>
            )}

            {!isLoading && !isError && filtered.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No RFQs found</p>
                <p className="text-sm text-muted-foreground">
                  {query ? 'Try a different search term' : 'Create your first RFQ to get started'}
                </p>
              </div>
            )}

            {!isLoading && !isError && filtered.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th className="p-2 text-left font-bold">RFQ #</th>
                      <th className="p-2 text-left font-bold">Title</th>
                      <th className="p-2 text-left font-bold">Status</th>
                      <th className="p-2 text-left font-bold">Deadline</th>
                      <th className="p-2 text-left font-bold">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((rfq: Rfq) => (
                      <tr key={rfq.id} className="border-b border-black hover:bg-muted/50">
                        <td className="p-2 font-mono font-bold">{rfq.rfq_number}</td>
                        <td className="p-2">{rfq.title}</td>
                        <td className="p-2">
                          <Badge variant={statusColors[rfq.status] || 'secondary'} className="border-2 border-black capitalize">
                            {rfq.status}
                          </Badge>
                        </td>
                        <td className="p-2">
                          {rfq.submission_deadline ? new Date(rfq.submission_deadline).toLocaleDateString() : '-'}
                        </td>
                        <td className="p-2">{new Date(rfq.created_at).toLocaleDateString()}</td>
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
