import * as DialogPrimitive from '@radix-ui/react-dialog'
import { ChevronDown, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  getRadixOutsideEventTarget,
  isEmojiPickerTarget,
} from '@/modules/feed/components/animated-emoji-picker'
import { isGiphyPickerTarget } from '@/modules/feed/components/giphy-picker'
import type { FeedItemDto, FeedCommentDto } from '@/modules/feed/types/feed.types'
import { FeedCommentComposer } from '@/modules/feed/components/feed-comment-composer'
import { FeedCommentsSection } from '@/modules/feed/components/feed-comments-section'
import { FeedEngagementStatsBar } from '@/modules/feed/components/feed-engagement-stats-bar'
import { FeedPostPreview } from '@/modules/feed/components/feed-post-preview'
import './feed-comment-dialog.css'

interface FeedCommentDialogProps {
  item: FeedItemDto
  open: boolean
  onOpenChange: (open: boolean) => void
}

function isDropdownMenuTarget(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest('[data-radix-menu-content]'))
}

function isCommentPhotoCaptureTarget(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest('[data-comment-photo-capture]'))
}

function shouldIgnoreOutsideEvent(target: EventTarget | null) {
  return (
    isEmojiPickerTarget(target) ||
    isGiphyPickerTarget(target) ||
    isDropdownMenuTarget(target) ||
    isCommentPhotoCaptureTarget(target)
  )
}

export function FeedCommentDialog({ item, open, onOpenChange }: FeedCommentDialogProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [replyTo, setReplyTo] = useState<FeedCommentDto | null>(null)
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null)

  const handleDialogContentRef = useCallback((node: HTMLDivElement | null) => {
    setPortalContainer(node)
  }, [])

  useEffect(() => {
    if (!open) {
      setReplyTo(null)
      return
    }
    const timer = window.setTimeout(() => inputRef.current?.focus(), 120)
    return () => window.clearTimeout(timer)
  }, [open])

  const handleReply = (comment: FeedCommentDto) => {
    setReplyTo(comment)
    window.setTimeout(() => inputRef.current?.focus(), 0)
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="feed-comment-dialog__overlay" />
        <DialogPrimitive.Content
          ref={handleDialogContentRef}
          className="feed-comment-dialog"
          aria-describedby={undefined}
          onPointerDownOutside={(event) => {
            const target = getRadixOutsideEventTarget(event)
            if (shouldIgnoreOutsideEvent(target)) {
              event.preventDefault()
            }
          }}
          onInteractOutside={(event) => {
            const target = getRadixOutsideEventTarget(event)
            if (shouldIgnoreOutsideEvent(target)) {
              event.preventDefault()
            }
          }}
          onFocusOutside={(event) => {
            const target = getRadixOutsideEventTarget(event)
            if (shouldIgnoreOutsideEvent(target)) {
              event.preventDefault()
            }
          }}
        >
          <header className="feed-comment-dialog__header">
            <DialogPrimitive.Title className="feed-comment-dialog__title">
              {item.author.name}&apos;s post
            </DialogPrimitive.Title>
            <DialogPrimitive.Close className="feed-comment-dialog__close" aria-label="Close">
              <X className="h-5 w-5" />
            </DialogPrimitive.Close>
          </header>

          <div className="feed-comment-dialog__scroll">
            <FeedPostPreview item={item} menuPortalContainer={portalContainer} />
            <FeedEngagementStatsBar item={item} />
            <div className="feed-comment-dialog__filter">
              <button type="button" className="feed-comment-dialog__filter-btn">
                Most relevant
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
            <FeedCommentsSection
              feedItemId={item.id}
              expanded
              variant="modal"
              onReply={handleReply}
              showComposer={false}
            />
          </div>

          <footer className="feed-comment-dialog__footer">
            <FeedCommentComposer
              feedItemId={item.id}
              replyTo={replyTo}
              onClearReply={() => setReplyTo(null)}
              inputRef={inputRef}
              variant="modal"
              pickerPortalContainer={portalContainer}
            />
          </footer>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
