import { useEffect, useMemo, useRef, useState } from 'react'
import { useCreateFeedItem } from '@/modules/feed/hooks/use-feed'
import type { FeedItemDto, FeedItemType } from '@/modules/feed/types/feed.types'
import { ReleaseSharePreview } from '@/modules/feed/components/release-share-preview'
import { isReleaseSharePayload } from '@/modules/feed/lib/feed-release-payload'
import { UserAvatar } from '@/shared/components/user'
import {
  AnimatedEmojiPicker,
  EmojiTriggerButton,
  getRadixOutsideEventTarget,
  isEmojiPickerTarget,
} from '@/shared/components/emoji'
import { insertAtCursor } from '@/shared/lib/emoji/animated-emoji'
import {
  CreatePostAddAudioBadge,
  CreatePostAddBar,
  CreatePostPrivacyBadge,
  type PostAddAction,
} from '@/modules/feed/components/create-post-add-bar'
import { PostAudiencePicker } from '@/modules/feed/components/post-audience-picker'
import {
  defaultPostAudience,
  postAudienceToPayload,
  readDefaultPostAudience,
  writeDefaultPostAudience,
  type PostAudienceSelection,
} from '@/modules/feed/lib/post-audience'
import { ArticleAudioSearchPicker } from '@/modules/editor/components/article-audio-search-picker'
import type { SiteAudioTrack } from '@/modules/editor/lib/site-audio-library'
import {
  MediaAttachPanel,
  type MediaAttachment,
  type MediaAttachPanelHandle,
} from '@/modules/feed/components/media-attach-panel'
import {
  ModelAttachPanel,
  type ModelAttachment,
  type ModelAttachPanelHandle,
} from '@/modules/feed/components/model-attach-panel'
import {
  LinkPreviewCard,
  LinkPreviewCardSkeleton,
} from '@/shared/components/link-preview'
import { useLinkPreview } from '@/shared/hooks/use-link-preview'
import { stripUrlFromText, urlsMatch } from '@/shared/lib/link-preview'
import type { MediaAttachKind, MediaAttachMode } from '@/modules/feed/lib/media-utils'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { toast } from '@/shared/components/ui/sonner'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, MoreHorizontal } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import './create-post-dialog.css'

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
  if (type === 'model') return 'model'
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
  const [modelAttachment, setModelAttachment] = useState<ModelAttachment | null>(null)
  const [showArticleFields, setShowArticleFields] = useState(false)
  const [articleUrl, setArticleUrl] = useState('')
  const [articleExcerpt, setArticleExcerpt] = useState('')
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [emojiAnchor, setEmojiAnchor] = useState<HTMLElement | null>(null)
  const [linkPreviewDismissed, setLinkPreviewDismissed] = useState(false)
  const [mediaUploadState, setMediaUploadState] = useState({ uploading: false, hasPreview: false })
  const [modelUploadState, setModelUploadState] = useState({ uploading: false, hasPreview: false })
  const [releasePayload, setReleasePayload] = useState<Record<string, unknown> | null>(null)
  const [librarySound, setLibrarySound] = useState<SiteAudioTrack | null>(null)
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [audienceOpen, setAudienceOpen] = useState(false)
  const [audience, setAudience] = useState<PostAudienceSelection>(defaultPostAudience)
  const [setAudienceAsDefault, setSetAudienceAsDefault] = useState(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const mediaPanelRef = useRef<MediaAttachPanelHandle>(null)
  const modelPanelRef = useRef<ModelAttachPanelHandle>(null)
  const composePanelRef = useRef<HTMLDivElement>(null)
  const [viewportHeight, setViewportHeight] = useState<number | null>(null)

  const linkPreviewEnabled =
    !mediaAttachment && !modelAttachment && !showArticleFields && !linkPreviewDismissed
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
    setAudienceOpen(false)
    setAudience(readDefaultPostAudience())
    setSetAudienceAsDefault(true)
    setViewportHeight(null)
  }, [open, initialType, initialBody, initialPayload])

  const reset = () => {
    setBody('')
    setActiveAction(null)
    setResolvedMediaKind(null)
    setMediaAttachment(null)
    setModelAttachment(null)
    setShowArticleFields(false)
    setArticleUrl('')
    setArticleExcerpt('')
    setEmojiOpen(false)
    setEmojiAnchor(null)
    setLinkPreviewDismissed(false)
    setMediaUploadState({ uploading: false, hasPreview: false })
    setModelUploadState({ uploading: false, hasPreview: false })
    setReleasePayload(null)
    setLibrarySound(null)
    setLibraryOpen(false)
    setAudienceOpen(false)
    setAudience(defaultPostAudience())
    setSetAudienceAsDefault(true)
    setViewportHeight(null)
    mediaPanelRef.current?.clearPendingPreview()
    modelPanelRef.current?.clearPendingPreview()
  }

  const handleClose = (next: boolean) => {
    if (!next) reset()
    onOpenChange(next)
  }

  const handleAddAction = (action: PostAddAction) => {
    if (action === 'library-sound') {
      setLibraryOpen(true)
      return
    }
    if (action === 'article') {
      setShowArticleFields(true)
      setActiveAction(action)
      return
    }
    setShowArticleFields(false)
    setActiveAction(action)
  }

  const mediaMode = mediaModeForAction(activeAction)
  const showModelPanel = activeAction === 'model' && !releasePayload
  const showMediaPanel = Boolean(mediaMode) && activeAction !== 'clip' && activeAction !== 'model' && !releasePayload
  const showClipEditor = activeAction === 'clip'

  const activeLinkPreview =
    linkPreviewEnabled &&
    detectedUrl &&
    linkPreview &&
    urlsMatch(linkPreview.url, detectedUrl)
      ? linkPreview
      : null

  const isUploading = mediaUploadState.uploading || modelUploadState.uploading

  const canPost = useMemo(() => {
    if (isUploading) return false
    if (releasePayload) return true
    if (showArticleFields && articleUrl.trim()) return true
    if (modelAttachment || modelUploadState.hasPreview) return true
    if (mediaAttachment || mediaUploadState.hasPreview) return true
    if (librarySound) return true
    if (activeLinkPreview) return true
    if (body.trim()) return true
    return false
  }, [
    body,
    mediaAttachment,
    modelAttachment,
    showArticleFields,
    articleUrl,
    activeLinkPreview,
    mediaUploadState,
    modelUploadState,
    releasePayload,
    librarySound,
    isUploading,
  ])

  const inferPostType = (
    attachment: MediaAttachment | null,
    model: ModelAttachment | null,
  ): FeedItemType => {
    if (releasePayload) return 'music'
    if (model || modelUploadState.hasPreview) return 'model'
    if (showArticleFields && articleUrl.trim()) return 'article'
    if (attachment || mediaUploadState.hasPreview) {
      if (resolvedMediaKind === 'video') return 'video'
      if (resolvedMediaKind === 'audio') return 'music'
      return 'image'
    }
    if (librarySound) return 'music'
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
    if (isUploading) {
      toast.error('Wait for your upload to finish')
      return
    }

    let attachment = mediaAttachment
    let model = modelAttachment

    if (!model && modelUploadState.hasPreview) {
      model = (await modelPanelRef.current?.uploadPendingPreview()) ?? null
      if (!model) return
    }

    if (!attachment && mediaUploadState.hasPreview) {
      attachment = (await mediaPanelRef.current?.uploadPendingPreview()) ?? null
      if (!attachment && !model) return
    }

    const type = inferPostType(attachment, model)
    const payload: Record<string, unknown> = {
      ...postAudienceToPayload(audience),
      ...(releasePayload ? releasePayload : {}),
    }

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

    if (model) {
      payload.modelUrl = model.url
      if (model.sourceFormat) payload.sourceFormat = model.sourceFormat
      if (model.convertedFormat) payload.convertedFormat = model.convertedFormat
      if (model.converted !== undefined) payload.converted = model.converted
      if (model.originalName) payload.originalName = model.originalName
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

    if (librarySound) {
      if (type === 'image' || type === 'video') {
        payload.audioUrl = librarySound.streamUrl
        payload.trackTitle = librarySound.title
        payload.artistName = librarySound.artistName
        if (librarySound.durationSec) payload.durationSec = librarySound.durationSec
        if (librarySound.releaseId) payload.releaseId = librarySound.releaseId
      } else if (type === 'music' && !attachment) {
        payload.audioUrl = librarySound.streamUrl
        payload.trackTitle = librarySound.title
        payload.artistName = librarySound.artistName
        if (librarySound.durationSec) payload.durationSec = librarySound.durationSec
        if (librarySound.releaseId) payload.releaseId = librarySound.releaseId
      }
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
      if (setAudienceAsDefault) writeDefaultPostAudience(audience)
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

  const openAudiencePicker = () => {
    if (composePanelRef.current) {
      setViewportHeight(composePanelRef.current.getBoundingClientRect().height)
    }
    setAudienceOpen(true)
  }

  const closeAudiencePicker = () => {
    setAudienceOpen(false)
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
        className={cn(
          'feed-create-post !flex !flex-col !gap-0 z-[100] bg-card p-0 sm:max-w-[500px] sm:rounded-2xl',
          audienceOpen && 'feed-create-post--audience',
        )}
        hideCloseButton
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
        <DialogHeader className="feed-create-post__header">
          <div className="feed-create-post__header-stack">
            <div
              className={cn(
                'feed-create-post__header-view feed-create-post__header-view--compose',
                audienceOpen && 'is-hidden',
              )}
            >
              <DialogTitle className="feed-create-post__title">Create post</DialogTitle>
              <DialogClose className="feed-create-post__close" aria-label="Close">
                <span aria-hidden>×</span>
              </DialogClose>
            </div>

            <div
              className={cn(
                'feed-create-post__header-view feed-create-post__header-view--audience',
                !audienceOpen && 'is-hidden',
              )}
            >
              <button
                type="button"
                className="feed-create-post__header-back"
                onClick={closeAudiencePicker}
                aria-label="Back to create post"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h2 className="feed-create-post__title">Post audience</h2>
              <button type="button" className="feed-create-post__header-more" aria-label="More options">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>
          </div>
        </DialogHeader>

        <div
          className="feed-create-post__viewport"
          style={viewportHeight ? { minHeight: viewportHeight } : undefined}
        >
          <div ref={composePanelRef} className="feed-create-post__viewport-compose">
            <div className="feed-create-post__body feed-create-post__stack">
          <div className="feed-create-post__author">
            <UserAvatar name={userName} avatarUrl={avatarUrl} className="h-10 w-10" />
            <div className="min-w-0">
              <p className="feed-create-post__author-name">{userName}</p>
              <div className="feed-create-post__author-badges">
                <CreatePostPrivacyBadge
                  audience={audience}
                  disabled={createFeed.isPending || isUploading}
                  onClick={openAudiencePicker}
                />
                <CreatePostAddAudioBadge
                  artistName={librarySound?.artistName}
                  trackTitle={librarySound?.title}
                  disabled={createFeed.isPending || isUploading}
                  onClick={() => setLibraryOpen(true)}
                />
              </div>
            </div>
          </div>

          <div className="feed-create-post__composer">
            <Textarea
              ref={textareaRef}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder={`What's on your mind, ${firstName}?`}
              rows={4}
              className="feed-create-post__textarea focus-visible:ring-0"
            />
            <EmojiTriggerButton
              active={emojiOpen}
              onClick={toggleEmojiPicker}
              className="feed-create-post__emoji"
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
            <div className="feed-create-post__stack">
              <ReleaseSharePreview item={releasePreviewItem} compact />
              <button
                type="button"
                className="feed-create-post__remove-link"
                onClick={() => setReleasePayload(null)}
              >
                Remove release preview
              </button>
            </div>
          ) : null}

          {mediaAttachment ? (
            <div className="feed-create-post__panel relative overflow-hidden">
              <button
                type="button"
                className="feed-create-post__media-remove"
                onClick={() => {
                  setMediaAttachment(null)
                  setResolvedMediaKind(null)
                  setLibrarySound(null)
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
          ) : modelAttachment ? (
            <ModelAttachPanel
              attachment={modelAttachment}
              onAttachmentChange={setModelAttachment}
              disabled={createFeed.isPending || isUploading}
              embedded
            />
          ) : showModelPanel ? (
            <ModelAttachPanel
              ref={modelPanelRef}
              attachment={null}
              onAttachmentChange={(nextAttachment) => {
                setModelAttachment(nextAttachment)
                if (nextAttachment) setActiveAction(null)
              }}
              onUploadStateChange={setModelUploadState}
              disabled={createFeed.isPending || isUploading}
              embedded
            />
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
              disabled={createFeed.isPending || isUploading}
              embedded
              initialTab={initialTabForAction(activeAction)}
              showClipEditor={showClipEditor}
            />
          ) : null}

          <Dialog open={libraryOpen} onOpenChange={setLibraryOpen}>
            <DialogContent elevated className="feed-create-post__sound-dialog">
              <DialogHeader>
                <DialogTitle>Choose sound</DialogTitle>
              </DialogHeader>
              <ArticleAudioSearchPicker
                selectedTrackId={librarySound?.id ?? null}
                onSelect={(track) => {
                  setLibrarySound(track)
                  setLibraryOpen(false)
                }}
              />
            </DialogContent>
          </Dialog>

          {showArticleFields ? (
            <div className="feed-create-post__article-fields">
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
            hasMedia={
              Boolean(mediaAttachment) ||
              mediaUploadState.hasPreview ||
              Boolean(modelAttachment) ||
              modelUploadState.hasPreview
            }
            canAttachSound
            disabled={createFeed.isPending || isUploading}
          />
        </div>

        <AnimatedEmojiPicker
          open={emojiOpen}
          onOpenChange={setEmojiOpen}
          onSelect={handleEmojiSelect}
          anchorEl={emojiAnchor}
        />

        <div className="feed-create-post__footer">
          <button
            type="button"
            className={cn('feed-create-post__submit', !canPost && 'opacity-50')}
            disabled={createFeed.isPending || !canPost || isUploading}
            onClick={handleSubmit}
          >
            {createFeed.isPending
              ? 'Posting…'
              : isUploading
                ? modelUploadState.uploading
                  ? 'Converting model…'
                  : 'Uploading…'
                : 'Post'}
          </button>
        </div>
          </div>

          <AnimatePresence>
            {audienceOpen ? (
              <motion.div
                key="post-audience-sheet"
                className="feed-create-post__viewport-audience"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
              >
                <PostAudiencePicker
                  value={audience}
                  onChange={setAudience}
                  setAsDefault={setAudienceAsDefault}
                  onSetAsDefaultChange={setSetAudienceAsDefault}
                  onDone={closeAudiencePicker}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}
