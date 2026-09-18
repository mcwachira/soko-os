'use client';

import AppLayout from '@/app/app/layout';
import { useApprovalRules } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { ApprovalRule } from '@soko/domain-types';
import { fromMinorUnits } from '@soko/utils';

export default function ApprovalRulesPage() {
  const [query, setQuery] = useState('');
  const { data, isLoading, isError, error } = useApprovalRules();
  const rules = data?.data ?? [];

  const filtered = rules.filter((r: ApprovalRule) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      r.entity_type.toLowerCase().includes(q) ||
      r.currency.toLowerCase().includes(q) ||
      r.department?.toLowerCase().includes(q) ||
      r.purchase_type?.toLowerCase().includes(q)
    );
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Approval Rules</h1>
            <p className="text-muted-foreground font-bold">
              Approval workflows and rules
            </p>
          </div>
          <Button className="border-2 border-black">
            <Plus className="mr-2 h-4 w-4" /> New Rule
          </Button>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search rules..."
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
                <p className="text-sm font-bold text-destructive">Failed to load approval rules</p>
                <p className="text-xs text-muted-foreground">{error instanceof Error ? error.message : 'Unknown error'}</p>
              </div>
            )}

            {!isLoading && !isError && filtered.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No approval rules found</p>
                <p className="text-sm text-muted-foreground">
                  {query ? 'Try a different search term' : 'Create your first approval rule to get started'}
                </p>
              </div>
            )}

            {!isLoading && !isError && filtered.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th className="p-2 text-left font-bold">Entity Type</th>
                      <th className="p-2 text-left font-bold">Currency</th>
                      <th className="p-2 text-left font-bold">Min Amount</th>
                      <th className="p-2 text-left font-bold">Max Amount</th>
                      <th className="p-2 text-left font-bold">Department</th>
                      <th className="p-2 text-left font-bold">Purchase Type</th>
                      <th className="p-2 text-left font-bold">Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((rule: ApprovalRule) => (
                      <tr key={rule.id} className="border-b border-black hover:bg-muted/50">
                        <td className="p-2 capitalize">{rule.entity_type}</td>
                        <td className="p-2">{rule.currency}</td>
                        <td className="p-2 font-mono">
                          {rule.min_amount_minor != null ? fromMinorUnits(rule.min_amount_minor) : '-'}
                        </td>
                        <td className="p-2 font-mono">
                          {rule.max_amount_minor != null ? fromMinorUnits(rule.max_amount_minor) : '-'}
                        </td>
                        <td className="p-2">{rule.department || '-'}</td>
                        <td className="p-2 capitalize">{rule.purchase_type || '-'}</td>
                        <td className="p-2">
                          <Badge variant={rule.is_active ? 'default' : 'secondary'} className="border-2 border-black capitalize">
                            {rule.is_active ? 'Yes' : 'No'}
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
