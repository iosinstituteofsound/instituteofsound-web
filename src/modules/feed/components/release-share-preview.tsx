import { useCallback, useEffect, useMemo, useState } from 'react'
import { Bookmark, Pause, Play } from 'lucide-react'
import { useExplore } from '@/modules/explore/hooks/use-explore'
import { ReleaseVinylArt } from '@/modules/explore/components/release-vinyl-art'
import {
  parseReleaseSharePayload,
  releaseSharePayloadToReleaseDto,
  resolveReleaseShareFromCatalog,
} from '@/modules/feed/lib/feed-release-payload'
import { payloadString } from '@/modules/feed/components/cards/feed-card-shell'
import type { FeedItemDto } from '@/modules/feed/types/feed.types'
import { feedItemToPlayerTrack, releaseShareItemToPlayerTrack } from '@/modules/player/lib/feed-track'
import { usePlayer } from '@/modules/player/hooks/use-player'
import { cn } from '@/shared/lib/cn'
import '@/modules/feed/components/feed-release-preview.css'

const SAVED_KEY = 'ios_saved_releases'

function readSaved(): Set<string> {
  try {
    const raw = localStorage.getItem(SAVED_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

interface ReleaseSharePreviewProps {
  item: FeedItemDto
  compact?: boolean
}

export function ReleaseSharePreview({ item, compact = false }: ReleaseSharePreviewProps) {
  const { data: explore } = useExplore()
  const share = useMemo(() => {
    const parsed = parseReleaseSharePayload(item.payload)
    return parsed ? resolveReleaseShareFromCatalog(parsed, explore) : null
  }, [item.payload, explore])
  const playerTrack = share ? releaseShareItemToPlayerTrack(item, share) : feedItemToPlayerTrack(item)
  const { isCurrentTrack, isPlaying, play, togglePlay } = usePlayer()
  const isActive = playerTrack ? isCurrentTrack(playerTrack.id) : false
  const playing = isActive && isPlaying
  const release = share ? releaseSharePayloadToReleaseDto(share) : null
  const artist = share?.artist
  const releaseId = share?.releaseId ?? payloadString(item.payload, 'releaseId') ?? ''
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (releaseId) setSaved(readSaved().has(releaseId))
  }, [releaseId])

  const toggleSave = useCallback(() => {
    if (!releaseId) return
    const next = readSaved()
    if (next.has(releaseId)) next.delete(releaseId)
    else next.add(releaseId)
    localStorage.setItem(SAVED_KEY, JSON.stringify([...next]))
    setSaved(next.has(releaseId))
  }, [releaseId])

  const handlePlayToggle = () => {
    if (!playerTrack) return
    if (isActive) {
      togglePlay()
      return
    }
    play(playerTrack)
  }

  if (!share || !release) return null

  const artistName = share.artistName ?? artist?.displayName ?? 'Unknown artist'

  return (
    <div
      className={cn(
        'feed-release-preview',
        compact && 'feed-release-preview--compact',
        playing && 'feed-release-preview--playing',
      )}
    >
      <div className="feed-release-preview__main">
        <div className="feed-release-preview__art">
          <ReleaseVinylArt release={release} variant="card" spinning={playing} />
        </div>

        <div className="feed-release-preview__info">
          <h3 className="feed-release-preview__title">{share.trackTitle}</h3>
          <div className="feed-release-preview__artist-line">
            <span className="feed-release-preview__artist-kicker ios-mh-kicker">Artist</span>
            <span className="feed-release-preview__artist-name">{artistName}</span>
          </div>

          <div className="feed-release-preview__actions">
            <button
              type="button"
              className="feed-release-preview__play-btn"
              disabled={!playerTrack}
              onClick={handlePlayToggle}
              aria-label={playing ? `Pause ${share.trackTitle}` : `Play ${share.trackTitle}`}
            >
              {playing ? (
                <Pause size={14} fill="currentColor" aria-hidden />
              ) : (
                <Play size={14} fill="currentColor" aria-hidden />
              )}
              <span>{playing ? 'Pause track' : 'Play track'}</span>
            </button>

            <button
              type="button"
              className={cn('feed-release-preview__save-btn', saved && 'is-saved')}
              onClick={toggleSave}
              aria-pressed={saved ? true : false}
            >
              <Bookmark size={13} strokeWidth={2} aria-hidden />
              <span>{saved ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export { isReleaseShareItem } from '@/modules/feed/lib/feed-release-payload'
