'use client';

import AppLayout from '@/app/app/layout';
import { useTenders } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { Tender, TenderStatus } from '@soko/domain-types';

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  published: 'default',
  bidding: 'outline',
  opened: 'outline',
  evaluation: 'outline',
  awarded: 'default',
  rejected: 'destructive',
  cancelled: 'destructive',
  expired: 'destructive',
};

export default function TendersPage() {
  const [query, setQuery] = useState('');
  const { data, isLoading, isError, error } = useTenders();
  const tenders = data?.data ?? [];

  const filtered = tenders.filter((t: Tender) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      t.tender_number.toLowerCase().includes(q) ||
      t.title.toLowerCase().includes(q) ||
      t.status.toLowerCase().includes(q)
    );
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Tenders</h1>
            <p className="text-muted-foreground font-bold">
              Tender management and bidding
            </p>
          </div>
          <Button className="border-2 border-black">
            <Plus className="mr-2 h-4 w-4" /> New Tender
          </Button>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search tenders..."
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
                <p className="text-sm font-bold text-destructive">Failed to load tenders</p>
                <p className="text-xs text-muted-foreground">{error instanceof Error ? error.message : 'Unknown error'}</p>
              </div>
            )}

            {!isLoading && !isError && filtered.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No tenders found</p>
                <p className="text-sm text-muted-foreground">
                  {query ? 'Try a different search term' : 'Create your first tender to get started'}
                </p>
              </div>
            )}

            {!isLoading && !isError && filtered.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th className="p-2 text-left font-bold">Tender #</th>
                      <th className="p-2 text-left font-bold">Title</th>
                      <th className="p-2 text-left font-bold">Status</th>
                      <th className="p-2 text-left font-bold">Deadline</th>
                      <th className="p-2 text-left font-bold">Opening Date</th>
                      <th className="p-2 text-left font-bold">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((tender: Tender) => (
                      <tr key={tender.id} className="border-b border-black hover:bg-muted/50">
                        <td className="p-2 font-mono font-bold">{tender.tender_number}</td>
                        <td className="p-2">{tender.title}</td>
                        <td className="p-2">
                          <Badge variant={statusColors[tender.status] || 'secondary'} className="border-2 border-black capitalize">
                            {tender.status}
                          </Badge>
                        </td>
                        <td className="p-2">
                          {tender.submission_deadline ? new Date(tender.submission_deadline).toLocaleDateString() : '-'}
                        </td>
                        <td className="p-2">
                          {tender.opening_date ? new Date(tender.opening_date).toLocaleDateString() : '-'}
                        </td>
                        <td className="p-2">{new Date(tender.created_at).toLocaleDateString()}</td>
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
