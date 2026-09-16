import AppLayout from '@/app/(app)/layout';
import { EmptyState } from '@/components/shared/empty-state';

export default function InventoryPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Inventory</h1>
          <p className="text-muted-foreground font-bold">
            Track stock levels across your warehouses
          </p>
        </div>

        <EmptyState
          title="No inventory data"
          description="Add products and warehouses to start tracking inventory."
        />
      </div>
    </AppLayout>
  );
}
