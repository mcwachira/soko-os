'use client';

import AppLayout from '@/app/app/layout';
import { useThreeWayMatches } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { ThreeWayMatch, ThreeWayMatchStatus } from '@soko/domain-types';

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  matched: 'default',
  partially_matched: 'outline',
  quantity_mismatch: 'destructive',
  price_mismatch: 'destructive',
  tax_mismatch: 'destructive',
  duplicate_invoice: 'destructive',
  missing_po: 'destructive',
  missing_grn: 'destructive',
  supplier_mismatch: 'destructive',
  manual_review: 'outline',
  blocked: 'destructive',
};

export default function ThreeWayMatchesPage() {
  const [query, setQuery] = useState('');
  const { data, isLoading, isError, error } = useThreeWayMatches();
  const matches = data?.data ?? [];

  const filtered = matches.filter((m: ThreeWayMatch) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      m.id.toLowerCase().includes(q) ||
      m.status.toLowerCase().includes(q)
    );
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Three-Way Matches</h1>
            <p className="text-muted-foreground font-bold">
              PO, GRN, and invoice matching
            </p>
          </div>
          <Button className="border-2 border-black">
            <Plus className="mr-2 h-4 w-4" /> New Match
          </Button>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search matches..."
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
                <p className="text-sm font-bold text-destructive">Failed to load matches</p>
                <p className="text-xs text-muted-foreground">{error instanceof Error ? error.message : 'Unknown error'}</p>
              </div>
            )}

            {!isLoading && !isError && filtered.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No matches found</p>
                <p className="text-sm text-muted-foreground">
                  {query ? 'Try a different search term' : 'Create your first match to get started'}
                </p>
              </div>
            )}

            {!isLoading && !isError && filtered.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th className="p-2 text-left font-bold">ID</th>
                      <th className="p-2 text-left font-bold">PO ID</th>
                      <th className="p-2 text-left font-bold">Status</th>
                      <th className="p-2 text-left font-bold">Matched At</th>
                      <th className="p-2 text-left font-bold">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((match: ThreeWayMatch) => (
                      <tr key={match.id} className="border-b border-black hover:bg-muted/50">
                        <td className="p-2 font-mono text-xs">{match.id.slice(0, 8)}</td>
                        <td className="p-2 font-mono text-xs">{match.purchase_order_id.slice(0, 8)}</td>
                        <td className="p-2">
                          <Badge variant={statusColors[match.status] || 'secondary'} className="border-2 border-black capitalize">
                            {match.status}
                          </Badge>
                        </td>
                        <td className="p-2">
                          {match.matched_at ? new Date(match.matched_at).toLocaleDateString() : '-'}
                        </td>
                        <td className="p-2">{new Date(match.created_at).toLocaleDateString()}</td>
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
