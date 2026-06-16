import { useState, type RefObject } from 'react'
import { Link } from 'react-router-dom'
import { Camera, ImageIcon, Send, X } from 'lucide-react'
import { useAuthStore } from '@/app/stores/auth-store'
import { useMe } from '@/modules/auth/hooks/use-auth'
import {
  AnimatedEmojiPicker,
  EmojiTriggerButton,
} from '@/modules/feed/components/animated-emoji-picker'
import {
  GiphyPicker,
  GiphyTriggerButton,
} from '@/modules/feed/components/giphy-picker'
import type { GiphyGif } from '@/modules/feed/api/giphy.api'
import { FeedUserAvatar } from '@/modules/feed/components/feed-user-avatar'
import { useAddFeedComment } from '@/modules/feed/hooks/use-feed-engagement'
import type { FeedCommentDto } from '@/modules/feed/types/feed.types'
import { Textarea } from '@/shared/components/ui/textarea'
import { cn } from '@/shared/lib/cn'

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
  const addComment = useAddFeedComment()
  const [draft, setDraft] = useState('')
  const [selectedGif, setSelectedGif] = useState<GiphyGif | null>(null)
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [emojiAnchor, setEmojiAnchor] = useState<HTMLElement | null>(null)
  const [giphyOpen, setGiphyOpen] = useState(false)
  const [giphyAnchor, setGiphyAnchor] = useState<HTMLElement | null>(null)

  const handleEmojiTrigger = (anchor: HTMLElement) => {
    if (emojiOpen && emojiAnchor === anchor) {
      setEmojiOpen(false)
      return
    }
    setGiphyOpen(false)
    setEmojiAnchor(anchor)
    setEmojiOpen(true)
  }

  const handleGiphyTrigger = (anchor: HTMLElement) => {
    if (giphyOpen && giphyAnchor === anchor) {
      setGiphyOpen(false)
      return
    }
    setEmojiOpen(false)
    setGiphyAnchor(anchor)
    setGiphyOpen(true)
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
  const canSubmit = Boolean(draft.trim() || selectedGif)

  const submit = async () => {
    const body = draft.trim()
    if ((!body && !selectedGif) || addComment.isPending) return

    await addComment.mutateAsync({
      feedItemId,
      body: body || undefined,
      gifUrl: selectedGif?.url,
      giphyId: selectedGif?.id,
      parentId: replyTo?.id,
    })
    setDraft('')
    setSelectedGif(null)
    onClearReply?.()
    onPosted?.()
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
      onOpenChange={setGiphyOpen}
      onSelect={(gif) => {
        setSelectedGif(gif)
        setGiphyOpen(false)
      }}
      anchorEl={giphyAnchor}
      portalContainer={pickerPortalContainer}
    />
  )

  const gifPreview = selectedGif ? (
    <div className="feed-comment-composer__gif-preview">
      <img src={selectedGif.previewUrl} alt={selectedGif.title} />
      <button
        type="button"
        aria-label="Remove GIF"
        className="feed-comment-composer__gif-remove"
        onClick={() => setSelectedGif(null)}
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
          avatarUrl={me?.user.avatarUrl}
          className="h-9 w-9 shrink-0"
        />
        <div className="feed-comment-composer__box">
          {replyTo ? (
            <p className="feed-comment-composer__replying">
              Replying to <span>{replyTo.author.name}</span>
              <button type="button" onClick={onClearReply}>Cancel</button>
            </p>
          ) : null}
          {gifPreview}
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
              <button type="button" className="feed-comment-composer__tool" aria-label="Photo">
                <Camera className="h-5 w-5" />
              </button>
              <GiphyTriggerButton
                active={giphyOpen}
                className="feed-comment-composer__tool"
                onClick={handleGiphyTrigger}
              />
              <button type="button" className="feed-comment-composer__tool" aria-label="Sticker">
                <ImageIcon className="h-5 w-5" />
              </button>
            </div>
            <button
              type="button"
              className={cn('feed-comment-composer__send', canSubmit && 'is-ready')}
              aria-label="Post comment"
              disabled={!canSubmit || addComment.isPending}
              onClick={() => void submit()}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
        {emojiPicker}
        {giphyPicker}
      </div>
    )
  }

  return (
    <div className="feed-comment-composer feed-comment-composer--inline">
      <FeedUserAvatar
        name={me?.user.name ?? 'You'}
        avatarUrl={me?.user.avatarUrl}
        className="h-8 w-8 shrink-0"
      />
      <div className="min-w-0 flex-1 space-y-2">
        {replyTo ? (
          <p className="text-xs text-muted-foreground">
            Replying to <span className="font-medium text-foreground">{replyTo.author.name}</span>
            <button
              type="button"
              className="ml-2 font-semibold text-primary hover:underline"
              onClick={onClearReply}
            >
              Cancel
            </button>
          </p>
        ) : null}
        {gifPreview}
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
              disabled={addComment.isPending}
              onClick={() => void submit()}
            >
              {addComment.isPending ? 'Posting…' : 'Post'}
            </button>
          </div>
        ) : null}
      </div>
      {emojiPicker}
      {giphyPicker}
    </div>
  )
}
