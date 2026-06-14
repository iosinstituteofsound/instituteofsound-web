import { useState, type CSSProperties } from 'react'
import { Moon, Pencil, Sun, Trash2 } from 'lucide-react'
import type { ThemeDto } from '@/modules/badges/api/gamification.api'
import { ThemeDashboardPreview } from '@/modules/badge-themes/components/theme-dashboard-preview'
import { PermissionGate } from '@/shared/components/authz/permission-gate'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import {
  normalizeThemeTokens,
  themeTokensToCssProperties,
  type ThemeMode,
} from '@/shared/design-tokens/theme-tokens'
import { cn } from '@/shared/lib/cn'

interface ThemeCardProps {
  theme: ThemeDto
  onEdit: () => void
  onDelete: () => void
}

export function ThemeCard({ theme, onEdit, onDelete }: ThemeCardProps) {
  const [previewMode, setPreviewMode] = useState<ThemeMode>('dark')
  const previewStyle = themeTokensToCssProperties(normalizeThemeTokens(theme.tokens), previewMode) as CSSProperties

  return (
    <Card className={cn('overflow-hidden', theme.isDefault && 'border-primary/30')}>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="truncate text-lg">{theme.name}</CardTitle>
            {theme.isDefault ? <Badge>Default</Badge> : null}
          </div>
          <CardDescription className="font-mono text-xs">{theme.slug}</CardDescription>
        </div>

        <PermissionGate resource="roles" action="update">
          <div className="flex shrink-0 items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit} aria-label={`Edit ${theme.name}`}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={onDelete}
              aria-label={`Delete ${theme.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </PermissionGate>
      </CardHeader>

      <CardContent className="p-0">
        <div className="flex items-center justify-between gap-2 border-t px-3 py-2">
          <span className="text-xs text-muted-foreground">Preview</span>
          <div className="inline-flex rounded-md border bg-muted/40 p-0.5" role="group" aria-label="Preview mode">
            <Button
              type="button"
              variant={previewMode === 'light' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 gap-1 px-2 text-xs"
              onClick={() => setPreviewMode('light')}
              aria-pressed={previewMode === 'light'}
            >
              <Sun className="h-3.5 w-3.5" />
              Light
            </Button>
            <Button
              type="button"
              variant={previewMode === 'dark' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 gap-1 px-2 text-xs"
              onClick={() => setPreviewMode('dark')}
              aria-pressed={previewMode === 'dark'}
            >
              <Moon className="h-3.5 w-3.5" />
              Dark
            </Button>
          </div>
        </div>

        <div className="pointer-events-none border-t bg-muted/10 p-3" style={previewStyle}>
          <ThemeDashboardPreview themeName={theme.name} compact />
        </div>
      </CardContent>
    </Card>
  )
}
