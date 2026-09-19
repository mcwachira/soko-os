'use client';

import AppLayout from '@/app/app/layout';
import { useCustomFields, useCreateCustomField } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateCustomFieldDefinitionSchema } from '@soko/validation';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';

type CustomFieldItem = {
  id: string;
  entity_type: string;
  field_name: string;
  field_label: string;
  field_type: string;
  is_required: boolean;
  is_active: boolean;
  created_at: string;
};

export default function CustomFieldsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { data, isLoading, isError, error, refetch } = useCustomFields();
  const createMutation = useCreateCustomField();
  const customFields = (data?.data ?? []) as CustomFieldItem[];

  const form = useForm({
    resolver: zodResolver(CreateCustomFieldDefinitionSchema),
    defaultValues: {
      entity_type: '',
      field_name: '',
      field_label: '',
      field_type: 'text',
      is_required: false,
      is_unique: false,
      position: 0,
      is_active: true,
    },
  });

  const onCreate = form.handleSubmit((values) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        setIsCreateOpen(false);
        form.reset();
        refetch();
      },
    });
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Custom Fields</h1>
            <p className="text-muted-foreground font-bold">Extend CRM entities with custom data</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="border-2 border-black shadow">
                <Plus className="mr-2 h-4 w-4" />
                Add Field
              </Button>
            </DialogTrigger>
            <DialogContent className="border-2 border-black">
              <DialogHeader>
                <DialogTitle className="text-lg font-black">Add Custom Field</DialogTitle>
              </DialogHeader>
              <form onSubmit={onCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-bold">Entity Type</Label>
                  <Input {...form.register('entity_type')} className="border-2 border-black" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Field Name</Label>
                  <Input {...form.register('field_name')} className="border-2 border-black" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Field Label</Label>
                  <Input {...form.register('field_label')} className="border-2 border-black" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Field Type</Label>
                  <Input {...form.register('field_type')} className="border-2 border-black" />
                </div>
                <Button type="submit" disabled={createMutation.isPending} className="w-full border-2 border-black shadow">
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Field
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search custom fields..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-2 border-black"
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full border-2 border-black" />
                ))}
              </div>
            ) : isError ? (
              <div className="text-center text-destructive">
                <p>Failed to load custom fields</p>
              </div>
            ) : customFields.length === 0 ? (
              <EmptyState title="No custom fields yet" description="Add your first custom field to extend entities." />
            ) : (
              <div className="space-y-2">
                {customFields
                  .filter((field) => {
                    if (!searchQuery) return true;
                    return field.field_label.toLowerCase().includes(searchQuery.toLowerCase());
                  })
                  .map((field) => (
                    <div
                      key={field.id}
                      className="flex items-center justify-between rounded-lg border-2 border-black p-4"
                    >
                      <div>
                        <p className="font-bold">{field.field_label}</p>
                        <p className="text-sm text-muted-foreground">{field.entity_type} • {field.field_type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{field.is_required ? 'Required' : 'Optional'}</p>
                      </div>
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
