'use client';

import AppLayout from '@/app/app/layout';
import { useShipments, useUpdateShipment } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ShipmentsPage() {
  const { data, isLoading, isError } = useShipments();
  const updateMutation = useUpdateShipment();
  const shipments = data?.data ?? [];

  const handleStatusChange = async (id: string, status: string | null) => {
    if (status) {
      await updateMutation.mutateAsync({ id, data: { status } });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Shipments</h1>
          <p className="text-muted-foreground font-bold">Shipping and delivery tracking</p>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>Shipments</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full border-2 border-black" />
                ))}
              </div>
            )}

            {isError && (
              <div className="py-8 text-center">
                <p className="text-sm font-bold text-destructive">Failed to load shipments</p>
              </div>
            )}

            {!isLoading && !isError && shipments.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No shipments found</p>
                <p className="text-sm text-muted-foreground">Shipments are created during order fulfillment</p>
              </div>
            )}

            {!isLoading && !isError && shipments.length > 0 && (
              <div className="space-y-2">
                {shipments.map((shipment: { id: string; shipment_number: string; carrier?: string; tracking_number?: string; status: string }) => (
                  <div key={shipment.id} className="flex items-center justify-between border-b border-black p-2">
                    <div>
                      <div className="text-sm font-bold">{shipment.shipment_number}</div>
                      <div className="text-xs text-muted-foreground">
                        {shipment.carrier || 'No carrier'} · {shipment.tracking_number || 'No tracking'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={shipment.status}
                        onValueChange={(value) => handleStatusChange(shipment.id, value)}
                      >
                        <SelectTrigger className="w-40 border-2 border-black">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="picked_up">Picked Up</SelectItem>
                          <SelectItem value="in_transit">In Transit</SelectItem>
                          <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                          <SelectItem value="returned">Returned</SelectItem>
                        </SelectContent>
                      </Select>
                      <Badge variant={shipment.status === 'delivered' ? 'default' : 'secondary'} className="border-2 border-black">
                        {shipment.status}
                      </Badge>
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
