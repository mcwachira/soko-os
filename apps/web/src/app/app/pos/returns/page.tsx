'use client';

import AppLayout from '@/app/app/layout';
import { useReturns, useCreateReturn, useSales } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, RotateCcw, Plus, Minus, Trash2, Search } from 'lucide-react';
import { useState, useMemo } from 'react';
import { CreateReturnSchema } from '@soko/validation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { fromMinorUnits } from '@soko/utils';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  received: 'default',
  completed: 'default',
  cancelled: 'destructive',
};

type ReturnFormItem = {
  sale_item_id: string;
  product_name: string;
  product_sku: string;
  available_quantity: number;
  quantity: number;
  unit_price_minor: number;
};

export default function ReturnsPage() {
  const [returnOpen, setReturnOpen] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<string>('');
  const [saleItems, setSaleItems] = useState<ReturnFormItem[]>([]);
  const [isLoadingSale, setIsLoadingSale] = useState(false);
  const { data, isLoading, isError, error, refetch } = useReturns();
  const createReturnMutation = useCreateReturn();
  const returns = data?.data ?? [];

  // Fetch all sales for sale selection
  const { data: salesData } = useSales({ limit: '100' });
  const sales = salesData?.data ?? [];

  const form = useForm({
    resolver: zodResolver(CreateReturnSchema),
    defaultValues: {
      sale_id: '',
      return_type: 'refund',
      reason: '',
      notes: '',
      items: [] as { sale_item_id: string; quantity: number; return_reason?: 'defective' | 'wrong_item' | 'changed_mind' | 'damaged' | 'expired' | 'other'; condition?: 'good' | 'damaged' | 'expired' }[],
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'items' });

  const loadSaleItems = async (saleId: string) => {
    setIsLoadingSale(true);
    try {
      // Find the sale in our loaded data
      const sale = sales.find(s => s.id === saleId);
      if (sale && sale.items) {
        const items: ReturnFormItem[] = sale.items.map((item: any) => ({
          sale_item_id: item.id,
          product_name: item.name,
          product_sku: item.sku,
          available_quantity: item.quantity - (item.returned_quantity || 0),
          quantity: Math.min(1, item.quantity - (item.returned_quantity || 0)),
          unit_price_minor: item.unit_price_minor,
        })).filter(item => item.available_quantity > 0);
        setSaleItems(items);
        form.setValue('items', items.map(item => ({
          sale_item_id: item.sale_item_id,
          quantity: item.quantity,
        })));
      } else {
        // Fallback: try to fetch sale details
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/api/v1/sales/${saleId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('soko_token')}` },
        });
        if (response.ok) {
          const data = await response.json();
          const sale = data.data;
          if (sale.items) {
            const mappedItems: ReturnFormItem[] = sale.items.map((item: { id: string; name: string; sku: string; quantity: number; returned_quantity?: number; unit_price_minor: number }) => ({
              sale_item_id: item.id,
              product_name: item.name,
              product_sku: item.sku,
              available_quantity: item.quantity - (item.returned_quantity || 0),
              quantity: Math.min(1, item.quantity - (item.returned_quantity || 0)),
              unit_price_minor: item.unit_price_minor,
            }));
            const items = mappedItems.filter((item): item is ReturnFormItem => item.available_quantity > 0);
            setSaleItems(items);
            form.setValue('items', items.map(item => ({
              sale_item_id: item.sale_item_id,
              quantity: item.quantity,
            })));
          }
        }
      }
    } catch (err) {
      console.error('Failed to load sale items:', err);
      toast.error('Failed to load sale items');
    } finally {
      setIsLoadingSale(false);
    }
  };

  const onSubmit = form.handleSubmit((values) => {
    // Filter out items with quantity 0
    const validItems = values.items.filter((item) => item.quantity > 0);
    if (validItems.length === 0) {
      toast.error('Please select at least one item to return');
      return;
    }
    
    createReturnMutation.mutate({ ...values, items: validItems }, {
      onSuccess: () => {
        setReturnOpen(false);
        form.reset({ sale_id: '', return_type: 'refund', reason: '', notes: '', items: [] });
        setSelectedSaleId('');
        setSaleItems([]);
        refetch();
      },
    });
  });

  const updateItemQuantity = (index: number, delta: number) => {
    const currentQuantity = form.getValues(`items.${index}.quantity`) as number | undefined;
    const availableQuantity = saleItems[index]?.available_quantity || 0;
    const newQuantity = Math.max(0, Math.min(availableQuantity, (currentQuantity || 0) + delta));
    form.setValue(`items.${index}.quantity`, newQuantity);
  };

  const removeItem = (index: number) => {
    form.setValue(`items.${index}.quantity`, 0);
  };

  const handleSaleSelect = (saleId: string) => {
    setSelectedSaleId(saleId);
    form.setValue('sale_id', saleId);
    loadSaleItems(saleId);
  };

  const filteredSales = useMemo(() => {
    if (!selectedSaleId) return sales;
    return sales.filter(s => s.id !== selectedSaleId);
  }, [sales, selectedSaleId]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Returns</h1>
            <p className="text-muted-foreground font-bold">Process customer returns and refunds</p>
          </div>
          <Dialog open={returnOpen} onOpenChange={(open) => { if (!open) { setSelectedSaleId(''); setSaleItems([]); form.reset({ sale_id: '', return_type: 'refund', reason: '', notes: '', items: [] }); } setReturnOpen(open); }}>
            <DialogTrigger asChild>
              <Button className="border-2 border-black shadow">
                <RotateCcw className="mr-2 h-4 w-4" />
                New Return
              </Button>
            </DialogTrigger>
            <DialogContent className="border-2 border-black max-w-2xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle className="text-lg font-black">Create Return</DialogTitle>
              </DialogHeader>
              <form onSubmit={onSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="space-y-2">
                  <Label className="font-bold">Select Sale</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search by receipt number or customer..."
                      value={selectedSaleId}
                      onChange={(e) => handleSaleSelect(e.target.value)}
                      className="border-2 border-black pl-10"
                      list="sales-list"
                    />
                    <datalist id="sales-list">
                      {sales.map((sale: any) => (
                        <option key={sale.id} value={sale.id}>
                          {sale.receipt_number} - {sale.customer?.name || 'Walk-in'} - {fromMinorUnits(sale.grand_total_minor)}
                        </option>
                      ))}
                    </datalist>
                  </div>
                  {form.formState.errors.sale_id && (
                    <p className="text-sm text-destructive">{form.formState.errors.sale_id.message}</p>
                  )}
                </div>

                {selectedSaleId && saleItems.length === 0 && !isLoadingSale && (
                  <div className="py-4 text-center text-sm text-muted-foreground">
                    No returnable items found in this sale (all items may already be returned)
                  </div>
                )}

                {isLoadingSale && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2 font-bold">Loading sale items...</span>
                  </div>
                )}

                {saleItems.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 font-bold text-sm border-b-2 border-black pb-2">
                      <span className="flex-1">Product</span>
                      <span className="w-16 text-center">Available</span>
                      <span className="w-20 text-center">Return Qty</span>
                      <span className="w-24 text-right">Line Total</span>
                    </div>
                    {saleItems.map((item, index) => (
                      <div key={item.sale_item_id} className="flex items-center gap-2 p-2 border-2 border-black rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate">{item.product_name}</p>
                          <p className="text-xs text-muted-foreground">{item.product_sku}</p>
                        </div>
                        <span className="w-16 text-center text-sm font-bold">{item.available_quantity}</span>
                        <div className="w-20 flex items-center justify-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 border-2 border-black"
                            onClick={() => updateItemQuantity(index, -1)}
                            disabled={item.quantity <= 0}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-bold">
                            {(form.getValues(`items.${index}.quantity`) as number | undefined) || 0}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 border-2 border-black"
                            onClick={() => updateItemQuantity(index, 1)}
                            disabled={item.quantity >= item.available_quantity}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <span className="w-24 text-right text-sm font-bold">
                          {fromMinorUnits(((form.getValues(`items.${index}.quantity`) as number | undefined) || 0) * item.unit_price_minor)}
                        </span>
                        {item.quantity > 0 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive"
                            onClick={() => removeItem(index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Return Total</span>
                      <span>
                        {fromMinorUnits(
                          saleItems.reduce((sum, item, idx) => {
                            const quantity = form.getValues(`items.${idx}.quantity`) as number | undefined;
                            return sum + ((quantity || 0) * item.unit_price_minor);
                          }, 0)
                        )}
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="font-bold">Return Type</Label>
                  <select
                    {...form.register('return_type')}
                    className="w-full rounded-lg border-2 border-black bg-background p-2 font-bold"
                  >
                    <option value="refund">Refund</option>
                    <option value="exchange">Exchange</option>
                    <option value="store_credit">Store Credit</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Reason</Label>
                  <Textarea {...form.register('reason')} className="border-2 border-black" placeholder="Required for refunds" />
                  {form.formState.errors.reason && (
                    <p className="text-sm text-destructive">{form.formState.errors.reason.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Notes</Label>
                  <Textarea {...form.register('notes')} className="border-2 border-black" />
                </div>
                <Button type="submit" disabled={createReturnMutation.isPending || saleItems.length === 0} className="w-full border-2 border-black shadow">
                  {createReturnMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Return
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>Recent Returns</CardTitle>
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
                <p className="text-sm font-bold text-destructive">Failed to load returns</p>
                <p className="text-xs text-muted-foreground">{error instanceof Error ? error.message : 'Unknown error'}</p>
              </div>
            )}

            {!isLoading && !isError && returns.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No returns yet</p>
                <p className="text-sm text-muted-foreground">Returns will appear here after processing</p>
              </div>
            )}

            {!isLoading && !isError && returns.length > 0 && (
              <div className="space-y-3">
                {returns.map((returnItem) => (
                  <div key={returnItem.id} className="flex items-center justify-between rounded-lg border-2 border-black p-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-black">Return #{returnItem.return_number}</p>
                        <p className="text-xs text-muted-foreground">Sale: {returnItem.sale_id}</p>
                        <p className="text-xs text-muted-foreground">{new Date(returnItem.created_at).toLocaleString()}</p>
                      </div>
                      <Badge variant={statusVariant[returnItem.status] || 'secondary'} className="border-2 border-black">
                        {returnItem.status}
                      </Badge>
                    </div>
                    <Button variant="outline" size="icon" className="border-2 border-black">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
