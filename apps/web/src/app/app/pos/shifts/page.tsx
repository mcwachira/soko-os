'use client';

import AppLayout from '@/app/app/layout';
import { useCurrentShift, useOpenShift, useCloseShift, useCashMovements, useCreateCashMovement } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { OpenShiftSchema, CloseShiftSchema } from '@soko/validation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Loader2, Plus, ArrowUp, ArrowDown, Vault, Coins } from 'lucide-react';
import { useState } from 'react';
import { fromMinorUnits } from '@soko/utils';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive'> = {
  open: 'default',
  closed: 'secondary',
  cancelled: 'destructive',
};

const movementTypeLabels: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  cash_in: { label: 'Cash In', icon: ArrowUp },
  cash_out: { label: 'Cash Out', icon: ArrowDown },
  safe_drop: { label: 'Safe Drop', icon: Vault },
  float: { label: 'Float Adjustment', icon: Coins },
};

export default function ShiftsPage() {
  const [openDialog, setOpenDialog] = useState(false);
  const [closeDialog, setCloseDialog] = useState(false);
  const [movementDialog, setMovementDialog] = useState(false);
  const [movementType, setMovementType] = useState<'cash_in' | 'cash_out' | 'safe_drop' | 'float'>('cash_in');
  const { data: shift, isLoading, isError } = useCurrentShift();
  const { data: movementsData, refetch: refetchMovements } = useCashMovements(
    shift?.data?.id ? { shift_id: shift.data.id } : undefined
  );
  const openShiftMutation = useOpenShift();
  const closeShiftMutation = useCloseShift();
  const createMovementMutation = useCreateCashMovement();

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

  const movementForm = useForm({
    defaultValues: {
      movement_type: 'cash_in' as 'cash_in' | 'cash_out' | 'safe_drop' | 'float',
      amount_minor: 0,
      reference: '',
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

  const handleMovement = movementForm.handleSubmit((values) => {
    if (!shift?.data) return;
    createMovementMutation.mutate(
      { ...values, shift_id: shift.data.id },
      {
        onSuccess: () => {
          setMovementDialog(false);
          movementForm.reset({ movement_type: 'cash_in', amount_minor: 0, reference: '', notes: '' });
          refetchMovements();
        },
      }
    );
  });

  const movements = movementsData?.data ?? [];
  const cashInTotal = movements
    .filter(m => m.movement_type === 'cash_in' || m.movement_type === 'float')
    .reduce((sum, m) => sum + m.amount_minor, 0);
  const cashOutTotal = movements
    .filter(m => m.movement_type === 'cash_out' || m.movement_type === 'safe_drop')
    .reduce((sum, m) => sum + m.amount_minor, 0);
  const netMovement = cashInTotal - cashOutTotal;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Cash & Shifts</h1>
            <p className="text-muted-foreground font-bold">Manage cash drawers and shift sessions</p>
          </div>
          {shift?.data && (
            <Dialog open={movementDialog} onOpenChange={setMovementDialog}>
              <DialogTrigger asChild>
                <Button className="border-2 border-black shadow" variant="outline">
                  <Plus className="mr-2 h-4 w-4" /> Cash Movement
                </Button>
              </DialogTrigger>
              <DialogContent className="border-2 border-black">
                <DialogHeader>
                  <DialogTitle className="text-lg font-black">Record Cash Movement</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleMovement} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-bold">Movement Type</Label>
                    <Select value={movementType} onValueChange={(v) => { const val = v as 'cash_in' | 'cash_out' | 'safe_drop' | 'float'; setMovementType(val); movementForm.setValue('movement_type', val); }}>
                      <SelectTrigger className="border-2 border-black">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash_in">Cash In (Paid In)</SelectItem>
                        <SelectItem value="cash_out">Cash Out (Paid Out)</SelectItem>
                        <SelectItem value="safe_drop">Safe Drop</SelectItem>
                        <SelectItem value="float">Float Adjustment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Amount</Label>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      {...movementForm.register('amount_minor', { valueAsNumber: true })}
                      className="border-2 border-black"
                      placeholder="0"
                    />
                    {movementForm.formState.errors.amount_minor && (
                      <p className="text-sm text-destructive">{movementForm.formState.errors.amount_minor.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Reference</Label>
                    <Input
                      {...movementForm.register('reference')}
                      className="border-2 border-black"
                      placeholder="e.g., Invoice #123, Supplier payment"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Notes</Label>
                    <Input
                      {...movementForm.register('notes')}
                      className="border-2 border-black"
                      placeholder="Optional notes"
                    />
                  </div>
                  <Button type="submit" disabled={createMovementMutation.isPending} className="w-full border-2 border-black shadow">
                    {createMovementMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Record Movement
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-2 border-black md:col-span-2 lg:col-span-2">
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
                  <Separator />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-success font-bold">Cash In / Float</span>
                      <span className="font-bold">{fromMinorUnits(cashInTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-destructive font-bold">Cash Out / Safe Drop</span>
                      <span className="font-bold">{fromMinorUnits(cashOutTotal)}</span>
                    </div>
                    <div className="flex justify-between border-t-2 border-black pt-2 font-bold">
                      <span>Net Movement</span>
                      <span className={netMovement >= 0 ? 'text-success' : 'text-destructive'}>
                        {fromMinorUnits(netMovement)}
                      </span>
                    </div>
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
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Shift Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <p className="font-bold">Opening a shift starts your cash session.</p>
                <p className="text-muted-foreground">You must open a shift before making sales.</p>
                <p className="text-muted-foreground">When you close the shift, you will reconcile expected vs actual cash.</p>
                <Separator />
                <p className="font-bold">Cash Movements:</p>
                <p className="text-muted-foreground text-sm">Record paid in, paid out, safe drops, and float adjustments during your shift.</p>
                <p className="text-muted-foreground text-sm">All movements are included in the shift reconciliation.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {shift?.data && movements.length > 0 && (
          <Card className="border-2 border-black md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Cash Movements This Shift ({movements.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {movements.map((movement: any) => {
                  const typeInfo = movementTypeLabels[movement.movement_type] || { label: movement.movement_type, icon: Coins };
                  const Icon = typeInfo.icon;
                  const isPositive = movement.movement_type === 'cash_in' || movement.movement_type === 'float';
                  return (
                    <div key={movement.id} className="flex items-center justify-between p-3 border-2 border-black rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${isPositive ? 'text-success' : 'text-destructive'}`} />
                        <div>
                          <p className="font-bold text-sm">{typeInfo.label}</p>
                          <p className="text-xs text-muted-foreground">{movement.reference || 'No reference'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${isPositive ? 'text-success' : 'text-destructive'}`}>
                          {isPositive ? '+' : '-'}{fromMinorUnits(movement.amount_minor)}
                        </p>
                        <p className="text-xs text-muted-foreground">{new Date(movement.created_at).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}