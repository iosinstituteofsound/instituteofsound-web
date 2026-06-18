import { useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, Pencil, Trash2 } from 'lucide-react'
import type { LayoutDto } from '@/shared/types/layout.types'
import { LayoutDashboardPreview } from '@/modules/layouts/components/layout-dashboard-preview'
import { LayoutPublicPreview } from '@/modules/layouts/components/layout-public-preview'
import { PermissionGate } from '@/shared/components/authz/permission-gate'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { useCatalog } from '@/modules/permissions/hooks/use-permissions'

interface LayoutCardProps {
  layout: LayoutDto
  onEdit: () => void
  onDelete: () => void
}

export function LayoutCard({ layout, onEdit, onDelete }: LayoutCardProps) {
  const [previewSurface, setPreviewSurface] = useState<'dashboard' | 'public'>('dashboard')
  const { data: catalog } = useCatalog()

  const sidebarItems = useMemo(
    () =>
      layout.sidebarItemIds
        .map((id) => catalog?.sidebarItems.find((item) => item.id === id))
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [catalog?.sidebarItems, layout.sidebarItemIds],
  )

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="truncate text-lg">{layout.name}</CardTitle>
            {!layout.isActive ? <Badge variant="outline">Inactive</Badge> : null}
          </div>
          <CardDescription className="font-mono text-xs">{layout.slug}</CardDescription>
        </div>
        <PermissionGate resource="roles" action="update">
          <div className="flex shrink-0 items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit} aria-label={`Edit ${layout.name}`}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={onDelete}
              aria-label={`Delete ${layout.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </PermissionGate>
      </CardHeader>

      <CardContent className="space-y-2 p-0">
        <div className="flex items-center justify-between gap-2 border-t px-3 py-2">
          <span className="text-xs text-muted-foreground">Preview</span>
          <div className="inline-flex rounded-md border bg-muted/40 p-0.5">
            <Button
              type="button"
              variant={previewSurface === 'dashboard' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setPreviewSurface('dashboard')}
            >
              Dashboard
            </Button>
            <Button
              type="button"
              variant={previewSurface === 'public' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setPreviewSurface('public')}
            >
              Public
            </Button>
          </div>
        </div>
        <div className="border-t bg-muted/10 p-3">
          {previewSurface === 'dashboard' ? (
            <LayoutDashboardPreview
              layoutName={layout.name}
              config={layout.config.dashboard}
              sidebarItems={sidebarItems}
              compact
            />
          ) : (
            <LayoutPublicPreview layoutName={layout.name} config={layout.config.public} compact />
          )}
        </div>
        <p className="px-3 pb-3 text-xs text-muted-foreground">
          {layout.sidebarItemIds.length} sidebar items, {(layout.profileTabIds ?? []).length} profile tabs assigned
        </p>
      </CardContent>
    </Card>
  )
}

interface LayoutSidebarPickerProps {
  options: { id: string; label: string }[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

export function LayoutSidebarPicker({ options, selectedIds, onChange }: LayoutSidebarPickerProps) {
  const move = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= selectedIds.length) return
    const next = [...selectedIds]
    const [item] = next.splice(index, 1)
    next.splice(nextIndex, 0, item)
    onChange(next)
  }

  const addId = (id: string) => {
    if (!id || selectedIds.includes(id)) return
    onChange([...selectedIds, id])
  }

  const removeId = (id: string) => onChange(selectedIds.filter((selected) => selected !== id))

  const selectedOptions = selectedIds
    .map((id) => options.find((option) => option.id === id))
    .filter((option): option is { id: string; label: string } => Boolean(option))

  const available = options.filter((option) => !selectedIds.includes(option.id))

  return (
    <div className="space-y-3 rounded-md border p-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Navigation items</h3>
        <span className="text-xs text-muted-foreground">{selectedIds.length} in menu</span>
      </div>
      <div className="space-y-1">
        {selectedOptions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sidebar items selected</p>
        ) : (
          selectedOptions.map((option, index) => (
            <div key={option.id} className="flex items-center gap-2 rounded-md border bg-muted/20 px-2 py-1.5">
              <span className="flex-1 text-sm">{option.label}</span>
              <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => move(index, -1)}>
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => move(index, 1)}>
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeId(option.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>
      {available.length > 0 ? (
        <select
          aria-label="Add item"
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          defaultValue=""
          onChange={(event) => {
            addId(event.target.value)
            event.target.value = ''
          }}
        >
          <option value="">Add item…</option>
          {available.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      ) : null}
    </div>
  )
}
