import { ExternalLink, Music2, Pause, Play } from 'lucide-react'
import type { FeedCardProps } from '@/modules/feed/lib/feed-card-props'
import { FeedCardShell, payloadString } from '@/modules/feed/components/cards/feed-card-shell'
import { ReleaseSharePreview } from '@/modules/feed/components/release-share-preview'
import { isReleaseShareItem } from '@/modules/feed/lib/feed-release-payload'
import { useEnrichedMusicFeedItem } from '@/modules/feed/hooks/use-enriched-music-feed-item'
import { feedItemToPlayerTrack } from '@/modules/player/lib/feed-track'
import { usePlayer } from '@/modules/player/hooks/use-player'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

function musicHeaderContext(trackTitle?: string, artistName?: string) {
  const trackLine = [trackTitle, artistName].filter(Boolean).join(' · ')
  if (!trackLine) return null

  return (
    <>
      <Music2 aria-hidden />
      <span className="truncate">{trackLine}</span>
    </>
  )
}

export function MusicFeedCard({ item, defaultCommentsOpen, compact }: FeedCardProps) {
  const enrichedItem = useEnrichedMusicFeedItem(item)

  if (isReleaseShareItem(enrichedItem)) {
    return (
      <FeedCardShell item={item} defaultCommentsOpen={defaultCommentsOpen} compact={compact}>
        <ReleaseSharePreview item={enrichedItem} compact={compact} />
      </FeedCardShell>
    )
  }

  const trackTitle = payloadString(item.payload, 'trackTitle')
  const artistName = payloadString(item.payload, 'artistName')
  const youtubeUrl = payloadString(item.payload, 'youtubeUrl')
  const spotifyUrl = payloadString(item.payload, 'spotifyUrl')
  const audioUrl = payloadString(item.payload, 'audioUrl')
  const link = spotifyUrl ?? youtubeUrl
  const playerTrack = feedItemToPlayerTrack(item)
  const { isCurrentTrack, isPlaying, play, togglePlay } = usePlayer()
  const isActive = playerTrack ? isCurrentTrack(playerTrack.id) : false
  const showPause = isActive && isPlaying

  return (
    <FeedCardShell
      item={item}
      defaultCommentsOpen={defaultCommentsOpen}
      compact={compact}
      headerContext={musicHeaderContext(trackTitle, artistName)}
    >
      <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
        <button
          type="button"
          className={cn(
            'relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-primary/10 text-primary transition-colors',
            playerTrack && 'hover:bg-primary/15',
          )}
          disabled={!playerTrack}
          aria-label={showPause ? 'Pause track' : 'Play track'}
          onClick={() => {
            if (!playerTrack) return
            if (isActive) {
              togglePlay()
              return
            }
            play(playerTrack)
          }}
        >
          {playerTrack?.artworkUrl ? (
            <img src={playerTrack.artworkUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <Music2 className="h-7 w-7" />
          )}
          {playerTrack ? (
            <span className="absolute inset-0 grid place-items-center bg-background/35 opacity-0 transition-opacity hover:opacity-100">
              {showPause ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
            </span>
          ) : null}
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{trackTitle ?? 'Shared track'}</p>
          {artistName ? <p className="truncate text-sm text-muted-foreground">{artistName}</p> : null}
          {!audioUrl && link ? (
            <p className="mt-1 truncate text-xs text-muted-foreground">Stream link only — no in-app audio</p>
          ) : null}
        </div>
        {link ? (
          <Button variant="outline" size="sm" className="shrink-0 rounded-lg" asChild>
            <a href={link} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-1 h-4 w-4" />
              Listen
            </a>
          </Button>
        ) : playerTrack ? (
          <Button
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            className="shrink-0 rounded-lg"
            onClick={() => {
              if (isActive) {
                togglePlay()
                return
              }
              play(playerTrack)
            }}
          >
            {showPause ? <Pause className="mr-1 h-4 w-4" /> : <Play className="mr-1 h-4 w-4" />}
            {showPause ? 'Pause' : 'Play'}
          </Button>
        ) : null}
      </div>
    </FeedCardShell>
  )
}
