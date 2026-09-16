'use client';

import AppLayout from '@/app/(app)/layout';
import { useCurrentShift, useOpenShift, useCloseShift } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { OpenShiftSchema, CloseShiftSchema } from '@soko/validation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Plus } from 'lucide-react';
import { useState } from 'react';
import { fromMinorUnits } from '@soko/utils';

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive'> = {
  open: 'default',
  closed: 'secondary',
  cancelled: 'destructive',
};

export default function ShiftsPage() {
  const [openDialog, setOpenDialog] = useState(false);
  const [closeDialog, setCloseDialog] = useState(false);
  const { data: shift, isLoading, isError } = useCurrentShift();
  const openShiftMutation = useOpenShift();
  const closeShiftMutation = useCloseShift();

  const openForm = useForm({
    resolver: zodResolver(OpenShiftSchema),
    defaultValues: {
      terminal_id: '',
      opening_float_minor: 0,
      notes: '',
    },
  });

  const closeForm = useForm({
    resolver: zodResolver(CloseShiftSchema),
    defaultValues: {
      actual_cash_minor: 0,
      notes: '',
    },
  });

  const handleOpen = openForm.handleSubmit((values) => {
    openShiftMutation.mutate(values, {
      onSuccess: () => setOpenDialog(false),
    });
  });

  const handleClose = closeForm.handleSubmit((values) => {
    closeShiftMutation.mutate(values, {
      onSuccess: () => setCloseDialog(false),
    });
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Cash & Shifts</h1>
          <p className="text-muted-foreground font-bold">Manage cash drawers and shift sessions</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-2 border-black">
            <CardHeader>
              <CardTitle>Current Shift</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading && <Skeleton className="h-24 w-full border-2 border-black" />}

              {isError && (
                <p className="text-sm font-bold text-destructive">Failed to load shift</p>
              )}

              {!isLoading && !isError && !shift?.data && (
                <div className="py-6 text-center">
                  <p className="mb-4 text-lg font-bold">No active shift</p>
                  <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                    <DialogTrigger asChild>
                      <Button className="w-full border-2 border-black shadow">
                        <Plus className="mr-2 h-4 w-4" /> Open Shift
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="border-2 border-black">
                      <DialogHeader>
                        <DialogTitle className="text-lg font-black">Open Shift</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleOpen} className="space-y-4">
                        <div className="space-y-2">
                          <Label className="font-bold">Terminal ID</Label>
                          <Input {...openForm.register('terminal_id')} className="border-2 border-black" />
                          {openForm.formState.errors.terminal_id && (
                            <p className="text-sm text-destructive">{openForm.formState.errors.terminal_id.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label className="font-bold">Opening Float</Label>
                          <Input type="number" {...openForm.register('opening_float_minor')} className="border-2 border-black" />
                          {openForm.formState.errors.opening_float_minor && (
                            <p className="text-sm text-destructive">{openForm.formState.errors.opening_float_minor.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label className="font-bold">Notes</Label>
                          <Input {...openForm.register('notes')} className="border-2 border-black" />
                        </div>
                        <Button type="submit" disabled={openShiftMutation.isPending} className="w-full border-2 border-black shadow">
                          {openShiftMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Open Shift
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              )}

              {!isLoading && !isError && shift?.data && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">Status</span>
                    <Badge variant={statusVariant[shift.data.status] || 'secondary'} className="border-2 border-black">
                      {shift.data.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">Opened</span>
                    <span className="text-sm">{new Date(shift.data.opened_at).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">Opening Float</span>
                    <span className="text-sm">{fromMinorUnits(shift.data.opening_float_minor)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">Expected Cash</span>
                    <span className="text-sm">{shift.data.expected_cash_minor != null ? fromMinorUnits(shift.data.expected_cash_minor) : '—'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">Actual Cash</span>
                    <span className="text-sm">{shift.data.actual_cash_minor != null ? fromMinorUnits(shift.data.actual_cash_minor) : '—'}</span>
                  </div>
                  <Dialog open={closeDialog} onOpenChange={setCloseDialog}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" className="w-full border-2 border-black">
                        Close Shift
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="border-2 border-black">
                      <DialogHeader>
                        <DialogTitle className="text-lg font-black">Close Shift</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleClose} className="space-y-4">
                        <div className="space-y-2">
                          <Label className="font-bold">Actual Cash</Label>
                          <Input type="number" {...closeForm.register('actual_cash_minor')} className="border-2 border-black" />
                          {closeForm.formState.errors.actual_cash_minor && (
                            <p className="text-sm text-destructive">{closeForm.formState.errors.actual_cash_minor.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label className="font-bold">Notes</Label>
                          <Input {...closeForm.register('notes')} className="border-2 border-black" />
                        </div>
                        <Button type="submit" disabled={closeShiftMutation.isPending} variant="destructive" className="w-full border-2 border-black">
                          {closeShiftMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Close Shift
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 border-black">
            <CardHeader>
              <CardTitle>Shift Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <p className="font-bold">Opening a shift starts your cash session.</p>
                <p className="text-muted-foreground">You must open a shift before making sales.</p>
                <p className="text-muted-foreground">When you close the shift, you will reconcile expected vs actual cash.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
