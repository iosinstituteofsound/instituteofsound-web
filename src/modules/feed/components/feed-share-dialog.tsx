import * as DialogPrimitive from '@radix-ui/react-dialog'
import {
  ChevronDown,
  ChevronRight,
  Globe,
  Smile,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useMe } from '@/modules/auth/hooks/use-auth'
import { AnimatedEmojiPicker } from '@/modules/feed/components/animated-emoji-picker'
import { FeedUserAvatar } from '@/modules/feed/components/feed-user-avatar'
import { getUserAvatarThumbnailUrl } from '@/shared/lib/user-avatar'
import {
  ShareCopyLinkIcon,
  ShareFriendProfileIcon,
  ShareGroupIcon,
  ShareMessengerIcon,
  ShareStoryIcon,
  ShareWhatsAppIcon,
} from '@/modules/feed/components/feed-share-icons'
import { buildFeedPostPageMeta } from '@/modules/feed/lib/feed-post-meta'
import type { FeedItemDto } from '@/modules/feed/types/feed.types'
import { env } from '@/shared/config/env'
import { toast } from '@/shared/components/ui/sonner'
import './feed-share-dialog.css'

interface FeedShareDialogProps {
  item: FeedItemDto
  open: boolean
  onOpenChange: (open: boolean) => void
}

function buildShareUrl(item: FeedItemDto) {
  const origin = (typeof window !== 'undefined' ? window.location.origin : env.siteUrl).replace(/\/+$/, '')
  return `${origin}/feed/${item.id}`
}

function buildShareText(item: FeedItemDto, message: string) {
  const meta = buildFeedPostPageMeta(item)
  const title = meta.title.replace(/ · Institute of Sound$/, '')
  const parts = [message.trim(), title, buildShareUrl(item)].filter(Boolean)
  return parts.join('\n\n')
}

export function FeedShareDialog({ item, open, onOpenChange }: FeedShareDialogProps) {
  const { data: me } = useMe(open)
  const [message, setMessage] = useState('')
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const emojiAnchorRef = useRef<HTMLButtonElement>(null)
  const contactsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) {
      setMessage('')
      setEmojiOpen(false)
    }
  }, [open])

  const shareUrl = buildShareUrl(item)
  const userName = me?.user.name ?? 'You'
  const avatarUrl = me?.user ? getUserAvatarThumbnailUrl(me.user) : undefined

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Link copied')
    } catch {
      toast.error('Could not copy link')
    }
  }

  const nativeShare = async (text: string) => {
    const meta = buildFeedPostPageMeta(item)
    const title = meta.title.replace(/ · Institute of Sound$/, '')

    if (navigator.share) {
      await navigator.share({
        url: shareUrl,
        title,
        text: text || meta.description,
      })
      toast.success('Post shared')
      return true
    }

    await navigator.clipboard.writeText(text || shareUrl)
    toast.success('Link copied')
    return true
  }

  const shareNow = async () => {
    if (busy) return
    setBusy(true)
    try {
      await nativeShare(buildShareText(item, message))
      onOpenChange(false)
    } catch {
      /* user dismissed native share */
    } finally {
      setBusy(false)
    }
  }

  const openWhatsApp = () => {
    const text = buildShareText(item, message)
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
  }

  const openMessenger = () => {
    void copyLink()
    toast.message('Link copied — paste it in Messenger')
  }

  const scrollContacts = () => {
    contactsRef.current?.scrollBy({ left: 180, behavior: 'smooth' })
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="feed-share-dialog__overlay" />
        <DialogPrimitive.Content className="feed-share-dialog" aria-describedby={undefined}>
          <header className="feed-share-dialog__header">
            <DialogPrimitive.Title className="feed-share-dialog__title">Share</DialogPrimitive.Title>
            <DialogPrimitive.Close className="feed-share-dialog__close" aria-label="Close">
              <X className="h-5 w-5" />
            </DialogPrimitive.Close>
          </header>

          <div className="feed-share-dialog__body">
            <p className="feed-share-dialog__notice">
              Links you share are unique to you and may be used to improve suggestions and ads that you see.{' '}
              <a href="/privacy" className="feed-share-dialog__notice-link">
                Learn more
              </a>
            </p>

            <section className="feed-share-dialog__composer">
              <div className="feed-share-dialog__author">
                <FeedUserAvatar name={userName} avatarUrl={avatarUrl} className="h-10 w-10 shrink-0" />
                <div className="feed-share-dialog__author-meta">
                  <p className="feed-share-dialog__author-name">{userName}</p>
                  <div className="feed-share-dialog__badges">
                    <span className="feed-share-dialog__badge">Feed</span>
                    <span className="feed-share-dialog__badge">
                      <Globe />
                      Public
                      <ChevronDown />
                    </span>
                  </div>
                </div>
              </div>

              <div className="feed-share-dialog__input-wrap">
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Say something about this..."
                  className="feed-share-dialog__input"
                  rows={3}
                />
                <button
                  ref={emojiAnchorRef}
                  type="button"
                  className="feed-share-dialog__emoji-btn"
                  aria-label="Add emoji"
                  data-emoji-trigger
                  onClick={() => setEmojiOpen((current) => !current)}
                >
                  <Smile className="h-5 w-5" />
                </button>
                <AnimatedEmojiPicker
                  open={emojiOpen}
                  onOpenChange={setEmojiOpen}
                  anchorEl={emojiAnchorRef.current}
                  onSelect={(emoji) => {
                    setMessage((current) => current + emoji)
                    setEmojiOpen(false)
                  }}
                />
              </div>

              <div className="feed-share-dialog__share-now">
                <button
                  type="button"
                  className="feed-share-dialog__share-now-btn"
                  disabled={busy}
                  onClick={() => void shareNow()}
                >
                  Share now
                </button>
              </div>
            </section>

            <section className="feed-share-dialog__section">
              <h3 className="feed-share-dialog__section-title">Send in Messenger</h3>
              <div className="feed-share-dialog__contacts">
                <div ref={contactsRef} className="feed-share-dialog__contacts-scroll">
                  <p className="feed-share-dialog__empty-contacts">No recent chats yet</p>
                </div>
                <button
                  type="button"
                  className="feed-share-dialog__contacts-next"
                  aria-label="Show more contacts"
                  onClick={scrollContacts}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </section>

            <section className="feed-share-dialog__section">
              <h3 className="feed-share-dialog__section-title">Share to</h3>
              <div className="feed-share-dialog__share-grid">
                <button type="button" className="feed-share-dialog__share-option" onClick={openMessenger}>
                  <span className="feed-share-dialog__share-option-icon">
                    <ShareMessengerIcon />
                  </span>
                  <span className="feed-share-dialog__share-option-label">Messenger</span>
                </button>

                <button type="button" className="feed-share-dialog__share-option" onClick={openWhatsApp}>
                  <span className="feed-share-dialog__share-option-icon">
                    <ShareWhatsAppIcon />
                  </span>
                  <span className="feed-share-dialog__share-option-label">WhatsApp</span>
                </button>

                <button
                  type="button"
                  className="feed-share-dialog__share-option"
                  onClick={() => toast.message('Stories coming soon')}
                >
                  <span className="feed-share-dialog__share-option-icon">
                    <ShareStoryIcon />
                  </span>
                  <span className="feed-share-dialog__share-option-label">Your story</span>
                </button>

                <button type="button" className="feed-share-dialog__share-option" onClick={() => void copyLink()}>
                  <span className="feed-share-dialog__share-option-icon">
                    <ShareCopyLinkIcon />
                  </span>
                  <span className="feed-share-dialog__share-option-label">Copy link</span>
                </button>

                <button
                  type="button"
                  className="feed-share-dialog__share-option"
                  onClick={() => toast.message('Group sharing coming soon')}
                >
                  <span className="feed-share-dialog__share-option-icon">
                    <ShareGroupIcon />
                  </span>
                  <span className="feed-share-dialog__share-option-label">Group</span>
                </button>

                <button
                  type="button"
                  className="feed-share-dialog__share-option"
                  onClick={() => toast.message('Profile sharing coming soon')}
                >
                  <span className="feed-share-dialog__share-option-icon">
                    <ShareFriendProfileIcon />
                  </span>
                  <span className="feed-share-dialog__share-option-label">Friend&apos;s profile</span>
                </button>
              </div>
            </section>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
