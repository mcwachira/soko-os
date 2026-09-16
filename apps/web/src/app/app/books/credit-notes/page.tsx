'use client';
export const dynamic = 'force-dynamic';

import AppLayout from '@/app/app/layout';
import { useCreditNotes } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import Link from 'next/link';

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  issued: 'outline',
  applied: 'default',
  cancelled: 'destructive',
  void: 'destructive',
};

export default function CreditNotesPage() {
  const { data, isLoading, isError, error } = useCreditNotes();
  const creditNotes = data?.data ?? [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Credit Notes</h1>
            <p className="text-muted-foreground font-bold">Manage customer credit notes</p>
          </div>
          <Button asChild className="border-2 border-black shadow">
            <Link href="/credit-notes/create">
              <Plus className="mr-2 h-4 w-4" /> New Credit Note
            </Link>
          </Button>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Input placeholder="Search credit notes..." className="border-2 border-black" />
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
                <p className="text-sm font-bold text-destructive">Failed to load credit notes</p>
                <p className="text-xs text-muted-foreground">{error instanceof Error ? error.message : 'Unknown error'}</p>
              </div>
            )}

            {!isLoading && !isError && creditNotes.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No credit notes yet</p>
                <p className="text-sm text-muted-foreground">Create your first credit note to get started</p>
              </div>
            )}

            {!isLoading && !isError && creditNotes.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th className="p-2 text-left font-bold">CN #</th>
                      <th className="p-2 text-left font-bold">Customer</th>
                      <th className="p-2 text-left font-bold">Date</th>
                      <th className="p-2 text-left font-bold">Status</th>
                      <th className="p-2 text-right font-bold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {creditNotes.map((cn) => (
                      <tr key={cn.id} className="border-b border-black hover:bg-muted/50">
                        <td className="p-2 font-mono font-bold">
                          <Link href={`/credit-notes/${cn.id}`} className="hover:underline">
                            {cn.credit_note_number}
                          </Link>
                        </td>
                        <td className="p-2">{cn.customer_name}</td>
                        <td className="p-2">{new Date(cn.credit_date).toLocaleDateString()}</td>
                        <td className="p-2">
                          <Badge variant={statusColors[cn.status] || 'secondary'} className="border-2 border-black capitalize">
                            {cn.status}
                          </Badge>
                        </td>
                        <td className="p-2 text-right font-mono font-bold">
                          {(cn.total_minor / 100).toLocaleString('en-KE', { style: 'currency', currency: 'KES' })}
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
