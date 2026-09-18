'use client';

import AppLayout from '@/app/app/layout';
import { usePosXRead, usePosZRead, usePosTopProducts } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { fromMinorUnits } from '@soko/utils';

export default function PosReportsPage() {
  const [showXRead, setShowXRead] = useState(false);
  const [showZRead, setShowZRead] = useState(false);
  const [showTopProducts, setShowTopProducts] = useState(false);

  const { data: xRead, isLoading: xReadLoading, refetch: refetchXRead } = usePosXRead(showXRead);
  const { data: zRead, isLoading: zReadLoading, refetch: refetchZRead } = usePosZRead(showZRead);
  const { data: topProducts, isLoading: topProductsLoading } = usePosTopProducts(showTopProducts);

  const handleXRead = () => {
    setShowXRead(true);
    setShowZRead(false);
    refetchXRead();
  };

  const handleZRead = () => {
    setShowZRead(true);
    setShowXRead(false);
    refetchZRead();
  };

  const handleTopProducts = () => {
    setShowTopProducts(true);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">POS Reports</h1>
          <p className="text-muted-foreground font-bold">View shift reports and analytics</p>
        </div>

        <div className="flex gap-4">
          <Button onClick={handleXRead} className="border-2 border-black shadow">X-Read</Button>
          <Button onClick={handleZRead} variant="outline" className="border-2 border-black">Z-Read</Button>
          <Button onClick={handleTopProducts} variant="outline" className="border-2 border-black">Top Products</Button>
        </div>

        {xReadLoading && (
          <Card className="border-2 border-black">
            <CardContent className="pt-6">
              <Skeleton className="h-32 w-full border-2 border-black" />
            </CardContent>
          </Card>
        )}

        {xRead && !xReadLoading && (
          <Card className="border-2 border-black">
            <CardHeader>
              <CardTitle>X-Read Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Cash Sales</p>
                  <p className="text-xl font-black">{fromMinorUnits(xRead.data.cash_sales)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">M-Pesa Sales</p>
                  <p className="text-xl font-black">{fromMinorUnits(xRead.data.mpesa_sales)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Card Sales</p>
                  <p className="text-xl font-black">{fromMinorUnits(xRead.data.card_sales)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Sales</p>
                  <p className="text-xl font-black">{fromMinorUnits(xRead.data.total_sales)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Discount</p>
                  <p className="text-xl font-black">{fromMinorUnits(xRead.data.total_discount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Tax</p>
                  <p className="text-xl font-black">{fromMinorUnits(xRead.data.total_tax)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expected Cash</p>
                  <p className="text-xl font-black">{fromMinorUnits(xRead.data.expected_cash)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Transactions</p>
                  <p className="text-xl font-black">{xRead.data.transaction_count}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {zRead && !zReadLoading && (
          <Card className="border-2 border-black">
            <CardHeader>
              <CardTitle>Z-Read Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Opening Float</p>
                  <p className="text-xl font-black">{fromMinorUnits(zRead.data.opening_float)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expected Cash</p>
                  <p className="text-xl font-black">{fromMinorUnits(zRead.data.expected_cash)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Sales</p>
                  <p className="text-xl font-black">{fromMinorUnits(zRead.data.total_sales)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Transactions</p>
                  <p className="text-xl font-black">{zRead.data.transaction_count}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {topProducts && !topProductsLoading && (
          <Card className="border-2 border-black">
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th className="p-2 text-left font-bold">Product</th>
                      <th className="p-2 text-left font-bold">Quantity Sold</th>
                      <th className="p-2 text-left font-bold">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(topProducts.data as Array<{ name: string; total_quantity: number; total_revenue: number }>).map((product) => (
                      <tr key={product.name} className="border-b border-black hover:bg-muted/50">
                        <td className="p-2 font-bold">{product.name}</td>
                        <td className="p-2">{product.total_quantity}</td>
                        <td className="p-2">{fromMinorUnits(product.total_revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
