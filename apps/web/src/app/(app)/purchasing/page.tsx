import AppLayout from '@/app/(app)/layout';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';

export default function PurchasingPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Purchasing</h1>
          <p className="text-muted-foreground font-bold">
            Manage purchase orders and supplier orders
          </p>
        </div>

        <EmptyState
          title="No purchase orders"
          description="Create your first purchase order to start buying from suppliers."
          action={
            <Button>New Purchase Order</Button>
          }
        />
      </div>
    </AppLayout>
  );
}
