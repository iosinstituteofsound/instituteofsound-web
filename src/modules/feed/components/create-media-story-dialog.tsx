import { useRef, useState } from 'react'
import { X } from 'lucide-react'
import { useCreateFeedItem } from '@/modules/feed/hooks/use-feed'
import { UserAvatar } from '@/shared/components/user'
import {
  MediaAttachPanel,
  type MediaAttachment,
  type MediaAttachPanelHandle,
} from '@/modules/feed/components/media-attach-panel'
import type { MediaAttachKind } from '@/modules/feed/lib/media-utils'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { toast } from '@/shared/components/ui/sonner'

interface CreateMediaStoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userName: string
  avatarUrl?: string | null
}

export function CreateMediaStoryDialog({
  open,
  onOpenChange,
  userName,
  avatarUrl,
}: CreateMediaStoryDialogProps) {
  const createFeed = useCreateFeedItem()
  const mediaPanelRef = useRef<MediaAttachPanelHandle>(null)
  const [mediaAttachment, setMediaAttachment] = useState<MediaAttachment | null>(null)
  const [resolvedMediaKind, setResolvedMediaKind] = useState<MediaAttachKind | null>(null)
  const [mediaUploadState, setMediaUploadState] = useState({ uploading: false, hasPreview: false })

  const reset = () => {
    setMediaAttachment(null)
    setResolvedMediaKind(null)
    setMediaUploadState({ uploading: false, hasPreview: false })
    mediaPanelRef.current?.clearPendingPreview()
  }

  const handleClose = (next: boolean) => {
    if (!next) reset()
    onOpenChange(next)
  }

  const canShare = Boolean(mediaAttachment || mediaUploadState.hasPreview)

  const handleShare = async () => {
    if (mediaUploadState.uploading) {
      toast.error('Wait for your upload to finish')
      return
    }

    let attachment = mediaAttachment
    if (!attachment && mediaUploadState.hasPreview) {
      attachment = (await mediaPanelRef.current?.uploadPendingPreview()) ?? null
      if (!attachment) return
    }

    if (!attachment) {
      toast.error('Add a photo or video first')
      return
    }

    const type = resolvedMediaKind === 'video' ? 'video' : 'image'
    const payload: Record<string, unknown> = {}

    if (type === 'image') {
      payload.imageUrl = attachment.url
    } else {
      payload.videoUrl = attachment.url
      if (attachment.posterUrl) payload.posterUrl = attachment.posterUrl
      if (attachment.durationSec) payload.durationSec = attachment.durationSec
    }
    payload.isStory = true

    try {
      await createFeed.mutateAsync({ type, payload })
      toast.success('Story shared')
      handleClose(false)
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Could not share story'
      toast.error(message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="fixed inset-0 z-50 flex h-[100dvh] w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-0 p-0 [&>button]:hidden">
        <DialogHeader className="flex shrink-0 flex-row items-center justify-between space-y-0 border-b px-4 py-3">
          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={() => handleClose(false)}>
              <X className="h-5 w-5" />
            </Button>
            <DialogTitle className="text-xl font-bold">Your story</DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex items-center gap-3 border-b px-5 py-3">
          <UserAvatar name={userName} avatarUrl={avatarUrl} className="h-10 w-10" />
          <p className="text-sm font-semibold">{userName}</p>
        </div>

        <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-6 sm:px-8">
          <div className="w-full max-w-xl rounded-xl border bg-card p-4 shadow-sm sm:p-6">
            <p className="mb-4 text-center text-sm font-medium text-muted-foreground">
              Upload a photo or video for your story
            </p>
            <MediaAttachPanel
              ref={mediaPanelRef}
              kind="photo-video"
              attachment={mediaAttachment}
              onAttachmentChange={setMediaAttachment}
              onResolvedKind={setResolvedMediaKind}
              onUploadStateChange={setMediaUploadState}
              initialTab="upload"
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-3 border-t px-4 py-3">
          <Button type="button" variant="ghost" onClick={() => handleClose(false)}>
            Discard
          </Button>
          <Button
            type="button"
            onClick={() => void handleShare()}
            disabled={!canShare || createFeed.isPending || mediaUploadState.uploading}
          >
            {createFeed.isPending || mediaUploadState.uploading ? 'Sharing…' : 'Share to Story'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
