'use client';

import AppLayout from '@/app/app/layout';
import { useAssemblies } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function AssembliesPage() {
  const { data, isLoading, isError } = useAssemblies();
  const assemblies = data?.data ?? [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Assemblies</h1>
          <p className="text-muted-foreground font-bold">Kits, assemblies, and BOMs</p>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>Assemblies</CardTitle>
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
                <p className="text-sm font-bold text-destructive">Failed to load assemblies</p>
              </div>
            )}

            {!isLoading && !isError && assemblies.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No assemblies found</p>
                <p className="text-sm text-muted-foreground">Create assemblies to build kits or composite products</p>
              </div>
            )}

            {!isLoading && !isError && assemblies.length > 0 && (
              <div className="space-y-2">
                {assemblies.map((a: { id: string; assembly_number: string; type: string; status: string; finished_product_id: string }) => (
                  <div key={a.id} className="flex items-center justify-between border-b border-black p-2">
                    <div>
                      <div className="text-sm font-bold">{a.assembly_number}</div>
                      <div className="text-xs text-muted-foreground">Type: {a.type}</div>
                    </div>
                    <Badge variant={a.status === 'completed' ? 'default' : 'secondary'} className="border-2 border-black">
                      {a.status}
                    </Badge>
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
