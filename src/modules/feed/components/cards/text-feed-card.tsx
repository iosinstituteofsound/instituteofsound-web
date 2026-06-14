import type { FeedCardProps } from '@/modules/feed/lib/feed-type-registry'
import { AnimatedEmojiText } from '@/modules/feed/components/animated-emoji-text'
import { LinkPreviewCard } from '@/modules/feed/components/link-preview-card'
import { FeedCardShell, payloadString } from '@/modules/feed/components/cards/feed-card-shell'
import { parseLinkPreviewFromPayload } from '@/modules/feed/lib/link-preview'

export function TextFeedCard({ item, defaultCommentsOpen }: FeedCardProps) {
  const text = payloadString(item.payload, 'text') ?? item.body
  const linkPreview = parseLinkPreviewFromPayload(item.payload)

  return (
    <FeedCardShell item={{ ...item, body: undefined }} defaultCommentsOpen={defaultCommentsOpen}>
      {text ? (
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
          <AnimatedEmojiText text={text} emojiSize="sm" />
        </p>
      ) : !linkPreview ? (
        <p className="text-sm italic text-muted-foreground">Empty post</p>
      ) : null}

      {linkPreview ? (
        <div className={text ? 'mt-3' : undefined}>
          <LinkPreviewCard preview={linkPreview} />
        </div>
      ) : null}
    </FeedCardShell>
  )
}
