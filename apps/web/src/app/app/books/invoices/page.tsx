'use client';

import AppLayout from '@/app/app/layout';
import { useInvoices, useIssueInvoice } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Send } from 'lucide-react';
import Link from 'next/link';
import { formatMoney } from '@soko/utils';
import { toast } from 'sonner';
import { useState, useMemo } from 'react';

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  sent: 'outline',
  paid: 'default',
  overdue: 'destructive',
  cancelled: 'destructive',
  void: 'destructive',
};

export default function InvoicesPage() {
  const [query, setQuery] = useState('');
  const { data, isLoading, isError, error } = useInvoices();
  const issueInvoice = useIssueInvoice();
  const invoices = data?.data ?? [];

  const filteredInvoices = useMemo(() => {
    const invoices = data?.data ?? [];
    if (!query) return invoices;
    const q = query.toLowerCase();
    return invoices.filter((invoice) =>
      invoice.invoice_number.toLowerCase().includes(q) ||
      invoice.customer_name.toLowerCase().includes(q)
    );
  }, [data?.data, query]);

  const handleIssue = (id: string) => {
    issueInvoice.mutate(id, {
      onSuccess: () => toast.success('Invoice issued'),
      onError: () => toast.error('Failed to issue invoice'),
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Invoices</h1>
            <p className="text-muted-foreground font-bold">Manage customer invoices</p>
          </div>
          <Button asChild className="border-2 border-black shadow">
            <Link href="/invoices/create">
              <Plus className="mr-2 h-4 w-4" /> Create Invoice
            </Link>
          </Button>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Label htmlFor="invoice-search" className="sr-only">Search invoices</Label>
              <Input
                id="invoice-search"
                placeholder="Search invoices by number or customer..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="border-2 border-black flex-1"
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="space-y-3" aria-live="polite" aria-label="Loading invoices">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full border-2 border-black" />
                ))}
              </div>
            )}

            {isError && (
              <div className="py-8 text-center" role="alert">
                <p className="text-sm font-bold text-destructive">Failed to load invoices</p>
                <p className="text-xs text-muted-foreground">{error instanceof Error ? error.message : 'Unknown error'}</p>
              </div>
            )}

            {!isLoading && !isError && filteredInvoices.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No invoices found</p>
                <p className="text-sm text-muted-foreground">
                  {query ? 'Try a different search term' : 'Create your first invoice to get started'}
                </p>
              </div>
            )}

            {!isLoading && !isError && filteredInvoices.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full" role="grid">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th scope="col" className="p-2 text-left font-bold">Invoice #</th>
                      <th scope="col" className="p-2 text-left font-bold">Customer</th>
                      <th scope="col" className="p-2 text-left font-bold">Issue Date</th>
                      <th scope="col" className="p-2 text-left font-bold">Due Date</th>
                      <th scope="col" className="p-2 text-left font-bold">Status</th>
                      <th scope="col" className="p-2 text-right font-bold">Grand Total</th>
                      <th scope="col" className="p-2 text-right font-bold">Paid</th>
                      <th scope="col" className="p-2 text-right font-bold">Balance</th>
                      <th scope="col" className="p-2 text-right font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b border-black hover:bg-muted/50">
                        <td className="p-2 font-mono font-bold">
                          <Link href={`/invoices/${invoice.id}`} className="hover:underline">
                            {invoice.invoice_number}
                          </Link>
                        </td>
                        <td className="p-2">{invoice.customer_name}</td>
                        <td className="p-2">{new Date(invoice.invoice_date).toLocaleDateString()}</td>
                        <td className="p-2">{new Date(invoice.due_date).toLocaleDateString()}</td>
                        <td className="p-2">
                          <Badge variant={statusColors[invoice.status] || 'secondary'} className="border-2 border-black capitalize">
                            {invoice.status}
                          </Badge>
                        </td>
                        <td className="p-2 text-right font-mono">{formatMoney(invoice.grand_total_minor)}</td>
                        <td className="p-2 text-right font-mono">{formatMoney(invoice.paid_total_minor)}</td>
                        <td className="p-2 text-right font-mono font-bold">{formatMoney(invoice.balance_minor)}</td>
                        <td className="p-2 text-right">
                          {invoice.status === 'draft' && (
                            <Button
                              size="sm"
                              onClick={() => handleIssue(invoice.id)}
                              disabled={issueInvoice.isPending}
                              className="border-2 border-black shadow"
                            >
                              <Send className="h-4 w-4 mr-1" /> Issue
                            </Button>
                          )}
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
