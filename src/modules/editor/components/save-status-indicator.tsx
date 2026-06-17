import { Check, Cloud, CloudOff, Loader2 } from 'lucide-react'
import type { SaveStatus } from '@/modules/editor/types/article-editor.types'
import { cn } from '@/shared/lib/cn'

export function SaveStatusIndicator({ status }: { status: SaveStatus }) {
  if (status === 'saving') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Saving…
      </span>
    )
  }

  if (status === 'saved') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <Check className="h-3.5 w-3.5 text-primary" />
        All changes saved
      </span>
    )
  }

  if (status === 'error') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-destructive">
        <CloudOff className="h-3.5 w-3.5" />
        Save failed
      </span>
    )
  }

  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs text-muted-foreground')}>
      <Cloud className="h-3.5 w-3.5" />
      Ready
    </span>
  )
}
