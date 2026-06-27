import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCatalog } from '@/modules/permissions/hooks/use-permissions'
import { useCreateRole, useDeleteRole, useRoles, useUpdateRole } from '@/modules/roles/hooks/use-roles'
import { AssignmentPicker } from '@/modules/roles/components/assignment-picker'
import { RoleCard, resolveAssignmentLabels } from '@/modules/roles/components/role-card'
import {
  createRoleSchema,
  updateRoleSchema,
  type CreateRoleFormValues,
} from '@/modules/roles/schemas/role.schema'
import type { RoleDto } from '@/modules/roles/api/role.api'
import { PermissionGate } from '@/shared/components/authz/permission-gate'
import { Button } from '@/shared/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form'
import { Input } from '@/shared/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Switch } from '@/shared/components/ui/switch'
import { ROLE_DISCOVER_CATEGORIES } from '@/shared/data/role-discover-categories'
import {
  DISCOVER_CLICK_ROUTE_NONE,
  ROLE_DISCOVER_CLICK_ROUTES,
  discoverClickRouteToFormValue,
} from '@/shared/data/role-discover-click-routes'
import { PageLoader } from '@/shared/components/feedback/loader'
import { EmptyState, ErrorState } from '@/shared/components/feedback/states'
import {
  Page,
  PageDescription,
  PageHeader,
  PageHeaderMain,
  PageTitle,
} from '@/shared/components/layout/page-shell'
import { toast } from '@/shared/components/ui/sonner'

type RoleFormValues = CreateRoleFormValues & {
  extraScopeIds?: string[]
  extraResourceIds?: string[]
}

const emptyAssignments = {
  featureIds: [] as string[],
  extraScopeIds: [] as string[],
  extraResourceIds: [] as string[],
}

const defaultRoleFormValues = (layoutId = ''): RoleFormValues => ({
  name: '',
  layoutId,
  discoverable: false,
  discoverCategory: 'other',
  discoverClickRoute: DISCOVER_CLICK_ROUTE_NONE,
  ...emptyAssignments,
})

export function RolesListPage() {
  const { data, isLoading, isError, refetch } = useRoles()
  const { data: catalog } = useCatalog()
  const createRole = useCreateRole()
  const updateRole = useUpdateRole()
  const deleteRole = useDeleteRole()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<RoleDto | null>(null)

  const roleFormResolver = useMemo(
    () =>
      zodResolver((editing ? updateRoleSchema : createRoleSchema) as typeof createRoleSchema) as Resolver<RoleFormValues>,
    [editing],
  )

  const form = useForm<RoleFormValues>({
    resolver: roleFormResolver,
    defaultValues: {
      name: '',
      layoutId: '',
      discoverable: false,
      discoverCategory: 'other',
      ...emptyAssignments,
    },
  })

  const scopeOptions = useMemo(
    () =>
      (catalog?.scopes ?? []).map((scope) => ({
        id: scope.id,
        label: scope.permissionSlug ?? scope.slug,
      })),
    [catalog?.scopes],
  )

  const resourceOptions = useMemo(
    () =>
      (catalog?.resources ?? []).map((resource) => ({
        id: resource.id,
        label: resource.name,
      })),
    [catalog?.resources],
  )

  const featureOptions = useMemo(
    () =>
      (catalog?.features ?? []).map((feature) => ({
        id: feature.id,
        label: feature.name,
      })),
    [catalog?.features],
  )

  const layoutById = useMemo(
    () => new Map((catalog?.layouts ?? []).map((layout) => [layout.id, layout])),
    [catalog?.layouts],
  )

  const openEdit = (role: RoleDto) => {
    setEditing(role)
    form.reset({
      name: role.name,
      description: role.description,
      layoutId: role.layoutId,
      featureIds: role.featureIds,
      extraScopeIds: role.extraScopeIds,
      extraResourceIds: role.extraResourceIds,
      discoverable: role.discoverable,
      discoverCategory: role.discoverCategory as RoleFormValues['discoverCategory'],
      discoverClickRoute: discoverClickRouteToFormValue(role.discoverClickRoute),
    })
    setOpen(true)
  }

  const handleDelete = async (role: RoleDto) => {
    try {
      await deleteRole.mutateAsync(role.id)
      toast.success('Role deleted')
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Failed'
      toast.error(message)
    }
  }

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (editing) {
        const input = editing.isSystem
          ? {
              layoutId: values.layoutId,
              featureIds: values.featureIds,
              extraScopeIds: values.extraScopeIds,
              extraResourceIds: values.extraResourceIds,
              discoverable: values.discoverable,
              discoverCategory: values.discoverCategory,
              discoverClickRoute: values.discoverClickRoute,
            }
          : values
        await updateRole.mutateAsync({ id: editing.id, input })
        toast.success('Role updated')
      } else {
        await createRole.mutateAsync(values)
        toast.success('Role created')
      }
      setOpen(false)
      setEditing(null)
      form.reset(defaultRoleFormValues(catalog?.layouts[0]?.id ?? ''))
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
          <PageTitle>Roles</PageTitle>
          <PageDescription>
            Each role controls what a user can see and do. Assign a layout for the dashboard shell and
            navigation, then bundle features, scopes, and resources.
          </PageDescription>
        </PageHeaderMain>
        <PermissionGate resource="roles" action="create">
          <Button
            onClick={() => {
              setEditing(null)
              form.reset(defaultRoleFormValues(catalog?.layouts[0]?.id ?? ''))
              setOpen(true)
            }}
          >
            Create Role
          </Button>
        </PermissionGate>
      </PageHeader>

      {(data ?? []).length === 0 ? (
        <EmptyState
          variant="dashed"
          title=""
          description="No roles yet. Create one to get started."
        />
      ) : (
        <div className="ios-page-grid xl:grid-cols-2">
          {(data ?? []).map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              layoutName={layoutById.get(role.layoutId)?.name}
              layoutNavCount={layoutById.get(role.layoutId)?.sidebarItemIds.length ?? 0}
              featureLabels={resolveAssignmentLabels(role.featureIds, featureOptions)}
              scopeLabels={resolveAssignmentLabels(role.extraScopeIds, scopeOptions)}
              resourceLabels={resolveAssignmentLabels(role.extraResourceIds, resourceOptions)}
              onEdit={() => openEdit(role)}
              onDelete={() => handleDelete(role)}
            />
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing
                ? `Edit Role${editing.isSystem ? ' (system — name locked, layout & access editable)' : ''}`
                : 'Create Role'}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4">
              {!editing?.isSystem && (
                <>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <FormField
                control={form.control}
                name="layoutId"
                rules={{ required: 'Layout is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Layout</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select layout for this role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(catalog?.layouts ?? []).map((layout) => (
                          <SelectItem key={layout.id} value={layout.id}>
                            {layout.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Controls dashboard shell, sidebar navigation, and public pages for users with this
                      role. Edit nav items on the{' '}
                      <Link to="/layouts" className="text-primary underline">
                        Layouts
                      </Link>{' '}
                      page.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!editing?.isSystem ? null : (
                <p className="rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                  System role name and slug cannot be changed. You can still assign a different layout.
                </p>
              )}

              <FormField
                control={form.control}
                name="discoverable"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-md border px-3 py-3">
                    <div className="space-y-0.5">
                      <FormLabel>Discoverable in search</FormLabel>
                      <p className="text-xs text-muted-foreground">
                        When enabled, this role appears in the global search modal.
                      </p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value ?? false} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch('discoverable') ? (
                <>
                  <FormField
                    control={form.control}
                    name="discoverCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Search category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? 'other'}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select search category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ROLE_DISCOVER_CATEGORIES.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.label}
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
                    name="discoverClickRoute"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Search click destination</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value ?? DISCOVER_CLICK_ROUTE_NONE}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose where search results open" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ROLE_DISCOVER_CLICK_ROUTES.map((route) => (
                              <SelectItem key={route.value} value={route.value}>
                                {route.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          When someone clicks a user with this role in search, open this page.
                          Use Public profile for listeners.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              ) : null}

              <AssignmentPicker
                title="Features"
                options={featureOptions}
                selectedIds={form.watch('featureIds') ?? []}
                onChange={(ids) => form.setValue('featureIds', ids, { shouldDirty: true })}
              />

              <AssignmentPicker
                title="Scopes"
                options={scopeOptions}
                selectedIds={form.watch('extraScopeIds') ?? []}
                onChange={(ids) => form.setValue('extraScopeIds', ids, { shouldDirty: true })}
              />

              <AssignmentPicker
                title="Resources"
                options={resourceOptions}
                selectedIds={form.watch('extraResourceIds') ?? []}
                onChange={(ids) => form.setValue('extraResourceIds', ids, { shouldDirty: true })}
              />

              <Button type="submit" disabled={createRole.isPending || updateRole.isPending}>
                {editing ? 'Update Role' : 'Create Role'}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Page>
  )
}
