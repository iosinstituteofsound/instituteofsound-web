import { ExternalLink, Music2 } from 'lucide-react'
import type { FeedCardProps } from '@/modules/feed/lib/feed-type-registry'
import { FeedCardShell, payloadString } from '@/modules/feed/components/cards/feed-card-shell'
import { Button } from '@/shared/components/ui/button'

export function MusicFeedCard({ item, defaultCommentsOpen }: FeedCardProps) {
  const trackTitle = payloadString(item.payload, 'trackTitle')
  const artistName = payloadString(item.payload, 'artistName')
  const youtubeUrl = payloadString(item.payload, 'youtubeUrl')
  const spotifyUrl = payloadString(item.payload, 'spotifyUrl')
  const audioUrl = payloadString(item.payload, 'audioUrl')
  const link = spotifyUrl ?? youtubeUrl
  const trackLine = [trackTitle, artistName].filter(Boolean).join(' · ')

  return (
    <FeedCardShell
      item={item}
      defaultCommentsOpen={defaultCommentsOpen}
      subtitle={
        trackLine ? (
          <span className="inline-flex items-center gap-1.5">
            <Music2 className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{trackLine}</span>
          </span>
        ) : null
      }
    >
      <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Music2 className="h-7 w-7" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{trackTitle ?? 'Shared track'}</p>
          {artistName ? <p className="truncate text-sm text-muted-foreground">{artistName}</p> : null}
        </div>
        {link ? (
          <Button variant="outline" size="sm" className="shrink-0 rounded-lg" asChild>
            <a href={link} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-1 h-4 w-4" />
              Listen
            </a>
          </Button>
        ) : null}
      </div>
      {audioUrl ? (
        <audio controls className="mt-3 w-full">
          <source src={audioUrl} />
        </audio>
      ) : null}
    </FeedCardShell>
  )
}
