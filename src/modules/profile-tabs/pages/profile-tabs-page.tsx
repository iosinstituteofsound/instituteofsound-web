import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ColumnDef } from '@tanstack/react-table'
import { PermissionGate } from '@/shared/components/authz/permission-gate'
import { DataTable } from '@/shared/components/data-table/data-table'
import { PageLoader } from '@/shared/components/feedback/loader'
import { ErrorState } from '@/shared/components/feedback/states'
import {
  Page,
  PageDescription,
  PageHeader,
  PageHeaderMain,
  PageTitle,
} from '@/shared/components/layout/page-shell'
import { Button } from '@/shared/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form'
import { Input } from '@/shared/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { toast } from '@/shared/components/ui/sonner'
import {
  useCreateProfileTab,
  useDeleteProfileTab,
  useProfileTabsAdmin,
  useUpdateProfileTab,
} from '@/modules/profile-tabs/hooks/use-profile-tabs'
import {
  createProfileTabSchema,
  type CreateProfileTabFormValues,
} from '@/modules/profile-tabs/schemas/profile-tabs.schema'
import type { ProfileTabDto, ProfileTabPanelKey } from '@/shared/types/profile-tabs.types'

const PANEL_KEYS: Array<{ id: ProfileTabPanelKey; label: string }> = [
  { id: 'overview', label: 'Overview (blank)' },
  { id: 'all', label: 'All' },
  { id: 'posts', label: 'Posts' },
  { id: 'about', label: 'About' },
  { id: 'photos', label: 'Photos' },
  { id: 'discography', label: 'Discography' },
  { id: 'artist-submissions', label: 'Artist Submissions' },
  { id: 'editorial', label: 'Editorial' },
  { id: 'editor-drafts', label: 'Editor Drafts' },
  { id: 'editor-wire', label: 'Editor Wire' },
  { id: 'editor-submissions', label: 'Editor Submissions' },
  { id: 'curator-overview', label: 'Curator Overview' },
]

export function ProfileTabsPage() {
  const { data, isLoading, isError, refetch } = useProfileTabsAdmin()
  const createTab = useCreateProfileTab()
  const updateTab = useUpdateProfileTab()
  const deleteTab = useDeleteProfileTab()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<ProfileTabDto | null>(null)

  const form = useForm<CreateProfileTabFormValues>({
    resolver: zodResolver(createProfileTabSchema),
    defaultValues: {
      slug: '',
      label: '',
      panelKey: 'all',
      sortOrder: 0,
    },
  })

  const columns: ColumnDef<ProfileTabDto>[] = [
    { accessorKey: 'slug', header: 'Slug' },
    { accessorKey: 'label', header: 'Display name' },
    { accessorKey: 'panelKey', header: 'Panel type' },
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
                  slug: row.original.slug,
                  label: row.original.label,
                  panelKey: row.original.panelKey,
                  sortOrder: row.original.sortOrder ?? 0,
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
                    await deleteTab.mutateAsync(row.original.id)
                    toast.success('Profile tab deleted')
                  } catch (err) {
                    const message =
                      err && typeof err === 'object' && 'message' in err
                        ? String((err as { message: string }).message)
                        : 'Failed'
                    toast.error(message)
                  }
                }}
                disabled={deleteTab.isPending}
              >
                Delete
              </Button>
            </PermissionGate>
          </div>
        </PermissionGate>
      ),
    },
  ]

  const onSubmit = async (values: CreateProfileTabFormValues) => {
    try {
      const payload = {
        slug: values.slug.trim(),
        label: values.label.trim(),
        panelKey: values.panelKey,
        sortOrder: values.sortOrder ?? 0,
      }

      if (editing) {
        await updateTab.mutateAsync({
          id: editing.id,
          input: { label: payload.label, panelKey: payload.panelKey, sortOrder: payload.sortOrder },
        })
        toast.success('Profile tab updated')
      } else {
        await createTab.mutateAsync(payload)
        toast.success('Profile tab created')
      }

      setOpen(false)
      setEditing(null)
      form.reset({ slug: '', label: '', panelKey: 'all', sortOrder: 0 })
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Save failed'
      toast.error(message)
    }
  }

  if (isLoading) return <PageLoader />
  if (isError) return <ErrorState onRetry={() => refetch()} />

  return (
    <Page>
      <PageHeader>
        <PageHeaderMain>
          <PageTitle>Profile tabs</PageTitle>
          <PageDescription>
            Manage profile tab catalog. Layouts can assign these tabs per role.
          </PageDescription>
        </PageHeaderMain>
        <PermissionGate resource="roles" action="update">
          <Button
            onClick={() => {
              setEditing(null)
              form.reset({ slug: '', label: '', panelKey: 'all', sortOrder: 0 })
              setOpen(true)
            }}
          >
            Create tab
          </Button>
        </PermissionGate>
      </PageHeader>

      <DataTable columns={columns} data={data ?? []} />

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) setEditing(null)
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit profile tab' : 'Create profile tab'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={Boolean(editing)} placeholder="listener-posts" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Posts" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="panelKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Panel type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select panel type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PANEL_KEYS.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.label}
                          </SelectItem>
                        ))}
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
                    <FormLabel>Order</FormLabel>
                    <FormControl>
                      <Input type="number" inputMode="numeric" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setOpen(false)
                    setEditing(null)
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createTab.isPending || updateTab.isPending}>
                  Save
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Page>
  )
}

