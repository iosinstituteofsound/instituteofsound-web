import { useState, type ReactNode } from 'react'
import { AnimatedEmojiText } from '@/modules/feed/components/animated-emoji-text'
import { cn } from '@/shared/lib/cn'

const CAPTION_CHAR_LIMIT = 280
const URL_PATTERN = /(https?:\/\/[^\s<]+[^\s<.,;:!?'")\]}>]|www\.[^\s<]+[^\s<.,;:!?'")\]}>])/gi

function CaptionLink({ href, children }: { href: string; children: string }) {
  const url = href.startsWith('http') ? href : `https://${href}`
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer noopener"
      className="feed-social-card__caption-link"
    >
      {children}
    </a>
  )
}

function renderCaptionSegments(text: string): ReactNode[] {
  const parts: ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  const regex = new RegExp(URL_PATTERN.source, URL_PATTERN.flags)
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const slice = text.slice(lastIndex, match.index)
      parts.push(<AnimatedEmojiText key={`t-${lastIndex}`} text={slice} emojiSize="sm" />)
    }
    const url = match[0]
    parts.push(<CaptionLink key={`u-${match.index}`} href={url}>{url}</CaptionLink>)
    lastIndex = match.index + url.length
  }

  if (lastIndex < text.length) {
    parts.push(<AnimatedEmojiText key={`t-${lastIndex}`} text={text.slice(lastIndex)} emojiSize="sm" />)
  }

  return parts.length ? parts : [<AnimatedEmojiText key="full" text={text} emojiSize="sm" />]
}

interface FeedPostCaptionProps {
  text: string
  className?: string
}

export function FeedPostCaption({ text, className }: FeedPostCaptionProps) {
  const [expanded, setExpanded] = useState(false)
  const trimmed = text.trim()
  if (!trimmed) return null

  const needsTruncate = trimmed.length > CAPTION_CHAR_LIMIT
  const visibleText = expanded || !needsTruncate ? trimmed : `${trimmed.slice(0, CAPTION_CHAR_LIMIT).trimEnd()}…`

  return (
    <div className={cn('feed-social-card__caption', className)}>
      <p className="feed-social-card__caption-text whitespace-pre-wrap">
        {renderCaptionSegments(visibleText)}
        {needsTruncate && !expanded ? (
          <button
            type="button"
            className="feed-social-card__see-more"
            onClick={() => setExpanded(true)}
          >
            See more
          </button>
        ) : null}
      </p>
    </div>
  )
}

export function buildPostCaptionText(title?: string, body?: string) {
  const parts = [title?.trim(), body?.trim()].filter(Boolean)
  return parts.join('\n\n')
}
