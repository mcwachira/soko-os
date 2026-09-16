import AppLayout from '@/app/(app)/layout';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';

export default function ProductsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Products</h1>
            <p className="text-muted-foreground font-bold">
              Manage your product catalog
            </p>
          </div>
        </div>

        <EmptyState
          title="No products yet"
          description="Add your first product to start selling."
          action={
            <Button>Add Product</Button>
          }
        />
      </div>
    </AppLayout>
  );
}
