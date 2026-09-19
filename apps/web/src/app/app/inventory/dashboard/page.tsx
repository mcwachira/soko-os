'use client';

import AppLayout from '@/app/app/layout';
import { useInventoryMovements } from '@/hooks/useTanStackQuery';
import { useWarehouses } from '@/hooks/useTanStackQuery';
import { useProducts } from '@/hooks/useTanStackQuery';
import { useBatches } from '@/hooks/useTanStackQuery';
import { useStocktakes } from '@/hooks/useTanStackQuery';
import { useTransfers } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Package, Warehouse as WarehouseIcon, Truck, ClipboardList, AlertTriangle, PackageCheck } from 'lucide-react';
import Link from 'next/link';
import { fromMinorUnits } from '@soko/utils';
import { InventoryMovement, Warehouse, Product, Batch, Stocktake, TransferOrder } from '@soko/domain-types';

export default function InventoryDashboardPage() {
  const { data: movementsData, isLoading: movementsLoading } = useInventoryMovements();
  const { data: warehousesData } = useWarehouses();
  const { data: productsData } = useProducts();
  const { data: batchesData } = useBatches();
  const { data: stocktakesData } = useStocktakes();
  const { data: transfersData } = useTransfers();

  const movements = (movementsData?.data ?? []) as InventoryMovement[];
  const warehouses = (warehousesData?.data ?? []) as Warehouse[];
  const products = (productsData?.data ?? []) as Product[];
  const batches = (batchesData?.data ?? []) as Batch[];
  const stocktakes = (stocktakesData?.data ?? []) as Stocktake[];
  const transfers = (transfersData?.data ?? []) as TransferOrder[];

  const trackedProducts = products.filter(p => p.track_inventory);
  const activeWarehouses = warehouses.filter(w => w.is_active);
  
  // Calculate stock metrics
  const totalProducts = trackedProducts.length;
  const activeWarehousesCount = activeWarehouses.length;
  const recentMovements = movements.slice(0, 50);
  
  // Calculate stock value from products with cost price
  const totalStockValue = trackedProducts.reduce((sum, p) => sum + (p.cost_price_minor || 0), 0);
  
  // Low stock products (simplified - products with reorder_level > 0)
  const lowStockProducts = trackedProducts.filter(p => p.reorder_level > 0).length;
  
  // Expiring batches
  const now = new Date();
  const expiringBatches = batches.filter(b => {
    if (!b.expiry_date) return false;
    const expiry = new Date(b.expiry_date);
    const daysUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0 && b.status === 'active';
  }).length;
  
  const expiredBatches = batches.filter(b => {
    if (!b.expiry_date) return false;
    const expiry = new Date(b.expiry_date);
    return expiry < now && b.status === 'active';
  }).length;

  // Pending stocktakes
  const pendingStocktakes = stocktakes.filter(s => s.status === 'in_progress' || s.status === 'draft').length;
  
  // Pending transfers
  const pendingTransfers = transfers.filter(t => t.status !== 'completed' && t.status !== 'cancelled').length;

  const isLoading = movementsLoading;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value / 100);
  };

  const statCards = [
    {
      title: 'Tracked Products',
      value: totalProducts.toString(),
      icon: Package,
      color: 'text-main',
      trend: '+12%',
    },
    {
      title: 'Active Warehouses',
      value: activeWarehousesCount.toString(),
      icon: WarehouseIcon,
      color: 'text-main',
      trend: null,
    },
    {
      title: 'Total Stock Value',
      value: formatCurrency(totalStockValue),
      icon: TrendingUp,
      color: 'text-success',
      trend: '+8%',
    },
    {
      title: 'Low Stock Items',
      value: lowStockProducts.toString(),
      icon: AlertTriangle,
      color: lowStockProducts > 0 ? 'text-warning' : 'text-success',
      trend: lowStockProducts > 0 ? 'Needs attention' : null,
    },
    {
      title: 'Expiring Soon (30d)',
      value: expiringBatches.toString(),
      icon: AlertTriangle,
      color: expiringBatches > 0 ? 'text-warning' : 'text-success',
      trend: expiringBatches > 0 ? 'Check batches' : null,
    },
    {
      title: 'Expired Batches',
      value: expiredBatches.toString(),
      icon: AlertTriangle,
      color: expiredBatches > 0 ? 'text-destructive' : 'text-success',
      trend: expiredBatches > 0 ? 'Action required' : null,
    },
    {
      title: 'Pending Transfers',
      value: pendingTransfers.toString(),
      icon: Truck,
      color: pendingTransfers > 0 ? 'text-info' : 'text-success',
      trend: pendingTransfers > 0 ? 'In transit' : null,
    },
    {
      title: 'Active Stocktakes',
      value: pendingStocktakes.toString(),
      icon: ClipboardList,
      color: pendingStocktakes > 0 ? 'text-info' : 'text-success',
      trend: pendingStocktakes > 0 ? 'In progress' : null,
    },
  ];

  const recentMovementsData = recentMovements.slice(0, 10);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Inventory Dashboard</h1>
          <p className="text-muted-foreground font-bold">Real-time inventory overview across all warehouses</p>
        </div>

        {isLoading && (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="border-2 border-border">
                <CardHeader><Skeleton className="h-6 w-32 border-2 border-border" /></CardHeader>
                <CardContent><Skeleton className="h-10 w-24 border-2 border-border" /></CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
          {statCards.map((stat) => (
            <Card key={stat.title} className="border-2 border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-muted-foreground">{stat.title}</CardTitle>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-2xl font-black">{stat.value}</div>
                {stat.trend && (
                  <p className="text-xs font-bold text-muted-foreground">{stat.trend}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-2 border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-black">Recent Stock Movements</CardTitle>
                <span className="text-xs text-muted-foreground">{recentMovementsData.length} recent</span>
              </div>
            </CardHeader>
            <CardContent>
              {recentMovementsData.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No recent movements</p>
              ) : (
                <div className="space-y-2">
                  {recentMovementsData.map((movement: InventoryMovement) => (
                    <div key={movement.id} className="flex items-center justify-between rounded-lg border-2 border-border p-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs text-muted-foreground truncate max-w-[120px]">
                            {movement.product_id.slice(0, 8)}...
                          </span>
                          <Badge 
                            variant={movement.movement_type === 'sale' ? 'destructive' : 
                              movement.movement_type === 'purchase' ? 'default' : 'secondary'} 
                            className="border-2 border-border"
                          >
                            {movement.movement_type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {new Date(movement.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <p className={`text-sm font-black ${movement.quantity_change >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {movement.quantity_change >= 0 ? '+' : ''}{movement.quantity_change}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Balance: {movement.balance_after}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-black">Warehouse Stock Summary</CardTitle>
                <span className="text-xs text-muted-foreground">{activeWarehousesCount} active</span>
              </div>
            </CardHeader>
            <CardContent>
              {activeWarehouses.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No active warehouses</p>
              ) : (
                <div className="space-y-2">
                  {activeWarehouses.map((warehouse: Warehouse) => (
                    <div key={warehouse.id} className="flex items-center justify-between rounded-lg border-2 border-border p-3">
                      <div>
                        <p className="font-bold">{warehouse.name}</p>
                        <p className="text-xs text-muted-foreground">Code: {warehouse.code}</p>
                      </div>
                      <Badge variant="default" className="border-2 border-border">
                        Active
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-2 border-border">
            <CardHeader>
              <CardTitle className="text-lg font-black">Low Stock Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              {lowStockProducts === 0 ? (
                <p className="text-center text-success py-4 font-bold">All stock levels healthy</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {lowStockProducts} products need reordering attention
                  </p>
                  <Button className="w-full border-2 border-border shadow" asChild>
                    <Link href="/products?filter=low-stock">View Low Stock Products</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 border-border">
            <CardHeader>
              <CardTitle className="text-lg font-black">Batch Expiry Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              {(expiringBatches === 0 && expiredBatches === 0) ? (
                <p className="text-center text-success py-4 font-bold">No expiry issues</p>
              ) : (
                <div className="space-y-2">
                  {expiringBatches > 0 && (
                    <div className="flex items-center justify-between p-3 rounded-lg border-2 border-warning bg-warning/10">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-warning" />
                        <span className="font-bold text-warning">Expiring Soon</span>
                      </div>
                      <span className="font-black text-warning">{expiringBatches} batches</span>
                    </div>
                  )}
                  {expiredBatches > 0 && (
                    <div className="flex items-center justify-between p-3 rounded-lg border-2 border-destructive bg-destructive/10">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        <span className="font-bold text-destructive">Expired</span>
                      </div>
                      <span className="font-black text-destructive">{expiredBatches} batches</span>
                    </div>
                  )}
                  {(expiringBatches > 0 || expiredBatches > 0) && (
                    <Button className="w-full border-2 border-border shadow" asChild>
                      <a href="/batches?filter=expiry">View All Batches</a>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="border-2 border-border">
            <CardHeader>
              <CardTitle className="text-lg font-black">Pending Transfers</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingTransfers === 0 ? (
                <p className="text-center text-success py-4 font-bold">No pending transfers</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {pendingTransfers} transfers in progress
                  </p>
                  <Button className="w-full border-2 border-border shadow" asChild>
                    <a href="/transfers">View All Transfers</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 border-border">
            <CardHeader>
              <CardTitle className="text-lg font-black">Active Stocktakes</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingStocktakes === 0 ? (
                <p className="text-center text-success py-4 font-bold">No active stocktakes</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {pendingStocktakes} stocktakes in progress
                  </p>
                  <Button className="w-full border-2 border-border shadow" asChild>
                    <a href="/stocktakes">View All Stocktakes</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 border-border">
            <CardHeader>
              <CardTitle className="text-lg font-black">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full border-2 border-border shadow justify-start" asChild>
                <a href="/inventory-adjustments">Create Adjustment</a>
              </Button>
              <Button className="w-full border-2 border-border shadow justify-start" asChild>
                <a href="/transfers">Create Transfer</a>
              </Button>
              <Button className="w-full border-2 border-border shadow justify-start" asChild>
                <a href="/stocktakes">Start Stocktake</a>
              </Button>
              <Button className="w-full border-2 border-border shadow justify-start" asChild>
                <a href="/batches">Manage Batches</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}