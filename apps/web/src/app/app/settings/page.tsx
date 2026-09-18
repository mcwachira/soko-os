'use client';

import AppLayout from '@/app/app/layout';
import { useAccounts } from '@/hooks/useTanStackQuery';
import { useFiscalYears } from '@/hooks/useTanStackQuery';
import { useAccountingPeriods } from '@/hooks/useTanStackQuery';
import { useTaxRates } from '@/hooks/useTanStackQuery';
import { useCreateAccount, useUpdateAccount } from '@/hooks/useTanStackQuery';
import { useCreateFiscalYear, useUpdateFiscalYear, useDeleteFiscalYear } from '@/hooks/useTanStackQuery';
import { useCreateAccountingPeriod } from '@/hooks/useTanStackQuery';
import { useCreateTaxRate, useUpdateTaxRate, useDeleteTaxRate } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from '@/components/ui/alert-dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Account, FiscalYear, AccountingPeriod, TaxRate } from '@soko/domain-types';

const accountFormSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['asset', 'liability', 'equity', 'revenue', 'expense']),
  currency: z.string(),
});

const fiscalYearFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
});

const accountingPeriodFormSchema = z.object({
  fiscal_year_id: z.string().min(1, 'Fiscal year is required'),
  name: z.string().min(1, 'Name is required'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  status: z.enum(['open', 'closed', 'locked']),
});

const taxRateFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  percentage: z.number().min(0).max(100),
  is_active: z.boolean(),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;
type FiscalYearFormValues = z.infer<typeof fiscalYearFormSchema>;
type AccountingPeriodFormValues = z.infer<typeof accountingPeriodFormSchema>;
type TaxRateFormValues = z.infer<typeof taxRateFormSchema>;

export default function SettingsPage() {
  const [tab, setTab] = useState('accounts');
  const { data: accountsData, isLoading: accountsLoading } = useAccounts();
  const { data: fiscalYearsData, isLoading: fiscalYearsLoading } = useFiscalYears();
  const { data: periodsData, isLoading: periodsLoading } = useAccountingPeriods();
  const { data: taxRatesData, isLoading: taxRatesLoading } = useTaxRates();
  const createAccountMutation = useCreateAccount();
  const updateAccountMutation = useUpdateAccount();
  const createFiscalYearMutation = useCreateFiscalYear();
  const updateFiscalYearMutation = useUpdateFiscalYear();
  const deleteFiscalYearMutation = useDeleteFiscalYear();
  const createPeriodMutation = useCreateAccountingPeriod();
  const createTaxRateMutation = useCreateTaxRate();
  const updateTaxRateMutation = useUpdateTaxRate();
  const deleteTaxRateMutation = useDeleteTaxRate();

  const accounts = accountsData?.data ?? [];
  const fiscalYears = fiscalYearsData?.data ?? [];
  const periods = periodsData?.data ?? [];
  const taxRates = taxRatesData?.data ?? [];

  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const accountForm = useForm<AccountFormValues>({ resolver: zodResolver(accountFormSchema), defaultValues: { code: '', name: '', type: 'asset', currency: 'KES' } });

  const [fyDialogOpen, setFyDialogOpen] = useState(false);
  const [editingFy, setEditingFy] = useState<FiscalYear | null>(null);
  const fyForm = useForm<FiscalYearFormValues>({ resolver: zodResolver(fiscalYearFormSchema), defaultValues: { name: '', start_date: '', end_date: '' } });

  const [periodDialogOpen, setPeriodDialogOpen] = useState(false);
  const periodForm = useForm<AccountingPeriodFormValues>({ resolver: zodResolver(accountingPeriodFormSchema), defaultValues: { fiscal_year_id: '', name: '', start_date: '', end_date: '', status: 'open' } });

  const [taxDialogOpen, setTaxDialogOpen] = useState(false);
  const [editingTax, setEditingTax] = useState<TaxRate | null>(null);
  const taxForm = useForm<TaxRateFormValues>({ resolver: zodResolver(taxRateFormSchema), defaultValues: { name: '', code: '', percentage: 0, is_active: true } });

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    accountForm.reset({ code: account.code, name: account.name, type: account.type as AccountFormValues['type'], currency: account.currency });
    setAccountDialogOpen(true);
  };

  const handleCreateAccount = () => {
    setEditingAccount(null);
    accountForm.reset({ code: '', name: '', type: 'asset', currency: 'KES' });
    setAccountDialogOpen(true);
  };

  const onSubmitAccount = async (values: AccountFormValues) => {
    if (editingAccount) {
      await updateAccountMutation.mutateAsync({ id: editingAccount.id, data: values });
    } else {
      await createAccountMutation.mutateAsync(values);
    }
    setAccountDialogOpen(false);
    setEditingAccount(null);
  };

  const handleEditFy = (fy: FiscalYear) => {
    setEditingFy(fy);
    fyForm.reset({ name: fy.name, start_date: fy.start_date, end_date: fy.end_date });
    setFyDialogOpen(true);
  };

  const handleCreateFy = () => {
    setEditingFy(null);
    fyForm.reset({ name: '', start_date: '', end_date: '' });
    setFyDialogOpen(true);
  };

  const onSubmitFy = async (values: FiscalYearFormValues) => {
    if (editingFy) {
      await updateFiscalYearMutation.mutateAsync({ id: editingFy.id, data: values });
    } else {
      await createFiscalYearMutation.mutateAsync(values);
    }
    setFyDialogOpen(false);
    setEditingFy(null);
  };

  const onSubmitPeriod = async (values: AccountingPeriodFormValues) => {
    await createPeriodMutation.mutateAsync(values);
    setPeriodDialogOpen(false);
    periodForm.reset();
  };

  const handleEditTax = (tax: TaxRate) => {
    setEditingTax(tax);
    taxForm.reset({ name: tax.name, code: tax.code, percentage: tax.percentage, is_active: tax.is_active });
    setTaxDialogOpen(true);
  };

  const handleCreateTax = () => {
    setEditingTax(null);
    taxForm.reset({ name: '', code: '', percentage: 0, is_active: true });
    setTaxDialogOpen(true);
  };

  const onSubmitTax = async (values: TaxRateFormValues) => {
    if (editingTax) {
      await updateTaxRateMutation.mutateAsync({ id: editingTax.id, data: values });
    } else {
      await createTaxRateMutation.mutateAsync(values);
    }
    setTaxDialogOpen(false);
    setEditingTax(null);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Settings</h1>
          <p className="text-muted-foreground font-bold">Accounting configuration</p>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 border-2 border-black">
            <TabsTrigger value="accounts">Chart of Accounts</TabsTrigger>
            <TabsTrigger value="fiscal-years">Fiscal Years</TabsTrigger>
            <TabsTrigger value="periods">Accounting Periods</TabsTrigger>
            <TabsTrigger value="tax-rates">Tax Rates</TabsTrigger>
          </TabsList>

          <TabsContent value="accounts" className="space-y-4">
            <Card className="border-2 border-black">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Chart of Accounts</CardTitle>
                  <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={handleCreateAccount} className="border-2 border-black shadow">
                        <Plus className="mr-2 h-4 w-4" /> Add Account
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="border-2 border-black">
                      <DialogHeader>
                        <DialogTitle>{editingAccount ? 'Edit Account' : 'Add Account'}</DialogTitle>
                      </DialogHeader>
                      <Form {...accountForm}>
                        <form onSubmit={accountForm.handleSubmit(onSubmitAccount)} className="space-y-4">
                          <FormField control={accountForm.control} name="code" render={({ field }) => (<FormItem><FormLabel>Code</FormLabel><FormControl><Input {...field} className="border-2 border-black" /></FormControl><FormMessage /></FormItem>)} />
                          <FormField control={accountForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} className="border-2 border-black" /></FormControl><FormMessage /></FormItem>)} />
                          <FormField control={accountForm.control} name="type" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Type</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger className="border-2 border-black"><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                  <SelectItem value="asset">Asset</SelectItem>
                                  <SelectItem value="liability">Liability</SelectItem>
                                  <SelectItem value="equity">Equity</SelectItem>
                                  <SelectItem value="revenue">Revenue</SelectItem>
                                  <SelectItem value="expense">Expense</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setAccountDialogOpen(false)} className="border-2 border-black">Cancel</Button>
                            <Button type="submit" className="border-2 border-black shadow">{editingAccount ? 'Update' : 'Create'}</Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {accountsLoading && <Skeleton className="h-48 w-full border-2 border-black" />}
                {!accountsLoading && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead><tr className="border-b-2 border-black"><th className="p-2 text-left font-bold">Code</th><th className="p-2 text-left font-bold">Name</th><th className="p-2 text-left font-bold">Type</th><th className="p-2 text-left font-bold">Actions</th></tr></thead>
                      <tbody>
                        {accounts.map((account) => (
                          <tr key={account.id} className="border-b border-black">
                            <td className="p-2 font-mono">{account.code}</td>
                            <td className="p-2">{account.name}</td>
                            <td className="p-2 capitalize">{account.type}</td>
                            <td className="p-2"><Button variant="outline" size="icon" onClick={() => handleEditAccount(account)} className="border-2 border-black"><Pencil className="h-4 w-4" /></Button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fiscal-years" className="space-y-4">
            <Card className="border-2 border-black">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Fiscal Years</CardTitle>
                  <Dialog open={fyDialogOpen} onOpenChange={setFyDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={handleCreateFy} className="border-2 border-black shadow"><Plus className="mr-2 h-4 w-4" /> Add Year</Button>
                    </DialogTrigger>
                    <DialogContent className="border-2 border-black">
                      <DialogHeader><DialogTitle>{editingFy ? 'Edit Fiscal Year' : 'Add Fiscal Year'}</DialogTitle></DialogHeader>
                      <Form {...fyForm}>
                        <form onSubmit={fyForm.handleSubmit(onSubmitFy)} className="space-y-4">
                          <FormField control={fyForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} className="border-2 border-black" /></FormControl><FormMessage /></FormItem>)} />
                          <div className="grid grid-cols-2 gap-4">
                            <FormField control={fyForm.control} name="start_date" render={({ field }) => (<FormItem><FormLabel>Start Date</FormLabel><FormControl><Input type="date" {...field} className="border-2 border-black" /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={fyForm.control} name="end_date" render={({ field }) => (<FormItem><FormLabel>End Date</FormLabel><FormControl><Input type="date" {...field} className="border-2 border-black" /></FormControl><FormMessage /></FormItem>)} />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setFyDialogOpen(false)} className="border-2 border-black">Cancel</Button>
                            <Button type="submit" className="border-2 border-black shadow">{editingFy ? 'Update' : 'Create'}</Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {fiscalYearsLoading && <Skeleton className="h-48 w-full border-2 border-black" />}
                {!fiscalYearsLoading && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead><tr className="border-b-2 border-black"><th className="p-2 text-left font-bold">Name</th><th className="p-2 text-left font-bold">Period</th><th className="p-2 text-left font-bold">Status</th><th className="p-2 text-left font-bold">Actions</th></tr></thead>
                      <tbody>
                        {fiscalYears.map((fy) => (
                          <tr key={fy.id} className="border-b border-black">
                            <td className="p-2">{fy.name}</td>
                            <td className="p-2">{new Date(fy.start_date).toLocaleDateString()} - {new Date(fy.end_date).toLocaleDateString()}</td>
                            <td className="p-2"><Badge variant={fy.is_closed ? 'secondary' : 'default'} className="border-2 border-black">{fy.is_closed ? 'Closed' : 'Open'}</Badge></td>
                            <td className="p-2 flex gap-2">
                              <Button variant="outline" size="icon" onClick={() => handleEditFy(fy)} className="border-2 border-black"><Pencil className="h-4 w-4" /></Button>
                              <Button variant="destructive" size="icon" onClick={() => deleteFiscalYearMutation.mutate(fy.id)} className="border-2 border-black"><Trash2 className="h-4 w-4" /></Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="periods" className="space-y-4">
            <Card className="border-2 border-black">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Accounting Periods</CardTitle>
                  <Dialog open={periodDialogOpen} onOpenChange={setPeriodDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="border-2 border-black shadow"><Plus className="mr-2 h-4 w-4" /> Add Period</Button>
                    </DialogTrigger>
                    <DialogContent className="border-2 border-black">
                      <DialogHeader><DialogTitle>Add Accounting Period</DialogTitle></DialogHeader>
                      <Form {...periodForm}>
                        <form onSubmit={periodForm.handleSubmit(onSubmitPeriod)} className="space-y-4">
                          <FormField control={periodForm.control} name="fiscal_year_id" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fiscal Year</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger className="border-2 border-black"><SelectValue placeholder="Select year" /></SelectTrigger></FormControl>
                                <SelectContent>{fiscalYears.map((fy) => (<SelectItem key={fy.id} value={fy.id}>{fy.name}</SelectItem>))}</SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={periodForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} className="border-2 border-black" /></FormControl><FormMessage /></FormItem>)} />
                          <div className="grid grid-cols-2 gap-4">
                            <FormField control={periodForm.control} name="start_date" render={({ field }) => (<FormItem><FormLabel>Start Date</FormLabel><FormControl><Input type="date" {...field} className="border-2 border-black" /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={periodForm.control} name="end_date" render={({ field }) => (<FormItem><FormLabel>End Date</FormLabel><FormControl><Input type="date" {...field} className="border-2 border-black" /></FormControl><FormMessage /></FormItem>)} />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setPeriodDialogOpen(false)} className="border-2 border-black">Cancel</Button>
                            <Button type="submit" className="border-2 border-black shadow">Create</Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {periodsLoading && <Skeleton className="h-48 w-full border-2 border-black" />}
                {!periodsLoading && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead><tr className="border-b-2 border-black"><th className="p-2 text-left font-bold">Name</th><th className="p-2 text-left font-bold">Period</th><th className="p-2 text-left font-bold">Status</th></tr></thead>
                      <tbody>
                        {periods.map((period) => (
                          <tr key={period.id} className="border-b border-black">
                            <td className="p-2">{period.name}</td>
                            <td className="p-2">{new Date(period.start_date).toLocaleDateString()} - {new Date(period.end_date).toLocaleDateString()}</td>
                            <td className="p-2"><Badge variant={period.status === 'open' ? 'default' : period.status === 'closed' ? 'secondary' : 'destructive'} className="border-2 border-black capitalize">{period.status.replace('_', ' ')}</Badge></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tax-rates" className="space-y-4">
            <Card className="border-2 border-black">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Tax Rates</CardTitle>
                  <Dialog open={taxDialogOpen} onOpenChange={setTaxDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={handleCreateTax} className="border-2 border-black shadow"><Plus className="mr-2 h-4 w-4" /> Add Tax Rate</Button>
                    </DialogTrigger>
                    <DialogContent className="border-2 border-black">
                      <DialogHeader><DialogTitle>{editingTax ? 'Edit Tax Rate' : 'Add Tax Rate'}</DialogTitle></DialogHeader>
                      <Form {...taxForm}>
                        <form onSubmit={taxForm.handleSubmit(onSubmitTax)} className="space-y-4">
                          <FormField control={taxForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} className="border-2 border-black" /></FormControl><FormMessage /></FormItem>)} />
                          <FormField control={taxForm.control} name="code" render={({ field }) => (<FormItem><FormLabel>Code</FormLabel><FormControl><Input {...field} className="border-2 border-black" /></FormControl><FormMessage /></FormItem>)} />
                          <FormField control={taxForm.control} name="percentage" render={({ field }) => (<FormItem><FormLabel>Percentage</FormLabel><FormControl><Input type="number" value={field.value} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} className="border-2 border-black" /></FormControl><FormMessage /></FormItem>)} />
                          <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setTaxDialogOpen(false)} className="border-2 border-black">Cancel</Button>
                            <Button type="submit" className="border-2 border-black shadow">{editingTax ? 'Update' : 'Create'}</Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {taxRatesLoading && <Skeleton className="h-48 w-full border-2 border-black" />}
                {!taxRatesLoading && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead><tr className="border-b-2 border-black"><th className="p-2 text-left font-bold">Name</th><th className="p-2 text-left font-bold">Code</th><th className="p-2 text-right font-bold">Percentage</th><th className="p-2 text-left font-bold">Status</th><th className="p-2 text-left font-bold">Actions</th></tr></thead>
                      <tbody>
                        {taxRates.map((tax) => (
                          <tr key={tax.id} className="border-b border-black">
                            <td className="p-2">{tax.name}</td>
                            <td className="p-2 font-mono">{tax.code}</td>
                            <td className="p-2 text-right font-mono">{tax.percentage}%</td>
                            <td className="p-2"><Badge variant={tax.is_active ? 'default' : 'secondary'} className="border-2 border-black">{tax.is_active ? 'Active' : 'Inactive'}</Badge></td>
                            <td className="p-2 flex gap-2">
                              <Button variant="outline" size="icon" onClick={() => handleEditTax(tax)} className="border-2 border-black"><Pencil className="h-4 w-4" /></Button>
                              <Button variant="destructive" size="icon" onClick={() => deleteTaxRateMutation.mutate(tax.id)} className="border-2 border-black"><Trash2 className="h-4 w-4" /></Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
