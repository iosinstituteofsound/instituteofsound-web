import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowRight, Bookmark, Pause, Play } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useExplore } from '@/modules/explore/hooks/use-explore'
import { ReleaseVinylArt } from '@/modules/explore/components/release-vinyl-art'
import { artistInitials } from '@/modules/explore/lib/artist-meta'
import {
  parseReleaseSharePayload,
  releaseSharePayloadToReleaseDto,
  resolveReleaseShareFromCatalog,
  type ReleaseShareArtistSnapshot,
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

function ArtistLocation({ artist }: { artist: ReleaseShareArtistSnapshot }) {
  const parts = [artist.labelName].filter(Boolean)
  if (parts.length === 0) return null
  return <p className="feed-release-preview__artist-location">{parts.join(' • ')}</p>
}

function ArtistStats({ artist }: { artist: ReleaseShareArtistSnapshot }) {
  const stats = [
    { label: 'Tracks', value: artist.trackCount },
    { label: 'Plays', value: artist.totalPlays },
    { label: 'Releases', value: artist.releaseCount },
    { label: 'Listeners', value: artist.listeners },
  ].filter((entry) => entry.value !== undefined && entry.value !== null)

  if (stats.length === 0) return null

  return (
    <dl className="feed-release-preview__stats">
      {stats.map((entry) => (
        <div key={entry.label}>
          <dt>{entry.label}</dt>
          <dd>{entry.value}</dd>
        </div>
      ))}
    </dl>
  )
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
  const releaseUrl = share.releaseUrl ?? `/releases/${share.releaseId}`

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

      {artist ? (
        <div className="feed-release-preview__artist-card">
          <div className="feed-release-preview__artist-left">
            {artist.avatarUrl ? (
              <img src={artist.avatarUrl} alt="" className="feed-release-preview__artist-avatar" />
            ) : (
              <span className="feed-release-preview__artist-avatar feed-release-preview__artist-avatar--fb" aria-hidden>
                {artistInitials(artist.displayName)}
              </span>
            )}

            <div className="feed-release-preview__artist-copy">
              <div className="feed-release-preview__artist-head">
                <span className="feed-release-preview__artist-kicker ios-mh-kicker">Artist</span>
                <span className="feed-release-preview__artist-card-name">{artist.displayName}</span>
                <ArtistLocation artist={artist} />
              </div>
              {artist.bio ? <p className="feed-release-preview__bio">{artist.bio}</p> : null}
              {artist.genres.length > 0 ? (
                <div className="feed-release-preview__tags" aria-label="Artist genres">
                  {artist.genres.slice(0, 2).map((genre) => (
                    <span key={genre} className="feed-release-preview__tag">
                      {genre}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="feed-release-preview__artist-right">
            <ArtistStats artist={artist} />
            {artist.userId ? (
              <Link to={`/profile/${artist.userId}`} className="feed-release-preview__studio-btn">
                <span>View studio</span>
                <ArrowRight size={13} strokeWidth={2.5} aria-hidden />
              </Link>
            ) : (
              <Link to={releaseUrl} className="feed-release-preview__studio-btn">
                <span>View release</span>
                <ArrowRight size={13} strokeWidth={2.5} aria-hidden />
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export { isReleaseShareItem } from '@/modules/feed/lib/feed-release-payload'
