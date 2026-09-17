'use client';

import AppLayout from '@/app/app/layout';
import { usePurchaseOrders } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Plus, Truck, CheckCircle, AlertCircle } from 'lucide-react';
import { useState, useMemo } from 'react';
import { PurchaseOrder, PurchaseOrderItem } from '@soko/domain-types';

type PurchaseOrderWithItems = PurchaseOrder & {
  items?: PurchaseOrderItem[];
  supplier_name?: string;
};

export default function ReceivingPage() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  
  const { data, isLoading, isError } = usePurchaseOrders();
  const purchaseOrders = (data?.data ?? []) as PurchaseOrderWithItems[];

  const filteredPOs = useMemo(() => {
    return purchaseOrders.filter(po => {
      if (query) {
        const q = query.toLowerCase();
        if (!po.po_number.toLowerCase().includes(q) &&
            !po.supplier_name?.toLowerCase().includes(q) &&
            !po.supplier?.name?.toLowerCase().includes(q)) {
          return false;
        }
      }
      if (statusFilter !== 'all' && po.status !== statusFilter) {
        return false;
      }
      if (warehouseFilter !== 'all' && po.warehouse_id !== warehouseFilter) {
        return false;
      }
      return true;
    });
  }, [purchaseOrders, query, statusFilter, warehouseFilter]);

  const statuses = ['all', 'draft', 'approved', 'ordered', 'partial_received', 'received', 'cancelled'];

  const stats = useMemo(() => {
    return {
      pending: purchaseOrders.filter(po => po.status === 'draft' || po.status === 'ordered' || po.status === 'approved').length,
      partial: purchaseOrders.filter(po => po.status === 'partial_received').length,
      received: purchaseOrders.filter(po => po.status === 'received').length,
      total: purchaseOrders.length,
    };
  }, [purchaseOrders]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Receiving</h1>
            <p className="text-muted-foreground font-bold">Manage purchase order receipts and GRNs</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-2 border-black">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-main" />
                <CardTitle className="text-sm font-bold text-muted-foreground">Total POs</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="border-2 border-black">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-warning" />
                <CardTitle className="text-sm font-bold text-muted-foreground">Pending</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-warning">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card className="border-2 border-black">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-info" />
                <CardTitle className="text-sm font-bold text-muted-foreground">Partial</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-info">{stats.partial}</div>
            </CardContent>
          </Card>
          <Card className="border-2 border-black">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success" />
                <CardTitle className="text-sm font-bold text-muted-foreground">Received</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-success">{stats.received}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by PO number or supplier..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="border-2 border-black pl-10"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-base border-2 border-black bg-background px-3 py-2 font-base"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="approved">Approved</option>
                  <option value="ordered">Ordered</option>
                  <option value="partial_received">Partial</option>
                  <option value="received">Received</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <select
                  value={warehouseFilter}
                  onChange={(e) => setWarehouseFilter(e.target.value)}
                  className="rounded-base border-2 border-black bg-background px-3 py-2 font-base"
                >
                  <option value="all">All Warehouses</option>
                </select>
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
                <p className="text-sm font-bold text-destructive">Failed to load purchase orders</p>
              </div>
            )}

            {!isLoading && !isError && filteredPOs.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No purchase orders found</p>
                <p className="text-sm text-muted-foreground">
                  {query || statusFilter !== 'all' || warehouseFilter !== 'all' 
                    ? 'Try adjusting your filters' 
                    : 'No purchase orders yet'}
                </p>
              </div>
            )}

            {!isLoading && !isError && filteredPOs.length > 0 && (
              <div className="space-y-2">
                {filteredPOs.map(po => (
                  <div key={po.id} className="border-2 border-black rounded-lg overflow-hidden">
                    <div className="p-4 border-b-2 border-black flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Truck className="h-6 w-6 text-main" />
                        <div>
                          <p className="font-black">{po.po_number}</p>
                          <p className="text-xs text-muted-foreground">
                            {po.supplier_name || po.supplier?.name || 'Unknown Supplier'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge 
                          variant={po.status === 'received' ? 'default' : 
                            po.status === 'partial_received' ? 'secondary' : 
                            po.status === 'ordered' || po.status === 'approved' ? 'outline' : 
                            po.status === 'draft' ? 'secondary' : 'destructive'} 
                          className="border-2 border-black"
                        >
                          {po.status.replace('_', ' ')}
                        </Badge>
                        {po.expected_date && (
                          <span className="text-xs text-muted-foreground">
                            Expected: {new Date(po.expected_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-4 border-b-2 border-black">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Items</p>
                          <p className="font-bold">{po.items?.length || 0} line items</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total Value</p>
                          <p className="font-bold">{po.grand_total_minor ? `${(po.grand_total_minor / 100).toFixed(2)}` : 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Warehouse</p>
                          <p className="font-bold">{po.warehouse_id?.slice(0, 8)}...</p>
                        </div>
                      </div>
                      <div className="mt-3 border-2 border-black rounded-lg p-3">
                        <p className="font-bold mb-2">Line Items</p>
                        <div className="space-y-1">
                          {po.items?.slice(0, 5).map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs p-2 bg-muted/50 rounded">
                              <span>{item.name} ({item.sku})</span>
                              <span className="font-bold">
                                Ordered: {item.quantity} | Received: {item.received_quantity || 0}
                              </span>
                            </div>
                          ))}
                          {po.items && po.items.length > 5 && (
                            <p className="text-xs text-muted-foreground text-center">
                              +{po.items.length - 5} more items
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-muted/30 border-t-2 border-black flex justify-end gap-2">
                      <button className="border-2 border-black px-4 py-2 font-bold hover:bg-main hover:text-main-foreground transition-colors">
                        Receive
                      </button>
                      <button className="border-2 border-black px-4 py-2 font-bold bg-black text-white hover:bg-main hover:text-main-foreground transition-colors">
                        View Details
                      </button>
                    </div>
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