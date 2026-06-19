import { Render } from '@measured/puck'
import { Monitor, Smartphone, Tablet, X } from 'lucide-react'
import { articlePuckConfig } from '@/modules/editor/lib/article-puck-config'
import {
  canvasBackgroundToStyle,
  readCanvasBackground,
} from '@/modules/editor/lib/canvas-background-utils'
import { readCanvasArtifact } from '@/modules/editor/lib/canvas-artifact-utils'
import {
  canvasEffectsFilterStyle,
  readCanvasEffects,
} from '@/modules/editor/lib/canvas-effects-utils'
import { ArticleCanvasArtifactLayer } from '@/modules/editor/components/article-canvas-artifact-layer'
import { ArticleCanvasEffectsOverlay } from '@/modules/editor/components/article-canvas-effects-overlay'
import type { Data } from '@measured/puck'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { cn } from '@/shared/lib/cn'

export type PreviewDevice = 'desktop' | 'tablet' | 'mobile'

const DEVICE_WIDTH: Record<PreviewDevice, string> = {
  desktop: 'max-w-4xl',
  tablet: 'max-w-2xl',
  mobile: 'max-w-sm',
}

interface ArticlePreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  device: PreviewDevice
  onDeviceChange: (device: PreviewDevice) => void
  title: string
  excerpt: string
  authorName: string
  puckData: Data
}

export function ArticlePreviewDialog({
  open,
  onOpenChange,
  device,
  onDeviceChange,
  title,
  excerpt,
  authorName,
  puckData,
}: ArticlePreviewDialogProps) {
  const canvasBackground = readCanvasBackground(puckData)
  const canvasBackgroundStyle = canvasBackground.hidden
    ? undefined
    : canvasBackgroundToStyle(canvasBackground)
  const canvasArtifact = readCanvasArtifact(puckData)
  const canvasEffects = readCanvasEffects(puckData)
  const canvasEffectsFilter = canvasEffectsFilterStyle(canvasEffects)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent elevated className="flex h-[90vh] max-w-6xl flex-col gap-0 overflow-hidden p-0" hideCloseButton>
        <DialogHeader className="shrink-0 border-b border-border px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <DialogTitle>Article preview</DialogTitle>
              <DialogDescription>See how your draft reads before publishing.</DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              {([
                { id: 'desktop' as const, label: 'Desktop', icon: Monitor },
                { id: 'tablet' as const, label: 'Tablet', icon: Tablet },
                { id: 'mobile' as const, label: 'Mobile', icon: Smartphone },
              ]).map((item) => (
                <Button
                  key={item.id}
                  type="button"
                  size="sm"
                  variant={device === item.id ? 'secondary' : 'ghost'}
                  onClick={() => onDeviceChange(item.id)}
                >
                  <item.icon className="mr-1.5 h-4 w-4" />
                  {item.label}
                </Button>
              ))}
              <Button type="button" size="icon" variant="ghost" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto bg-muted/20 p-6">
          <div className={cn('mx-auto w-full transition-all', DEVICE_WIDTH[device])}>
            <article
              className="relative overflow-hidden rounded-2xl border border-border bg-background p-6 shadow-sm md:p-10"
              style={canvasBackgroundStyle}
            >
              <div className="relative min-h-[12rem]" style={canvasEffectsFilter}>
                <ArticleCanvasArtifactLayer artifact={canvasArtifact} data={puckData} />
                <div className="relative z-[2]">
                <header className="mb-8 space-y-3 border-b border-border pb-6">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Preview</p>
                  <h1 className="font-serif text-3xl font-bold leading-tight md:text-4xl">
                    {title || 'Untitled article'}
                  </h1>
                  {excerpt ? <p className="text-muted-foreground">{excerpt}</p> : null}
                  <p className="text-sm text-muted-foreground">By {authorName}</p>
                </header>
                <div className="article-editor-preview space-y-8">
                  <Render config={articlePuckConfig} data={puckData} />
                </div>
                </div>
              </div>
              <ArticleCanvasEffectsOverlay effects={canvasEffects} />
            </article>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
