import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { ColumnDef } from '@tanstack/react-table'
import {
  useBadges,
  useCreateBadge,
  useDeleteBadge,
  useGamificationCatalog,
  useThemes,
  useUpdateBadge,
} from '@/modules/badges/hooks/use-gamification'
import type { BadgeDto } from '@/modules/badges/api/gamification.api'
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
import { toast } from '@/shared/components/ui/sonner'

type BadgeFormValues = {
  slug: string
  name: string
  description: string
  themeId: string
}

export function BadgesPage() {
  const { data: catalog, isLoading: catalogLoading, isError, refetch } = useGamificationCatalog()
  const { data: badges, isLoading: badgesLoading } = useBadges()
  const { data: themes, isLoading: themesLoading } = useThemes()
  const createBadge = useCreateBadge()
  const updateBadge = useUpdateBadge()
  const deleteBadge = useDeleteBadge()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<BadgeDto | null>(null)

  const form = useForm<BadgeFormValues>({
    defaultValues: { slug: '', name: '', description: '', themeId: '' },
  })

  const themeOptions = themes ?? catalog?.themes ?? []
  const rows = badges ?? catalog?.badges ?? []

  const columns: ColumnDef<BadgeDto>[] = [
    { accessorKey: 'slug', header: 'Slug' },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'description', header: 'Description' },
    {
      id: 'theme',
      header: 'Theme',
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.theme?.name ?? row.original.themeId}</Badge>
      ),
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
                  name: row.original.name,
                  description: row.original.description ?? '',
                  themeId: row.original.themeId,
                })
                setOpen(true)
              }}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                try {
                  await deleteBadge.mutateAsync(row.original.id)
                  toast.success('Badge deleted')
                } catch (err) {
                  const message =
                    err && typeof err === 'object' && 'message' in err
                      ? String((err as { message: string }).message)
                      : 'Delete failed'
                  toast.error(message)
                }
              }}
            >
              Delete
            </Button>
          </div>
        </PermissionGate>
      ),
    },
  ]

  const onSubmit = async (values: BadgeFormValues) => {
    try {
      const payload = {
        slug: values.slug.trim(),
        name: values.name.trim(),
        description: values.description.trim() || undefined,
        themeId: values.themeId,
      }
      if (editing) {
        await updateBadge.mutateAsync({ id: editing.id, ...payload })
        toast.success('Badge updated')
      } else {
        await createBadge.mutateAsync(payload)
        toast.success('Badge created')
      }
      setOpen(false)
      setEditing(null)
      form.reset({ slug: '', name: '', description: '', themeId: '' })
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Save failed'
      toast.error(message)
    }
  }

  if (catalogLoading || badgesLoading || themesLoading) return <PageLoader />
  if (isError) return <ErrorState onRetry={() => refetch()} />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Badges</h1>
          <p className="text-sm text-muted-foreground">Each badge links to exactly one theme.</p>
        </div>
        <PermissionGate resource="roles" action="update">
          <Button
            onClick={() => {
              setEditing(null)
              form.reset({ slug: '', name: '', description: '', themeId: '' })
              setOpen(true)
            }}
          >
            Create Badge
          </Button>
        </PermissionGate>
      </div>
      <DataTable columns={columns} data={rows} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Badge' : 'Create Badge'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="slug"
                rules={{ required: 'Slug is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={Boolean(editing)} />
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
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="themeId"
                rules={{ required: 'Theme is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Theme</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {themeOptions.map((theme) => (
                          <SelectItem key={theme.id} value={theme.id}>
                            {theme.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={createBadge.isPending || updateBadge.isPending}>
                {editing ? 'Save changes' : 'Create badge'}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
