import { ExternalLink } from 'lucide-react'
import type { FeedCardProps } from '@/modules/feed/lib/feed-type-registry'
import { FeedCardShell, payloadNumber, payloadString } from '@/modules/feed/components/cards/feed-card-shell'
import { Button } from '@/shared/components/ui/button'

export function ArticleFeedCard({ item, defaultCommentsOpen }: FeedCardProps) {
  const excerpt = payloadString(item.payload, 'excerpt')
  const articleUrl = payloadString(item.payload, 'articleUrl')
  const coverUrl = payloadString(item.payload, 'coverUrl')
  const readMinutes = payloadNumber(item.payload, 'readMinutes')

  return (
    <FeedCardShell
      item={item}
      defaultCommentsOpen={defaultCommentsOpen}
      media={
        coverUrl ? (
          <img src={coverUrl} alt={item.title ?? 'Article'} className="max-h-[320px] w-full bg-muted object-cover" />
        ) : null
      }
    >
      {excerpt ? <p className="text-sm leading-relaxed text-muted-foreground">{excerpt}</p> : null}
      <div className="mt-3 flex items-center justify-between gap-2">
        {readMinutes ? <span className="text-xs text-muted-foreground">{readMinutes} min read</span> : <span />}
        {articleUrl ? (
          <Button variant="link" size="sm" className="h-auto p-0" asChild>
            <a href={articleUrl} target="_blank" rel="noreferrer">
              Read more
              <ExternalLink className="ml-1 h-3.5 w-3.5" />
            </a>
          </Button>
        ) : null}
      </div>
    </FeedCardShell>
  )
}
