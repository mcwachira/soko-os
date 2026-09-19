'use client';

import * as React from 'react';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentShift, useCloseShift } from '@/hooks/useTanStackQuery';
import { CloseShiftSchema } from '@soko/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Import product-specific theme CSS files
import '@/app/app/pos/theme.css';

interface PosCheckoutLayoutProps {
  children: React.ReactNode;
}

export default function PosCheckoutLayout({ children }: PosCheckoutLayoutProps) {
  const { entitlements, isSuperAdmin } = useAuth();
  const { data: currentShift } = useCurrentShift();
  const closeShiftMutation = useCloseShift();
  const [closeShiftOpen, setCloseShiftOpen] = React.useState(false);

  const closeShiftForm = useForm({
    resolver: zodResolver(CloseShiftSchema),
    defaultValues: {
      actual_cash_minor: 0,
      notes: '',
    },
  });

  const handleCloseShift = React.useCallback((values: { actual_cash_minor: number; notes?: string }) => {
    closeShiftMutation.mutate(values, {
      onSuccess: () => {
        setCloseShiftOpen(false);
        closeShiftForm.reset();
      },
    });
  }, [closeShiftMutation, closeShiftForm]);

  const isEntitled = isSuperAdmin || entitlements.pos;

  if (!isEntitled) {
    return (
      <div className="flex min-h-screen w-full">
        <div className="flex min-h-screen flex-col w-full">
          <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b-2 border-black bg-secondary-background px-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight">Soko-OS</span>
            </div>
            <div className="flex-1"></div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="max-w-md rounded-lg border-2 border-black bg-secondary-background p-6 text-center">
                <h2 className="text-xl font-black mb-2">Product Not Available</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  This feature is not included in your current subscription. Please contact your administrator or upgrade your plan.
                </p>
                <Button asChild className="border-2 border-black shadow w-full">
                  <a href="/settings/subscription">View Subscription</a>
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full" data-product="pos">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b-2 border-black bg-secondary-background px-4">
        <div className="flex items-center gap-4">
          <span className="text-xl font-black tracking-tight">Soko POS</span>
          {currentShift?.data && (
            <Badge variant="default" className="border-2 border-black">
              Shift Open
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCloseShiftOpen(true)}
            className="border-2 border-black"
          >
            Close Shift
          </Button>
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-1 min-h-0">
        {children}
      </main>

      <Dialog open={closeShiftOpen} onOpenChange={setCloseShiftOpen}>
        <DialogContent className="border-2 border-black">
          <DialogHeader>
            <DialogTitle className="text-lg font-black">Close Shift</DialogTitle>
          </DialogHeader>
          <form onSubmit={closeShiftForm.handleSubmit(handleCloseShift)} className="space-y-4">
            <div className="space-y-2">
              <Label className="font-bold">Actual Cash</Label>
              <Input
                type="number"
                {...closeShiftForm.register('actual_cash_minor')}
                className="border-2 border-black"
                placeholder="0"
              />
              {closeShiftForm.formState.errors.actual_cash_minor && (
                <p className="text-sm text-destructive">{closeShiftForm.formState.errors.actual_cash_minor.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="font-bold">Notes</Label>
              <Input
                {...closeShiftForm.register('notes')}
                className="border-2 border-black"
                placeholder="Optional notes"
              />
            </div>
            <Button type="submit" disabled={closeShiftMutation.isPending} className="w-full border-2 border-black shadow">
              {closeShiftMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Close Shift
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}