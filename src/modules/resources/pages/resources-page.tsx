import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ColumnDef } from '@tanstack/react-table'
import {
  useCreateResource,
  useDeleteResource,
  useResources,
  useUpdateResource,
} from '@/modules/resources/hooks/use-resources'
import {
  createResourceSchema,
  type CreateResourceFormValues,
} from '@/modules/resources/schemas/resource.schema'
import type { ResourceDto } from '@/modules/resources/api/resource.api'
import { DataTable } from '@/shared/components/data-table/data-table'
import { PermissionGate } from '@/shared/components/authz/permission-gate'
import { Button } from '@/shared/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form'
import { Input } from '@/shared/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Badge } from '@/shared/components/ui/badge'
import { PageLoader } from '@/shared/components/feedback/loader'
import { ErrorState } from '@/shared/components/feedback/states'
import {
  Page,
  PageDescription,
  PageHeader,
  PageHeaderMain,
  PageTitle,
} from '@/shared/components/layout/page-shell'
import { toast } from '@/shared/components/ui/sonner'
import { isRegisteredResource } from '@/shared/lib/resource-registry'

function RegisteredBadge({ name, type }: { name: string; type: ResourceDto['type'] }) {
  const registered = isRegisteredResource(name, type)
  return (
    <Badge variant={registered ? 'default' : 'secondary'}>
      {registered ? 'Registered' : 'Not in web app'}
    </Badge>
  )
}

export function ResourcesPage() {
  const { data, isLoading, isError, refetch } = useResources()
  const createResource = useCreateResource()
  const updateResource = useUpdateResource()
  const deleteResource = useDeleteResource()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<ResourceDto | null>(null)

  const form = useForm<CreateResourceFormValues>({
    resolver: zodResolver(createResourceSchema),
    defaultValues: { type: 'PAGE', name: '', path: '' },
  })

  const columns: ColumnDef<ResourceDto>[] = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'type', header: 'Type' },
    { accessorKey: 'path', header: 'Path' },
    {
      id: 'registered',
      header: 'Web component',
      cell: ({ row }) => <RegisteredBadge name={row.original.name} type={row.original.type} />,
    },
    {
      accessorKey: 'isActive',
      header: 'Active',
      cell: ({ row }) => (row.original.isActive === false ? 'No' : 'Yes'),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <PermissionGate resource="roles" action="update">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditing(row.original)
                form.reset({
                  type: row.original.type,
                  name: row.original.name,
                  path: row.original.path,
                })
                setOpen(true)
              }}
            >
              Edit
            </Button>
            <PermissionGate resource="roles" action="delete">
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  try {
                    await deleteResource.mutateAsync(row.original.id)
                    toast.success('Resource deleted')
                  } catch (err) {
                    const message =
                      err && typeof err === 'object' && 'message' in err
                        ? String((err as { message: string }).message)
                        : 'Failed'
                    toast.error(message)
                  }
                }}
              >
                Delete
              </Button>
            </PermissionGate>
          </div>
        </PermissionGate>
      ),
    },
  ]

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (editing) {
        await updateResource.mutateAsync({ id: editing.id, input: values })
        toast.success('Resource updated')
      } else {
        await createResource.mutateAsync(values)
        toast.success('Resource created')
      }
      setOpen(false)
      setEditing(null)
      form.reset({ type: 'PAGE', name: '', path: '' })
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Failed'
      toast.error(message)
    }
  })

  if (isLoading) return <PageLoader />
  if (isError) return <ErrorState onRetry={() => refetch()} />

  return (
    <Page>
      <PageHeader>
        <PageHeaderMain>
          <PageTitle>Resources</PageTitle>
          <PageDescription>
            Resource name must match a web component name to be accessible in the UI.
          </PageDescription>
        </PageHeaderMain>
        <PermissionGate resource="roles" action="create">
          <Button
            onClick={() => {
              setEditing(null)
              form.reset({ type: 'PAGE', name: '', path: '' })
              setOpen(true)
            }}
          >
            Create Resource
          </Button>
        </PermissionGate>
      </PageHeader>
      <DataTable columns={columns} data={data ?? []} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Resource' : 'Create Resource'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PAGE">PAGE</SelectItem>
                        <SelectItem value="COMPONENT">COMPONENT</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Component name</FormLabel>
                    <FormControl>
                      <Input placeholder="DashboardPage" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="path"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Path</FormLabel>
                    <FormControl>
                      <Input placeholder="/dashboard" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={createResource.isPending || updateResource.isPending}>
                {editing ? 'Update' : 'Create'}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Page>
  )
}
