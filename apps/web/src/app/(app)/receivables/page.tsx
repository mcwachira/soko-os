import AppLayout from '@/app/(app)/layout';

export default function ReceivablesPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Receivables</h1>
          <p className="text-muted-foreground font-bold">
            Track money owed to you
          </p>
        </div>
        <div className="rounded-xl border-2 border-black bg-secondary-background p-6 shadow">
          <p className="text-muted-foreground font-bold">Receivables module coming soon.</p>
        </div>
      </div>
    </AppLayout>
  );
}
