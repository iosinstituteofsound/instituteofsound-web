import type { FeedCardProps } from '@/modules/feed/lib/feed-card-props'
import { LinkPreviewCard } from '@/shared/components/link-preview'
import { FeedCardShell, payloadString } from '@/modules/feed/components/cards/feed-card-shell'
import { parseLinkPreviewFromPayload } from '@/shared/lib/link-preview'

export function TextFeedCard({ item, defaultCommentsOpen, compact, onPostDeleted }: FeedCardProps) {
  const text = payloadString(item.payload, 'text') ?? item.body
  const linkPreview = parseLinkPreviewFromPayload(item.payload)

  return (
    <FeedCardShell
      item={{ ...item, body: text, title: undefined }}
      defaultCommentsOpen={defaultCommentsOpen}
      compact={compact}
      onPostDeleted={onPostDeleted}
    >
      {linkPreview ? <LinkPreviewCard preview={linkPreview} compact={compact} /> : null}
    </FeedCardShell>
  )
}
