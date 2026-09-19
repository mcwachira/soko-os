'use client';

import AppLayout from '@/app/app/layout';
import { useSupplierInvoices } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { SupplierInvoice, SupplierInvoiceStatus } from '@soko/domain-types';
import { fromMinorUnits } from '@soko/utils';

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  submitted: 'outline',
  pending_verification: 'outline',
  verified: 'default',
  rejected: 'destructive',
  matched: 'default',
  mismatched: 'destructive',
  paid: 'default',
  cancelled: 'destructive',
};

export default function SupplierInvoicesPage() {
  const [query, setQuery] = useState('');
  const { data, isLoading, isError, error } = useSupplierInvoices();
  const invoices = data?.data ?? [];

  const filtered = invoices.filter((inv: SupplierInvoice) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      inv.invoice_number.toLowerCase().includes(q) ||
      inv.status.toLowerCase().includes(q) ||
      inv.currency.toLowerCase().includes(q)
    );
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Supplier Invoices</h1>
            <p className="text-muted-foreground font-bold">
              Supplier invoices and verification
            </p>
          </div>
          <Button className="border-2 border-black">
            <Plus className="mr-2 h-4 w-4" /> New Invoice
          </Button>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search invoices..."
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
                <p className="text-sm font-bold text-destructive">Failed to load invoices</p>
                <p className="text-xs text-muted-foreground">{error instanceof Error ? error.message : 'Unknown error'}</p>
              </div>
            )}

            {!isLoading && !isError && filtered.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No invoices found</p>
                <p className="text-sm text-muted-foreground">
                  {query ? 'Try a different search term' : 'Create your first invoice to get started'}
                </p>
              </div>
            )}

            {!isLoading && !isError && filtered.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th className="p-2 text-left font-bold">Invoice #</th>
                      <th className="p-2 text-left font-bold">Invoice Date</th>
                      <th className="p-2 text-left font-bold">Due Date</th>
                      <th className="p-2 text-left font-bold">Grand Total</th>
                      <th className="p-2 text-left font-bold">Status</th>
                      <th className="p-2 text-left font-bold">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((inv: SupplierInvoice) => (
                      <tr key={inv.id} className="border-b border-black hover:bg-muted/50">
                        <td className="p-2 font-mono font-bold">{inv.invoice_number}</td>
                        <td className="p-2">{new Date(inv.invoice_date).toLocaleDateString()}</td>
                        <td className="p-2">
                          {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '-'}
                        </td>
                        <td className="p-2 font-mono">{fromMinorUnits(inv.grand_total_minor)}</td>
                        <td className="p-2">
                          <Badge variant={statusColors[inv.status] || 'secondary'} className="border-2 border-black capitalize">
                            {inv.status}
                          </Badge>
                        </td>
                        <td className="p-2">{new Date(inv.created_at).toLocaleDateString()}</td>
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
