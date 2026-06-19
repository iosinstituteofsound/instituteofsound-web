import { Loader2, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import type { Data } from '@measured/puck'
import { updateCanvasBlock } from '@/modules/editor/lib/canvas-block-utils'
import { normalizeMediaUrl } from '@/modules/editor/lib/normalize-media-url'
import { findPuckBlockById, readImageBlockUrl } from '@/modules/editor/lib/puck-to-html'
import { uploadMediaFile } from '@/modules/feed/api/media.api'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { cn } from '@/shared/lib/cn'

interface ArticleReplaceImageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: Data
  blockId: string | null
  onChange: (data: Data | ((prev: Data) => Data)) => void
}

export function ArticleReplaceImageDialog({
  open,
  onOpenChange,
  data,
  blockId,
  onChange,
}: ArticleReplaceImageDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [replacing, setReplacing] = useState(false)

  const block = blockId ? findPuckBlockById(data, blockId) : undefined
  const imageUrl = readImageBlockUrl(block) ?? ''
  const isHero = block?.type === 'ArticleHero'
  const title = isHero ? 'Hero image' : 'Image'

  const handleReplaceFile = async (file: File) => {
    if (!blockId || replacing) return
    setReplacing(true)
    try {
      const uploaded = await uploadMediaFile(file, file.name)
      const imageUrl = normalizeMediaUrl(uploaded.absoluteUrl ?? uploaded.url)
      if (!imageUrl) return
      onChange((current) => updateCanvasBlock(current, blockId, { imageUrl }))
    } finally {
      setReplacing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent elevated className="article-replace-image-dialog max-w-lg gap-0 p-0">
        <DialogHeader className="border-b border-border px-5 py-4 text-left">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Preview the current image and replace it here.</DialogDescription>
        </DialogHeader>

        <div className="article-replace-image-dialog__body">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            aria-label="Replace image"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) void handleReplaceFile(file)
              event.target.value = ''
            }}
          />

          <div
            className={cn(
              'article-replace-image-dialog__preview',
              !imageUrl && 'article-replace-image-dialog__preview--empty',
            )}
          >
            {imageUrl ? (
              <img key={imageUrl} src={imageUrl} alt="" className="article-replace-image-dialog__preview-img" />
            ) : (
              <p className="text-sm text-muted-foreground">No image yet</p>
            )}
          </div>

          <button
            type="button"
            className="article-replace-image-dialog__replace-btn"
            disabled={replacing || !blockId}
            onClick={() => fileInputRef.current?.click()}
          >
            {replacing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            <span>{imageUrl ? 'Replace image' : 'Upload image'}</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
