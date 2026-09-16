import AppLayout from '@/app/(app)/layout';

export default function OrdersPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Orders</h1>
          <p className="text-muted-foreground font-bold">
            View and manage orders
          </p>
        </div>
        <div className="rounded-xl border-2 border-black bg-secondary-background p-6 shadow">
          <p className="text-muted-foreground font-bold">Orders module coming soon.</p>
        </div>
      </div>
    </AppLayout>
  );
}
