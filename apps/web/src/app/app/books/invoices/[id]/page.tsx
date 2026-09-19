'use client';

import AppLayout from '@/app/app/layout';
import { useInvoice } from '@/hooks/useTanStackQuery';
import { useDeleteInvoice } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from '@/components/ui/alert-dialog';
import { ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { formatMoney } from '@soko/utils';

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  sent: 'outline',
  paid: 'default',
  overdue: 'destructive',
  cancelled: 'destructive',
  void: 'destructive',
};

export default function InvoiceDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data, isLoading, isError, error } = useInvoice(id);
  const deleteMutation = useDeleteInvoice();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const invoice = data?.data;

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(id);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64 border-2 border-black" />
          <Skeleton className="h-96 w-full border-2 border-black" />
        </div>
      </AppLayout>
    );
  }

  if (isError || !invoice) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Invoice</h1>
            <p className="text-sm font-bold text-destructive">Failed to load invoice</p>
          </div>
          <Button variant="outline" asChild className="border-2 border-black">
            <Link href="/invoices">Back to Invoices</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Invoice {invoice.invoice_number}</h1>
            <p className="text-muted-foreground font-bold">Invoice details and history</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild className="border-2 border-black">
              <Link href="/invoices"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link>
            </Button>
            {invoice.status === 'draft' && (
              <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)} className="border-2 border-black">
                <Trash2 className="mr-2 h-4 w-4" /> Void
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card className="border-2 border-black">
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between"><span className="font-bold">Customer:</span><span>{invoice.customer_name}</span></div>
              <div className="flex justify-between"><span className="font-bold">Issue Date:</span><span>{new Date(invoice.invoice_date).toLocaleDateString()}</span></div>
              <div className="flex justify-between"><span className="font-bold">Due Date:</span><span>{new Date(invoice.due_date).toLocaleDateString()}</span></div>
              <div className="flex justify-between"><span className="font-bold">Status:</span><Badge variant={statusColors[invoice.status] || 'secondary'} className="border-2 border-black capitalize">{invoice.status}</Badge></div>
              <div className="flex justify-between"><span className="font-bold">Currency:</span><span>{invoice.currency}</span></div>
              {invoice.notes && <div className="mt-2"><span className="font-bold">Notes:</span><p className="text-sm text-muted-foreground">{invoice.notes}</p></div>}
            </CardContent>
          </Card>

          <Card className="border-2 border-black">
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between"><span className="font-bold">Subtotal:</span><span className="font-mono">{formatMoney(invoice.subtotal_minor)}</span></div>
              <div className="flex justify-between"><span className="font-bold">Tax:</span><span className="font-mono">{formatMoney(invoice.tax_total_minor)}</span></div>
              <div className="flex justify-between border-t-2 border-black pt-2"><span className="font-bold">Grand Total:</span><span className="font-mono font-black text-lg">{formatMoney(invoice.grand_total_minor)}</span></div>
              <div className="flex justify-between"><span className="font-bold">Paid:</span><span className="font-mono">{formatMoney(invoice.paid_total_minor)}</span></div>
              <div className="flex justify-between border-t-2 border-black pt-2"><span className="font-bold">Balance:</span><span className="font-mono font-black">{formatMoney(invoice.balance_minor)}</span></div>
            </CardContent>
          </Card>
        </div>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="border-2 border-black">
            <AlertDialogHeader>
              <AlertDialogTitle>Void Invoice</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to void this invoice? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex justify-end gap-2">
              <AlertDialogCancel className="border-2 border-black">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="border-2 border-black shadow">Void</AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
