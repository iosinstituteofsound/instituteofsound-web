import { useMemo, useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import {
  LayoutCard,
  LayoutSidebarPicker,
} from '@/modules/layouts/components/layout-card'
import { LayoutDashboardPreview } from '@/modules/layouts/components/layout-dashboard-preview'
import { LayoutPublicPreview } from '@/modules/layouts/components/layout-public-preview'
import {
  useCreateLayout,
  useDeleteLayout,
  useLayouts,
  useUpdateLayout,
} from '@/modules/layouts/hooks/use-layouts'
import { useCatalog } from '@/modules/permissions/hooks/use-permissions'
import { PermissionGate } from '@/shared/components/authz/permission-gate'
import { Button } from '@/shared/components/ui/button'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { AlertDialog } from '@/shared/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form'
import { Input } from '@/shared/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { PageLoader } from '@/shared/components/feedback/loader'
import { ErrorState, EmptyState } from '@/shared/components/feedback/states'
import {
  Page,
  PageDescription,
  PageHeader,
  PageHeaderMain,
  PageTitle,
} from '@/shared/components/layout/page-shell'
import { toast } from '@/shared/components/ui/sonner'
import type { LayoutDto } from '@/shared/types/layout.types'
import { normalizeLayoutConfig } from '@/shared/lib/layout-config'

type LayoutFormValues = {
  slug: string
  name: string
  defaultSidebarItemId: string
  defaultProfileTabId: string
  config: LayoutDto['config']
  sidebarItemIds: string[]
  profileTabIds: string[]
}

function resolveDefaultSidebarItemId(layout?: LayoutDto | null): string {
  const ids = layout?.sidebarItemIds ?? []
  if (ids.length === 0) return ''
  const current = layout?.defaultSidebarItemId
  if (current && ids.includes(current)) return current
  return ids[0]!
}

function resolveDefaultProfileTabId(layout?: LayoutDto | null): string {
  const ids = layout?.profileTabIds ?? []
  if (ids.length === 0) return ''
  const current = layout?.defaultProfileTabId
  if (current && ids.includes(current)) return current
  return ids[0]!
}

function toFormValues(layout?: LayoutDto | null): LayoutFormValues {
  return {
    slug: layout?.slug ?? '',
    name: layout?.name ?? '',
    defaultSidebarItemId: resolveDefaultSidebarItemId(layout),
    defaultProfileTabId: resolveDefaultProfileTabId(layout),
    config: normalizeLayoutConfig(layout?.config),
    sidebarItemIds: layout?.sidebarItemIds ?? [],
    profileTabIds: layout?.profileTabIds ?? [],
  }
}

export function LayoutsPage() {
  const { data: layouts, isLoading, isError, refetch } = useLayouts()
  const { data: catalog } = useCatalog()
  const createLayout = useCreateLayout()
  const updateLayout = useUpdateLayout()
  const deleteLayout = useDeleteLayout()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<LayoutDto | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<LayoutDto | null>(null)
  const [previewSurface, setPreviewSurface] = useState<'dashboard' | 'public'>('dashboard')

  const form = useForm<LayoutFormValues>({
    defaultValues: toFormValues(),
  })

  const watched = form.watch()

  const sidebarOptions = useMemo(
    () => (catalog?.sidebarItems ?? []).map((item) => ({ id: item.id, label: item.label })),
    [catalog?.sidebarItems],
  )

  const profileTabOptions = useMemo(
    () => (catalog?.profileTabs ?? []).map((tab) => ({ id: tab.id, label: tab.label })),
    [catalog?.profileTabs],
  )

  const previewSidebarItems = useMemo(
    () =>
      watched.sidebarItemIds
        .map((id) => catalog?.sidebarItems.find((item) => item.id === id))
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [catalog?.sidebarItems, watched.sidebarItemIds],
  )

  const previewProfileTabs = useMemo(
    () =>
      watched.profileTabIds
        .map((id) => catalog?.profileTabs.find((tab) => tab.id === id))
        .filter((tab): tab is NonNullable<typeof tab> => Boolean(tab)),
    [catalog?.profileTabs, watched.profileTabIds],
  )

  useEffect(() => {
    const ids = watched.sidebarItemIds
    const current = form.getValues('defaultSidebarItemId')
    if (ids.length === 0) {
      if (current) form.setValue('defaultSidebarItemId', '')
      return
    }
    if (!current || !ids.includes(current)) {
      form.setValue('defaultSidebarItemId', ids[0]!)
    }
  }, [watched.sidebarItemIds, form])

  useEffect(() => {
    const ids = watched.profileTabIds
    const current = form.getValues('defaultProfileTabId')
    if (ids.length === 0) {
      if (current) form.setValue('defaultProfileTabId', '')
      return
    }
    if (!current || !ids.includes(current)) {
      form.setValue('defaultProfileTabId', ids[0]!)
    }
  }, [watched.profileTabIds, form])

  const openDialog = (layout?: LayoutDto | null) => {
    setEditing(layout ?? null)
    form.reset(toFormValues(layout))
    setPreviewSurface('dashboard')
    setOpen(true)
  }

  const onSubmit = async (values: LayoutFormValues) => {
    try {
      const payload = {
        slug: values.slug.trim(),
        name: values.name.trim(),
        defaultSidebarItemId: values.defaultSidebarItemId || null,
        defaultProfileTabId: values.defaultProfileTabId || null,
        config: values.config,
        sidebarItemIds: values.sidebarItemIds,
        profileTabIds: values.profileTabIds,
      }
      if (editing) {
        await updateLayout.mutateAsync({ id: editing.id, ...payload })
        toast.success('Layout updated')
      } else {
        await createLayout.mutateAsync(payload)
        toast.success('Layout created')
      }
      setOpen(false)
      setEditing(null)
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Save failed'
      toast.error(message)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteLayout.mutateAsync(deleteTarget.id)
      toast.success('Layout deleted')
      setDeleteTarget(null)
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Delete failed'
      toast.error(message)
    }
  }

  if (isLoading) return <PageLoader />
  if (isError) return <ErrorState onRetry={() => refetch()} />

  return (
    <Page>
      <PageHeader>
        <PageHeaderMain>
          <PageTitle>Layouts</PageTitle>
          <PageDescription>
            CMS-style shell control for dashboard and public surfaces. Each role uses one layout.
          </PageDescription>
        </PageHeaderMain>
        <PermissionGate resource="roles" action="update">
          <Button onClick={() => openDialog()}>Create Layout</Button>
        </PermissionGate>
      </PageHeader>

      {!layouts?.length ? (
        <EmptyState variant="dashed" title="No layouts yet" description="" className="text-sm text-muted-foreground" />
      ) : (
        <div className="ios-page-grid sm:grid-cols-2 xl:grid-cols-3">
          {layouts.map((layout) => (
            <LayoutCard
              key={layout.id}
              layout={layout}
              onEdit={() => openDialog(layout)}
              onDelete={() => setDeleteTarget(layout)}
            />
          ))}
        </div>
      )}

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(next) => !next && setDeleteTarget(null)}
        title="Delete layout?"
        description={
          <>
            Permanently delete <span className="font-medium text-foreground">{deleteTarget?.name}</span>. Layouts
            assigned to roles cannot be deleted.
          </>
        }
        destructive
        loading={deleteLayout.isPending}
        confirmLabel="Delete layout"
        onConfirm={handleConfirmDelete}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[92vh] max-w-6xl flex-col gap-0 overflow-hidden p-0">
          <DialogHeader className="shrink-0 border-b px-6 py-4">
            <DialogTitle>{editing ? 'Edit Layout' : 'Create Layout'}</DialogTitle>
          </DialogHeader>

          <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)_minmax(0,1fr)] gap-0 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] xl:grid-rows-1">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col border-b xl:border-b-0 xl:border-r">
                <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="slug"
                      rules={{ required: 'Slug is required' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Slug</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={Boolean(editing)} placeholder="admin-console" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="name"
                      rules={{ required: 'Name is required' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Display name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Admin Console" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="sidebarItemIds"
                    render={({ field }) => (
                      <FormItem>
                        <LayoutSidebarPicker
                          options={sidebarOptions}
                          selectedIds={field.value}
                          onChange={field.onChange}
                        />
                        <p className="text-xs text-muted-foreground">
                          Sidebar items grant linked page resources and API scopes (e.g. users.read →
                          users.view). Manage catalog items on{' '}
                          <Link to="/sidebar-items" className="text-primary underline">
                            Sidebar items
                          </Link>
                          .
                        </p>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="defaultSidebarItemId"
                    rules={{
                      validate: (value, formValues) =>
                        formValues.sidebarItemIds.length === 0 ||
                        Boolean(value) ||
                        'Select a default home sidebar item',
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default home sidebar item</FormLabel>
                        <Select
                          value={field.value || undefined}
                          onValueChange={field.onChange}
                          disabled={previewSidebarItems.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select sidebar item" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {previewSidebarItems.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.label} ({item.path})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Users land on this page after login when this layout is active.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="profileTabIds"
                    render={({ field }) => (
                      <FormItem>
                        <LayoutSidebarPicker
                          options={profileTabOptions}
                          selectedIds={field.value}
                          onChange={field.onChange}
                        />
                        <p className="text-xs text-muted-foreground">
                          Profile tabs are shown on user profiles. Manage tab catalog on{' '}
                          <Link to="/profile-tabs" className="text-primary underline">
                            Profile tabs
                          </Link>
                          .
                        </p>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="defaultProfileTabId"
                    rules={{
                      validate: (value, formValues) =>
                        formValues.profileTabIds.length === 0 ||
                        Boolean(value) ||
                        'Select a default profile tab',
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default profile tab</FormLabel>
                        <Select
                          value={field.value || undefined}
                          onValueChange={field.onChange}
                          disabled={previewProfileTabs.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select profile tab" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {previewProfileTabs.map((tab) => (
                              <SelectItem key={tab.id} value={tab.id}>
                                {tab.label} ({tab.slug})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          When users open their profile, this tab is selected by default.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-3 rounded-md border p-3">
                    <h3 className="text-sm font-medium">Dashboard shell</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="config.dashboard.header.visible"
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-2 space-y-0">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel className="font-normal">Show header</FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="config.dashboard.header.showMenuToggle"
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-2 space-y-0">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel className="font-normal">Menu toggle</FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="config.dashboard.header.showIdentity"
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-2 space-y-0">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel className="font-normal">Role & badge chips</FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="config.dashboard.header.showProfileMenu"
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-2 space-y-0">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel className="font-normal">Profile menu</FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="config.dashboard.sidebar.visible"
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-2 space-y-0">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel className="font-normal">Show sidebar</FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="config.dashboard.sidebar.defaultCollapsed"
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-2 space-y-0">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel className="font-normal">Collapsed by default</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="config.dashboard.sidebar.width"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sidebar width</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="default">Default</SelectItem>
                              <SelectItem value="compact">Compact</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="config.dashboard.main.padding"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Main padding</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {(['none', 'sm', 'md', 'lg'] as const).map((value) => (
                                <SelectItem key={value} value={value}>
                                  {value}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="config.dashboard.main.maxWidth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Main max width</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="full">Full</SelectItem>
                              <SelectItem value="xl">XL</SelectItem>
                              <SelectItem value="2xl">2XL</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="config.dashboard.header.brandTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand title override</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value ?? ''} placeholder="Leave empty for app name" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-3 rounded-md border p-3">
                    <h3 className="text-sm font-medium">Public shell</h3>
                    <FormField
                      control={form.control}
                      name="config.public.enabled"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="font-normal">Enable public surface</FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="config.public.header.showAuthButtons"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="font-normal">Show auth buttons</FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="config.public.header.brandTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Public brand title</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value ?? ''} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="config.public.footer.copyright"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Footer copyright</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value ?? ''} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="shrink-0 border-t bg-background px-6 py-4">
                  <Button type="submit" disabled={createLayout.isPending || updateLayout.isPending}>
                    {editing ? 'Save changes' : 'Create layout'}
                  </Button>
                </div>
              </form>
            </Form>

            <div className="min-h-0 overflow-y-auto bg-muted/20 p-6">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium">Live preview</p>
                <div className="inline-flex rounded-md border bg-background p-0.5">
                  <Button
                    type="button"
                    size="sm"
                    variant={previewSurface === 'dashboard' ? 'secondary' : 'ghost'}
                    onClick={() => setPreviewSurface('dashboard')}
                  >
                    Dashboard
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={previewSurface === 'public' ? 'secondary' : 'ghost'}
                    onClick={() => setPreviewSurface('public')}
                  >
                    Public
                  </Button>
                </div>
              </div>
              {previewSurface === 'dashboard' ? (
                <LayoutDashboardPreview
                  layoutName={watched.name}
                  config={watched.config.dashboard}
                  sidebarItems={previewSidebarItems}
                />
              ) : (
                <LayoutPublicPreview layoutName={watched.name} config={watched.config.public} />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Page>
  )
}
