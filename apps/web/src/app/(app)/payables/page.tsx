import AppLayout from '@/app/(app)/layout';

export default function PayablesPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Payables</h1>
          <p className="text-muted-foreground font-bold">
            Track money you owe
          </p>
        </div>
        <div className="rounded-xl border-2 border-black bg-secondary-background p-6 shadow">
          <p className="text-muted-foreground font-bold">Payables module coming soon.</p>
        </div>
      </div>
    </AppLayout>
  );
}
