import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ColumnDef } from '@tanstack/react-table'
import {
  useCreateSidebarItem,
  useDeleteSidebarItem,
  useSidebarItemsAdmin,
  useUpdateSidebarItem,
} from '@/modules/sidebar/hooks/use-sidebar'
import {
  createSidebarItemSchema,
  type CreateSidebarItemFormValues,
} from '@/modules/sidebar/schemas/sidebar.schema'
import type { SidebarMenuItemDto } from '@/shared/types/sidebar.types'
import { DataTable } from '@/shared/components/data-table/data-table'
import { PermissionGate } from '@/shared/components/authz/permission-gate'
import { Button } from '@/shared/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form'
import { Input } from '@/shared/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { PageLoader } from '@/shared/components/feedback/loader'
import { ErrorState } from '@/shared/components/feedback/states'
import { toast } from '@/shared/components/ui/sonner'

export function SidebarMenuItemsPage() {
  const { data, isLoading, isError, refetch } = useSidebarItemsAdmin()
  const createItem = useCreateSidebarItem()
  const updateItem = useUpdateSidebarItem()
  const deleteItem = useDeleteSidebarItem()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<SidebarMenuItemDto | null>(null)

  const form = useForm<CreateSidebarItemFormValues>({
    resolver: zodResolver(createSidebarItemSchema),
    defaultValues: {
      label: '',
      path: '',
      resourceType: 'PAGE',
      sortOrder: 0,
    },
  })

  const columns: ColumnDef<SidebarMenuItemDto>[] = [
    { accessorKey: 'label', header: 'Label' },
    { accessorKey: 'path', header: 'Path' },
    { accessorKey: 'resourceName', header: 'Resource' },
    { accessorKey: 'groupTitle', header: 'Group' },
    { accessorKey: 'sortOrder', header: 'Order' },
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
                  label: row.original.label,
                  path: row.original.path,
                  resourceName: row.original.resourceName,
                  resourceType: row.original.resourceType ?? 'PAGE',
                  permissionResource: row.original.permissionResource,
                  permissionAction: row.original.permissionAction,
                  groupTitle: row.original.groupTitle,
                  sortOrder: row.original.sortOrder,
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
                    await deleteItem.mutateAsync(row.original.id)
                    toast.success('Sidebar item deleted')
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
        await updateItem.mutateAsync({ id: editing.id, input: values })
        toast.success('Sidebar item updated')
      } else {
        await createItem.mutateAsync(values)
        toast.success('Sidebar item created')
      }
      setOpen(false)
      setEditing(null)
      form.reset({ label: '', path: '', resourceType: 'PAGE', sortOrder: 0 })
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sidebar Menu</h1>
          <p className="text-sm text-muted-foreground">
            Sidebar items are loaded from the API. Only active items assigned to the user appear in the sidebar.
          </p>
        </div>
        <PermissionGate resource="roles" action="create">
          <Button
            onClick={() => {
              setEditing(null)
              form.reset({ label: '', path: '', resourceType: 'PAGE', sortOrder: 0 })
              setOpen(true)
            }}
          >
            Add Item
          </Button>
        </PermissionGate>
      </div>
      <DataTable columns={columns} data={data ?? []} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Sidebar Item' : 'Create Sidebar Item'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4">
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
              <FormField
                control={form.control}
                name="resourceName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resource name (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="DashboardPage" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="groupTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group title (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Access" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="permissionResource"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Permission resource (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="users" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="permissionAction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Permission action (optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select action" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="read">read</SelectItem>
                        <SelectItem value="create">create</SelectItem>
                        <SelectItem value="update">update</SelectItem>
                        <SelectItem value="delete">delete</SelectItem>
                        <SelectItem value="manage">manage</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sortOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sort order</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={createItem.isPending || updateItem.isPending}>
                {editing ? 'Update' : 'Create'}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
