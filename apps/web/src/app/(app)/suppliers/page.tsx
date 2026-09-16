import AppLayout from '@/app/(app)/layout';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';

export default function SuppliersPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Suppliers</h1>
          <p className="text-muted-foreground font-bold">
            Manage your supplier relationships
          </p>
        </div>

        <EmptyState
          title="No suppliers yet"
          description="Add your first supplier to start managing purchases."
          action={
            <Button>Add Supplier</Button>
          }
        />
      </div>
    </AppLayout>
  );
}
