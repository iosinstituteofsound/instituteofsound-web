import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  useCreateTheme,
  useDeleteTheme,
  useGamificationCatalog,
  useThemes,
  useUpdateTheme,
} from '@/modules/badges/hooks/use-gamification'
import type { ThemeDto } from '@/modules/badges/api/gamification.api'
import { ThemeCard } from '@/modules/badge-themes/components/theme-card'
import { ThemePreview } from '@/modules/badge-themes/components/theme-preview'
import { ThemeTokensEditor } from '@/modules/badge-themes/components/theme-tokens-editor'
import { ThemeFluidConfigEditor } from '@/modules/badge-themes/components/theme-fluid-config-editor'
import { PermissionGate } from '@/shared/components/authz/permission-gate'
import { Button } from '@/shared/components/ui/button'
import { AlertDialog } from '@/shared/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form'
import { Input } from '@/shared/components/ui/input'
import { PageLoader } from '@/shared/components/feedback/loader'
import { ErrorState } from '@/shared/components/feedback/states'
import {
  Page,
  PageDescription,
  PageHeader,
  PageHeaderMain,
  PageTitle,
} from '@/shared/components/layout/page-shell'
import { premiumSurfaceGhostClass } from '@/shared/lib/surface-classes'
import { cn } from '@/shared/lib/cn'
import {
  cloneThemeTokens,
  DEFAULT_THEME_TOKENS,
  normalizeThemeTokens,
  serializeThemeTokens,
  getThemeTokenFieldId,
  type SemanticColorKey,
  type ThemeMode,
  type ThemeTokens,
} from '@/shared/design-tokens/theme-tokens'
import { cloneFluidConfig, TRANSLUCENT_FLUID_CONFIG } from '@/shared/design-tokens/fluid-config'
import { toast } from '@/shared/components/ui/sonner'
import { usePermission } from '@/shared/hooks/use-permission'

type ThemeFormValues = {
  slug: string
  name: string
  tokens: ThemeTokens
}

function toFormValues(theme?: ThemeDto | null): ThemeFormValues {
  return {
    slug: theme?.slug ?? '',
    name: theme?.name ?? '',
    tokens: cloneThemeTokens(normalizeThemeTokens(theme?.tokens)),
  }
}

export function BadgeThemesPage() {
  const { isSuperAdmin } = usePermission()
  const { data: catalog, isLoading: catalogLoading, isError, refetch } = useGamificationCatalog()
  const { data: themes, isLoading: themesLoading } = useThemes()
  const createTheme = useCreateTheme()
  const updateTheme = useUpdateTheme()
  const deleteTheme = useDeleteTheme()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<ThemeDto | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ThemeDto | null>(null)
  const [editorMode, setEditorMode] = useState<ThemeMode>('light')
  const [focusedToken, setFocusedToken] = useState<SemanticColorKey | null>(null)

  const openDialog = (theme?: ThemeDto | null) => {
    setEditing(theme ?? null)
    form.reset(toFormValues(theme))
    setEditorMode('light')
    setFocusedToken(null)
    setOpen(true)
  }

  const form = useForm<ThemeFormValues>({
    defaultValues: {
      slug: '',
      name: '',
      tokens: cloneThemeTokens(DEFAULT_THEME_TOKENS),
    },
  })

  const watched = form.watch()
  const rows = themes ?? catalog?.themes ?? []

  const handlePreviewTokenSelect = (token: SemanticColorKey) => {
    setFocusedToken(token)

    const field = document.getElementById(getThemeTokenFieldId(editorMode, token))
    field?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    field?.querySelector<HTMLButtonElement>('button[data-theme-color-trigger]')?.click()
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return

    try {
      await deleteTheme.mutateAsync(deleteTarget.id)
      toast.success('Theme deleted')
      setDeleteTarget(null)
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Delete failed'
      toast.error(message)
    }
  }

  const onSubmit = async (values: ThemeFormValues) => {
    try {
      const payload = {
        slug: values.slug.trim(),
        name: values.name.trim(),
        tokens: serializeThemeTokens(values.tokens),
        isDefault: editing?.isDefault,
      }
      if (editing) {
        await updateTheme.mutateAsync({ id: editing.id, ...payload })
        toast.success('Theme updated')
      } else {
        await createTheme.mutateAsync(payload)
        toast.success('Theme created')
      }
      setOpen(false)
      setEditing(null)
      form.reset(toFormValues())
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Save failed'
      toast.error(message)
    }
  }

  if (catalogLoading || themesLoading) return <PageLoader />
  if (isError) return <ErrorState onRetry={() => refetch()} />

  return (
    <Page>
      <PageHeader>
        <PageHeaderMain>
          <PageTitle>Badge Themes</PageTitle>
          <PageDescription>
            Badge themes control colors and optional liquid WebGL effects. Fonts and layout use global
            defaults.
          </PageDescription>
        </PageHeaderMain>
        <PermissionGate resource="roles" action="update">
          <Button onClick={() => openDialog()}>Create Theme</Button>
        </PermissionGate>
      </PageHeader>

      {rows.length === 0 ? (
        <div className={cn(premiumSurfaceGhostClass, 'border-dashed p-10 text-center')}>
          <p className="text-sm text-muted-foreground">No themes yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="ios-page-grid sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              onEdit={() => openDialog(theme)}
              onDelete={() => setDeleteTarget(theme)}
            />
          ))}
        </div>
      )}

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(nextOpen) => !nextOpen && setDeleteTarget(null)}
        title="Delete theme?"
        description={
          <>
            This will permanently delete <span className="font-medium text-foreground">{deleteTarget?.name}</span>
            {deleteTarget?.slug ? (
              <>
                {' '}
                (<span className="font-mono">{deleteTarget.slug}</span>)
              </>
            ) : null}
            . Themes linked to a badge cannot be deleted.
          </>
        }
        destructive
        loading={deleteTheme.isPending}
        confirmLabel={deleteTheme.isPending ? 'Deleting…' : 'Delete theme'}
        onConfirm={handleConfirmDelete}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[92vh] max-w-6xl flex-col gap-0 overflow-hidden p-0">
          <DialogHeader className="shrink-0 border-b px-6 py-4">
            <DialogTitle>{editing ? 'Edit Theme' : 'Create Theme'}</DialogTitle>
          </DialogHeader>

          <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)_minmax(0,1fr)] gap-0 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] xl:grid-rows-1">
            <div className="flex min-h-0 flex-col border-b xl:border-b-0 xl:border-r">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
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
                              <Input {...field} placeholder="pioneer" disabled={Boolean(editing)} />
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
                              <Input {...field} placeholder="Pioneer" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="tokens"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Theme colors</FormLabel>
                          <FormControl>
                            <ThemeTokensEditor
                              value={field.value}
                              onChange={field.onChange}
                              mode={editorMode}
                              onModeChange={setEditorMode}
                              focusedToken={focusedToken}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {isSuperAdmin ? (
                      <ThemeFluidConfigEditor
                        badgeVariant={watched.tokens.badgeVariant}
                        fluidConfig={watched.tokens.fluidConfig}
                        onBadgeVariantChange={(variant) => {
                          const next = cloneThemeTokens(form.getValues('tokens'))
                          if (variant) {
                            next.badgeVariant = variant
                            if (!next.fluidConfig) next.fluidConfig = cloneFluidConfig(TRANSLUCENT_FLUID_CONFIG)
                          } else {
                            delete next.badgeVariant
                          }
                          form.setValue('tokens', next, { shouldDirty: true })
                        }}
                        onFluidConfigChange={(fluidConfig) => {
                          const next = cloneThemeTokens(form.getValues('tokens'))
                          next.fluidConfig = fluidConfig
                          form.setValue('tokens', next, { shouldDirty: true })
                        }}
                      />
                    ) : null}
                  </div>

                  <div className="shrink-0 border-t bg-background px-6 py-4">
                    <Button type="submit" disabled={createTheme.isPending || updateTheme.isPending}>
                      {editing ? 'Save changes' : 'Create theme'}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>

            <div className="min-h-0 overflow-y-auto bg-muted/20 p-6">
              <ThemePreview
                themeName={watched.name}
                tokens={watched.tokens}
                mode={editorMode}
                onTokenSelect={handlePreviewTokenSelect}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Page>
  )
}

