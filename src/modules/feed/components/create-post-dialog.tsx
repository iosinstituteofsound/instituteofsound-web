import { useEffect, useMemo, useRef, useState } from 'react'
import { useCreateFeedItem } from '@/modules/feed/hooks/use-feed'
import type { FeedItemDto, FeedItemType } from '@/modules/feed/types/feed.types'
import { ReleaseSharePreview } from '@/modules/feed/components/release-share-preview'
import { isReleaseSharePayload } from '@/modules/feed/lib/feed-release-payload'
import { FeedUserAvatar } from '@/modules/feed/components/feed-user-avatar'
import {
  AnimatedEmojiPicker,
  EmojiTriggerButton,
  getRadixOutsideEventTarget,
  isEmojiPickerTarget,
} from '@/modules/feed/components/animated-emoji-picker'
import { insertAtCursor } from '@/modules/feed/lib/animated-emoji'
import {
  CreatePostAddBar,
  CreatePostPrivacyBadge,
  type PostAddAction,
} from '@/modules/feed/components/create-post-add-bar'
import {
  MediaAttachPanel,
  type MediaAttachment,
  type MediaAttachPanelHandle,
} from '@/modules/feed/components/media-attach-panel'
import {
  LinkPreviewCard,
  LinkPreviewCardSkeleton,
} from '@/modules/feed/components/link-preview-card'
import { useLinkPreview } from '@/modules/feed/hooks/use-link-preview'
import { stripUrlFromText, urlsMatch } from '@/modules/feed/lib/link-preview'
import type { MediaAttachKind, MediaAttachMode } from '@/modules/feed/lib/media-utils'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { toast } from '@/shared/components/ui/sonner'
import { cn } from '@/shared/lib/cn'

interface CreatePostDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialType?: FeedItemType
  initialBody?: string
  initialPayload?: Record<string, unknown>
  userName: string
  avatarUrl?: string | null
}

function mapInitialType(type: FeedItemType): PostAddAction | null {
  if (type === 'image' || type === 'video') return 'photo-video'
  if (type === 'music') return 'audio'
  if (type === 'article') return 'article'
  return null
}

function mediaModeForAction(action: PostAddAction | null): MediaAttachMode | null {
  switch (action) {
    case 'photo-video':
      return 'photo-video'
    case 'audio':
    case 'record-audio':
      return 'audio'
    case 'record-video':
      return 'video'
    case 'clip':
      return 'photo-video'
    default:
      return null
  }
}

function initialTabForAction(action: PostAddAction | null): 'upload' | 'record' {
  if (action === 'record-video' || action === 'record-audio') return 'record'
  return 'upload'
}

export function CreatePostDialog({
  open,
  onOpenChange,
  initialType = 'text',
  initialBody = '',
  initialPayload,
  userName,
  avatarUrl,
}: CreatePostDialogProps) {
  const createFeed = useCreateFeedItem()
  const firstName = userName.split(' ')[0] ?? userName

  const [body, setBody] = useState('')
  const [activeAction, setActiveAction] = useState<PostAddAction | null>(null)
  const [resolvedMediaKind, setResolvedMediaKind] = useState<MediaAttachKind | null>(null)
  const [mediaAttachment, setMediaAttachment] = useState<MediaAttachment | null>(null)
  const [showArticleFields, setShowArticleFields] = useState(false)
  const [articleUrl, setArticleUrl] = useState('')
  const [articleExcerpt, setArticleExcerpt] = useState('')
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [emojiAnchor, setEmojiAnchor] = useState<HTMLElement | null>(null)
  const [linkPreviewDismissed, setLinkPreviewDismissed] = useState(false)
  const [mediaUploadState, setMediaUploadState] = useState({ uploading: false, hasPreview: false })
  const [releasePayload, setReleasePayload] = useState<Record<string, unknown> | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const mediaPanelRef = useRef<MediaAttachPanelHandle>(null)

  const linkPreviewEnabled = !mediaAttachment && !showArticleFields && !linkPreviewDismissed
  const { detectedUrl, preview: linkPreview, isLoading: linkPreviewLoading } = useLinkPreview(
    body,
    linkPreviewEnabled,
  )

  useEffect(() => {
    setLinkPreviewDismissed(false)
  }, [detectedUrl])

  const openEmojiPicker = (anchor: HTMLElement) => {
    setEmojiAnchor(anchor)
    setEmojiOpen(true)
  }

  const toggleEmojiPicker = (anchor: HTMLElement) => {
    if (emojiOpen && emojiAnchor === anchor) {
      setEmojiOpen(false)
      return
    }
    openEmojiPicker(anchor)
  }

  useEffect(() => {
    if (!open) return
    const mapped = mapInitialType(initialType)
    setActiveAction(mapped)
    setShowArticleFields(initialType === 'article')
    setBody(initialBody)
    setReleasePayload(initialPayload && isReleaseSharePayload(initialPayload) ? initialPayload : null)
  }, [open, initialType, initialBody, initialPayload])

  const reset = () => {
    setBody('')
    setActiveAction(null)
    setResolvedMediaKind(null)
    setMediaAttachment(null)
    setShowArticleFields(false)
    setArticleUrl('')
    setArticleExcerpt('')
    setEmojiOpen(false)
    setEmojiAnchor(null)
    setLinkPreviewDismissed(false)
    setMediaUploadState({ uploading: false, hasPreview: false })
    setReleasePayload(null)
    mediaPanelRef.current?.clearPendingPreview()
  }

  const handleClose = (next: boolean) => {
    if (!next) reset()
    onOpenChange(next)
  }

  const handleAddAction = (action: PostAddAction) => {
    if (action === 'article') {
      setShowArticleFields(true)
      setActiveAction(action)
      return
    }
    setShowArticleFields(false)
    setActiveAction(action)
  }

  const mediaMode = mediaModeForAction(activeAction)
  const showMediaPanel = Boolean(mediaMode) && activeAction !== 'clip' && !releasePayload
  const showClipEditor = activeAction === 'clip'

  const activeLinkPreview =
    linkPreviewEnabled &&
    detectedUrl &&
    linkPreview &&
    urlsMatch(linkPreview.url, detectedUrl)
      ? linkPreview
      : null

  const canPost = useMemo(() => {
    if (mediaUploadState.uploading) return false
    if (releasePayload) return true
    if (showArticleFields && articleUrl.trim()) return true
    if (mediaAttachment || mediaUploadState.hasPreview) return true
    if (activeLinkPreview) return true
    if (body.trim()) return true
    return false
  }, [body, mediaAttachment, showArticleFields, articleUrl, activeLinkPreview, mediaUploadState, releasePayload])

  const inferPostType = (attachment: MediaAttachment | null): FeedItemType => {
    if (releasePayload) return 'music'
    if (showArticleFields && articleUrl.trim()) return 'article'
    if (attachment || mediaUploadState.hasPreview) {
      if (resolvedMediaKind === 'video') return 'video'
      if (resolvedMediaKind === 'audio') return 'music'
      return 'image'
    }
    return 'text'
  }

  const handleEmojiSelect = (emoji: string) => {
    const field = textareaRef.current
    if (!field) {
      setBody((current) => current + emoji)
      return
    }

    const start = field.selectionStart ?? body.length
    const end = field.selectionEnd ?? body.length
    const { nextValue, cursor } = insertAtCursor(body, emoji, start, end)
    setBody(nextValue)

    requestAnimationFrame(() => {
      field.focus()
      field.setSelectionRange(cursor, cursor)
    })
  }

  const handleSubmit = async () => {
    if (mediaUploadState.uploading) {
      toast.error('Wait for your media upload to finish')
      return
    }

    let attachment = mediaAttachment

    if (!attachment && mediaUploadState.hasPreview) {
      attachment = (await mediaPanelRef.current?.uploadPendingPreview()) ?? null
      if (!attachment) return
    }

    const type = inferPostType(attachment)
    const payload: Record<string, unknown> = releasePayload ? { ...releasePayload } : {}

    if (type === 'text') {
      const postText = activeLinkPreview ? stripUrlFromText(body, activeLinkPreview.url) : body.trim()
      if (!postText && !activeLinkPreview) {
        toast.error('Write something to share')
        return
      }
      payload.text = postText || activeLinkPreview?.title || 'Shared link'
      if (activeLinkPreview) {
        payload.linkPreview = {
          url: activeLinkPreview.url,
          title: activeLinkPreview.title,
          description: activeLinkPreview.description,
          imageUrl: activeLinkPreview.imageUrl,
          siteName: activeLinkPreview.siteName,
        }
      }
    }

    if (type === 'text' && !payload.text) {
      toast.error('Write something to share')
      return
    }

    if (type === 'article') {
      if (!articleUrl.trim()) {
        toast.error('Add an article link')
        return
      }
      payload.articleUrl = articleUrl.trim()
      if (articleExcerpt.trim()) payload.excerpt = articleExcerpt.trim()
    }

    if (attachment) {
      if (type === 'image') payload.imageUrl = attachment.url
      if (type === 'video') {
        payload.videoUrl = attachment.url
        if (attachment.posterUrl) payload.posterUrl = attachment.posterUrl
        if (attachment.durationSec) payload.durationSec = attachment.durationSec
      }
      if (type === 'music') payload.audioUrl = attachment.url
    }

    try {
      const postBody =
        type === 'text'
          ? (payload.text as string | undefined) || body.trim() || undefined
          : body.trim() || undefined

      await createFeed.mutateAsync({
        type,
        body: postBody,
        payload,
      })
      toast.success('Posted to feed')
      handleClose(false)
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Could not post'
      toast.error(message)
    }
  }

  const releasePreviewItem = useMemo<FeedItemDto | null>(() => {
    if (!releasePayload) return null
    return {
      id: 'compose-preview',
      type: 'music',
      priority: 0,
      status: 'published',
      author: { id: 'preview', name: userName, avatarUrl: avatarUrl ?? undefined },
      body,
      payload: releasePayload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }, [releasePayload, userName, avatarUrl, body])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="gap-0 overflow-hidden p-0 sm:max-w-[500px] [&>button]:top-3 [&>button]:rounded-full [&>button]:bg-muted/80"
        onPointerDownOutside={(event) => {
          if (isEmojiPickerTarget(getRadixOutsideEventTarget(event))) event.preventDefault()
        }}
        onInteractOutside={(event) => {
          if (isEmojiPickerTarget(getRadixOutsideEventTarget(event))) event.preventDefault()
        }}
        onFocusOutside={(event) => {
          if (isEmojiPickerTarget(getRadixOutsideEventTarget(event))) event.preventDefault()
        }}
      >
        <DialogHeader className="border-b px-4 py-3.5">
          <DialogTitle className="text-center text-[1.05rem] font-bold">Create post</DialogTitle>
        </DialogHeader>

        <div className="max-h-[min(72vh,640px)] space-y-3 overflow-y-auto px-4 py-3">
          <div className="flex items-center gap-2">
            <FeedUserAvatar name={userName} avatarUrl={avatarUrl} className="h-10 w-10" />
            <div className="min-w-0">
              <p className="truncate font-semibold leading-tight">{userName}</p>
              <CreatePostPrivacyBadge />
            </div>
          </div>

          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder={`What's on your mind, ${firstName}?`}
              rows={4}
              className="min-h-[140px] resize-none border-0 bg-transparent px-0 pr-10 text-xl leading-relaxed shadow-none placeholder:text-muted-foreground/70 focus-visible:ring-0"
            />
            <EmojiTriggerButton
              active={emojiOpen}
              onClick={toggleEmojiPicker}
              className="absolute bottom-1 right-0"
            />
          </div>

          {linkPreviewLoading && detectedUrl && linkPreviewEnabled ? (
            <LinkPreviewCardSkeleton />
          ) : null}

          {activeLinkPreview && !linkPreviewLoading ? (
            <LinkPreviewCard
              preview={activeLinkPreview}
              onRemove={() => setLinkPreviewDismissed(true)}
            />
          ) : null}

          {releasePreviewItem ? (
            <div className="space-y-2">
              <ReleaseSharePreview item={releasePreviewItem} compact />
              <button
                type="button"
                className="text-xs font-semibold text-muted-foreground underline-offset-2 hover:underline"
                onClick={() => setReleasePayload(null)}
              >
                Remove release preview
              </button>
            </div>
          ) : null}

          {mediaAttachment ? (
            <div className="relative overflow-hidden rounded-lg border">
              <button
                type="button"
                className="absolute right-2 top-2 z-10 rounded-full bg-background/90 px-2 py-1 text-xs font-semibold shadow-sm"
                onClick={() => {
                  setMediaAttachment(null)
                  setResolvedMediaKind(null)
                }}
              >
                Remove
              </button>
              {resolvedMediaKind === 'image' || !resolvedMediaKind ? (
                <img src={mediaAttachment.url} alt="Post media" className="max-h-72 w-full object-cover" />
              ) : null}
              {resolvedMediaKind === 'video' ? (
                <video
                  src={mediaAttachment.url}
                  poster={mediaAttachment.posterUrl}
                  controls
                  className="max-h-72 w-full bg-black"
                />
              ) : null}
              {resolvedMediaKind === 'audio' ? (
                <div className="bg-muted/40 p-3">
                  <audio src={mediaAttachment.url} controls className="w-full" />
                </div>
              ) : null}
            </div>
          ) : showMediaPanel && mediaMode ? (
            <MediaAttachPanel
              ref={mediaPanelRef}
              kind={mediaMode}
              attachment={null}
              onAttachmentChange={(nextAttachment) => {
                setMediaAttachment(nextAttachment)
                if (nextAttachment) setActiveAction(null)
              }}
              onResolvedKind={setResolvedMediaKind}
              onUploadStateChange={setMediaUploadState}
              disabled={createFeed.isPending || mediaUploadState.uploading}
              embedded
              initialTab={initialTabForAction(activeAction)}
              showClipEditor={showClipEditor}
            />
          ) : null}

          {showArticleFields ? (
            <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
              <Input
                value={articleUrl}
                onChange={(event) => setArticleUrl(event.target.value)}
                placeholder="Paste article link"
              />
              <Textarea
                value={articleExcerpt}
                onChange={(event) => setArticleExcerpt(event.target.value)}
                placeholder="Short summary (optional)"
                rows={2}
              />
            </div>
          ) : null}

          <CreatePostAddBar
            activeAction={activeAction}
            onAction={handleAddAction}
            onEmojiClick={toggleEmojiPicker}
            emojiActive={emojiOpen}
            hasMedia={Boolean(mediaAttachment) || mediaUploadState.hasPreview}
            disabled={createFeed.isPending || mediaUploadState.uploading}
          />
        </div>

        <AnimatedEmojiPicker
          open={emojiOpen}
          onOpenChange={setEmojiOpen}
          onSelect={handleEmojiSelect}
          anchorEl={emojiAnchor}
        />

        <div className="border-t p-3">
          <Button
            type="button"
            className={cn(
              'h-11 w-full rounded-lg text-[15px] font-semibold',
              !canPost && 'opacity-50',
            )}
            disabled={createFeed.isPending || !canPost || mediaUploadState.uploading}
            onClick={handleSubmit}
          >
            {createFeed.isPending ? 'Posting…' : mediaUploadState.uploading ? 'Uploading…' : 'Post'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
