import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'

interface PublishConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  slug: string
  excerpt: string
  wordCount: number
  readMinutes: number
  isCoverStory: boolean
  isPublishing: boolean
  onConfirm: () => void
}

export function PublishConfirmDialog({
  open,
  onOpenChange,
  title,
  slug,
  excerpt,
  wordCount,
  readMinutes,
  isCoverStory,
  isPublishing,
  onConfirm,
}: PublishConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Publish article?</DialogTitle>
          <DialogDescription>
            This will make the article public at the URL below. You can still edit it later.
          </DialogDescription>
        </DialogHeader>

        <dl className="space-y-3 rounded-xl border border-border bg-muted/20 p-4 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">Title</dt>
            <dd className="mt-1 font-medium">{title || 'Untitled draft'}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">URL</dt>
            <dd className="mt-1 text-muted-foreground">
              /explore/articles/{slug || 'untitled-article'}
            </dd>
          </div>
          {excerpt ? (
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Excerpt</dt>
              <dd className="mt-1 text-muted-foreground">{excerpt}</dd>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-4 text-muted-foreground">
            <span>{wordCount} words</span>
            <span>{readMinutes} min read</span>
            {isCoverStory ? <span>Cover story</span> : null}
          </div>
        </dl>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPublishing}>
            Cancel
          </Button>
          <Button type="button" onClick={onConfirm} disabled={isPublishing}>
            {isPublishing ? 'Publishing…' : 'Publish now'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
