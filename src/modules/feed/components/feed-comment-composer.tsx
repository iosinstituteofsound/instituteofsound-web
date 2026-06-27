import { useEffect, useState, type RefObject } from 'react'
import { Link } from 'react-router-dom'
import { Send, X } from 'lucide-react'
import { useAuthStore } from '@/app/stores/auth-store'
import { useMe } from '@/modules/auth/hooks/use-auth'
import { uploadMediaFile } from '@/modules/feed/api/media.api'
import {
  AnimatedEmojiPicker,
  EmojiTriggerButton,
} from '@/shared/components/emoji'
import { CommentPhotoMenu } from '@/modules/feed/components/comment-photo-menu'
import {
  GiphyPicker,
  GiphyStickerTriggerButton,
  GiphyTriggerButton,
} from '@/modules/feed/components/giphy-picker'
import type { GiphyGif } from '@/modules/feed/api/giphy.api'
import { FeedUserAvatar } from '@/modules/feed/components/feed-user-avatar'
import { getUserAvatarThumbnailUrl } from '@/shared/lib/user-avatar'
import { useAddFeedComment } from '@/modules/feed/hooks/use-feed-engagement'
import type { FeedCommentDto } from '@/modules/feed/types/feed.types'
import { VerifiedUserName } from '@/shared/components/icons/verified-user-name'
import { Textarea } from '@/shared/components/ui/textarea'
import { toast } from '@/shared/components/ui/sonner'
import { cn } from '@/shared/lib/cn'

type CommentAttachment = {
  item: GiphyGif
  kind: 'gif' | 'sticker'
}

type CommentPhoto = {
  file: File
  previewUrl: string
}

interface FeedCommentComposerProps {
  feedItemId: string
  replyTo?: FeedCommentDto | null
  onClearReply?: () => void
  inputRef?: RefObject<HTMLTextAreaElement | null>
  variant?: 'inline' | 'modal'
  onPosted?: () => void
  pickerPortalContainer?: HTMLElement | null
}

export function FeedCommentComposer({
  feedItemId,
  replyTo,
  onClearReply,
  inputRef,
  variant = 'inline',
  onPosted,
  pickerPortalContainer = null,
}: FeedCommentComposerProps) {
  const userId = useAuthStore((s) => s.userId)
  const { data: me } = useMe(Boolean(userId))
  const myAvatarUrl = me?.user ? getUserAvatarThumbnailUrl(me.user) : undefined
  const addComment = useAddFeedComment()
  const [draft, setDraft] = useState('')
  const [selectedAttachment, setSelectedAttachment] = useState<CommentAttachment | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<CommentPhoto | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [emojiAnchor, setEmojiAnchor] = useState<HTMLElement | null>(null)
  const [giphyOpen, setGiphyOpen] = useState(false)
  const [giphyAnchor, setGiphyAnchor] = useState<HTMLElement | null>(null)
  const [stickerOpen, setStickerOpen] = useState(false)
  const [stickerAnchor, setStickerAnchor] = useState<HTMLElement | null>(null)

  useEffect(() => {
    return () => {
      if (selectedPhoto?.previewUrl) {
        URL.revokeObjectURL(selectedPhoto.previewUrl)
      }
    }
  }, [selectedPhoto?.previewUrl])

  const closeMediaPickers = () => {
    setGiphyOpen(false)
    setStickerOpen(false)
  }

  const clearSelectedPhoto = () => {
    setSelectedPhoto((current) => {
      if (current?.previewUrl) URL.revokeObjectURL(current.previewUrl)
      return null
    })
  }

  const handlePhotoSelected = (file: File) => {
    setSelectedAttachment(null)
    setSelectedPhoto((current) => {
      if (current?.previewUrl) URL.revokeObjectURL(current.previewUrl)
      return {
        file,
        previewUrl: URL.createObjectURL(file),
      }
    })
  }

  const handleEmojiTrigger = (anchor: HTMLElement) => {
    if (emojiOpen && emojiAnchor === anchor) {
      setEmojiOpen(false)
      return
    }
    closeMediaPickers()
    setEmojiAnchor(anchor)
    setEmojiOpen(true)
  }

  const handleGiphyTrigger = (anchor: HTMLElement) => {
    if (giphyOpen && giphyAnchor === anchor) {
      setGiphyOpen(false)
      return
    }
    setEmojiOpen(false)
    setStickerOpen(false)
    setGiphyAnchor(anchor)
    setGiphyOpen(true)
  }

  const handleStickerTrigger = (anchor: HTMLElement) => {
    if (stickerOpen && stickerAnchor === anchor) {
      setStickerOpen(false)
      return
    }
    setEmojiOpen(false)
    setGiphyOpen(false)
    setStickerAnchor(anchor)
    setStickerOpen(true)
  }

  if (!userId) {
    return (
      <div className={cn('feed-comment-composer', variant === 'modal' && 'feed-comment-composer--modal')}>
        <Link to="/auth/login" className="text-sm font-semibold text-primary hover:underline">
          Log in to comment
        </Link>
      </div>
    )
  }

  const firstName = me?.user.name?.split(' ')[0] ?? 'you'
  const canSubmit = Boolean(draft.trim() || selectedAttachment || selectedPhoto)
  const isSubmitting = addComment.isPending || uploadingPhoto

  const submit = async () => {
    const body = draft.trim()
    if ((!body && !selectedAttachment && !selectedPhoto) || isSubmitting) return

    setUploadingPhoto(true)
    try {
      let imageUrl: string | undefined
      if (selectedPhoto) {
        const extension = selectedPhoto.file.name.includes('.') ? '' : '.jpg'
        const uploaded = await uploadMediaFile(
          selectedPhoto.file,
          selectedPhoto.file.name || `comment-photo-${Date.now()}${extension}`,
        )
        imageUrl = uploaded.absoluteUrl ?? uploaded.url
      }

      await addComment.mutateAsync({
        feedItemId,
        body: body || undefined,
        gifUrl: selectedAttachment?.item.url,
        giphyId: selectedAttachment?.item.id,
        imageUrl,
        parentId: replyTo?.id,
      })
      setDraft('')
      setSelectedAttachment(null)
      clearSelectedPhoto()
      onClearReply?.()
      onPosted?.()
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String(err.message)
          : 'Could not post comment'
      toast.error(message)
    } finally {
      setUploadingPhoto(false)
    }
  }

  const emojiPicker = (
    <AnimatedEmojiPicker
      open={emojiOpen}
      onOpenChange={setEmojiOpen}
      onSelect={(emoji) => {
        setDraft((current) => current + emoji)
        setEmojiOpen(false)
      }}
      anchorEl={emojiAnchor}
    />
  )

  const giphyPicker = (
    <GiphyPicker
      open={giphyOpen}
      mode="gif"
      onOpenChange={setGiphyOpen}
      onSelect={(item) => {
        clearSelectedPhoto()
        setSelectedAttachment({ item, kind: 'gif' })
        setGiphyOpen(false)
      }}
      anchorEl={giphyAnchor}
      portalContainer={pickerPortalContainer}
    />
  )

  const stickerPicker = (
    <GiphyPicker
      open={stickerOpen}
      mode="sticker"
      onOpenChange={setStickerOpen}
      onSelect={(item) => {
        clearSelectedPhoto()
        setSelectedAttachment({ item, kind: 'sticker' })
        setStickerOpen(false)
      }}
      anchorEl={stickerAnchor}
      portalContainer={pickerPortalContainer}
    />
  )

  const attachmentPreview = selectedPhoto ? (
    <div className="feed-comment-composer__gif-preview">
      <img src={selectedPhoto.previewUrl} alt="Selected photo" className="object-cover" />
      <button
        type="button"
        aria-label="Remove photo"
        className="feed-comment-composer__gif-remove"
        onClick={clearSelectedPhoto}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  ) : selectedAttachment ? (
    <div
      className={cn(
        'feed-comment-composer__gif-preview',
        selectedAttachment.kind === 'sticker' && 'feed-comment-composer__sticker-preview',
      )}
    >
      <img
        src={selectedAttachment.item.previewUrl}
        alt={selectedAttachment.item.title}
        className={selectedAttachment.kind === 'sticker' ? 'object-contain' : undefined}
      />
      <button
        type="button"
        aria-label={selectedAttachment.kind === 'sticker' ? 'Remove sticker' : 'Remove GIF'}
        className="feed-comment-composer__gif-remove"
        onClick={() => setSelectedAttachment(null)}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  ) : null

  if (variant === 'modal') {
    return (
      <div className="feed-comment-composer feed-comment-composer--modal">
        <FeedUserAvatar
          name={me?.user.name ?? 'You'}
          avatarUrl={myAvatarUrl}
          className="h-9 w-9 shrink-0"
        />
        <div className="feed-comment-composer__box">
          {replyTo ? (
            <p className="feed-comment-composer__replying">
              Replying to{' '}
              <VerifiedUserName
                name={replyTo.author.name}
                isVerified={replyTo.author.isVerified}
                className="inline-flex font-medium text-foreground"
              />
              <button type="button" onClick={onClearReply}>Cancel</button>
            </p>
          ) : null}
          {attachmentPreview}
          <Textarea
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Comment as ${firstName}`}
            rows={2}
            className="feed-comment-composer__input"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void submit()
              }
            }}
          />
          <div className="feed-comment-composer__tools">
            <div className="feed-comment-composer__tool-group">
              <EmojiTriggerButton
                active={emojiOpen}
                size="sm"
                className="feed-comment-composer__tool feed-comment-composer__tool--emoji"
                onClick={handleEmojiTrigger}
              />
              <CommentPhotoMenu
                disabled={isSubmitting}
                portalContainer={pickerPortalContainer}
                onPhotoSelected={handlePhotoSelected}
              />
              <GiphyTriggerButton
                active={giphyOpen}
                className="feed-comment-composer__tool"
                onClick={handleGiphyTrigger}
              />
              <GiphyStickerTriggerButton
                active={stickerOpen}
                className="feed-comment-composer__tool"
                onClick={handleStickerTrigger}
              />
            </div>
            <button
              type="button"
              className={cn('feed-comment-composer__send', canSubmit && 'is-ready')}
              aria-label="Post comment"
              disabled={!canSubmit || isSubmitting}
              onClick={() => void submit()}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
        {emojiPicker}
        {giphyPicker}
        {stickerPicker}
      </div>
    )
  }

  return (
    <div className="feed-comment-composer feed-comment-composer--inline">
      <FeedUserAvatar
        name={me?.user.name ?? 'You'}
        avatarUrl={myAvatarUrl}
        className="h-8 w-8 shrink-0"
      />
      <div className="min-w-0 flex-1 space-y-2">
        {replyTo ? (
          <p className="text-xs text-muted-foreground">
            Replying to{' '}
            <VerifiedUserName
              name={replyTo.author.name}
              isVerified={replyTo.author.isVerified}
              className="inline-flex font-medium text-foreground"
            />
            <button
              type="button"
              className="ml-2 font-semibold text-primary hover:underline"
              onClick={onClearReply}
            >
              Cancel
            </button>
          </p>
        ) : null}
        {attachmentPreview}
        <div className="flex items-end gap-1">
          <Textarea
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Comment as ${firstName}`}
            rows={1}
            className="min-h-9 flex-1 resize-none rounded-full border-muted-foreground/20 bg-muted/40 px-4 py-2 text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void submit()
              }
            }}
          />
          <EmojiTriggerButton
            active={emojiOpen}
            size="sm"
            onClick={handleEmojiTrigger}
          />
        </div>
        {canSubmit ? (
          <div className="flex justify-end">
            <button
              type="button"
              className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              disabled={!canSubmit || isSubmitting}
              onClick={() => void submit()}
            >
              {isSubmitting ? 'Posting…' : 'Post'}
            </button>
          </div>
        ) : null}
      </div>
      {emojiPicker}
      {giphyPicker}
      {stickerPicker}
    </div>
  )
}
