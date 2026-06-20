import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  MoreHorizontal,
  Play,
  Plus,
  Shuffle,
} from 'lucide-react'
import type { PlaylistDetailDto } from '@/modules/music/types/music.types'
import type { PlaylistDto } from '@/modules/explore/types/explore.types'
import { PlaylistTrackTable } from '@/modules/music/components/playlist-track-table'
import { usePlaylistCoverTheme } from '@/modules/music/hooks/use-playlist-cover-theme'
import { playlistToPlayerQueue } from '@/modules/music/lib/player-queue'
import { playlistCoverThemeStyle } from '@/modules/music/lib/playlist-cover-theme'
import {
  formatPlaylistTotalDuration,
  playlistCuratorLabel,
  playlistSavesLabel,
} from '@/modules/music/lib/playlist-detail-format'
import { usePlayerStore } from '@/modules/player/stores/player-store'
import { cn } from '@/shared/lib/cn'
import '@/modules/music/styles/playlist-detail.css'

interface PlaylistDetailViewProps {
  playlist: PlaylistDetailDto
  relatedPlaylists?: PlaylistDto[]
  onRemoveTrack?: (trackId: string) => void
  isRemovingTrack?: boolean
  backHref?: string
  backLabel?: string
  headerActions?: React.ReactNode
}

export function PlaylistDetailView({
  playlist,
  relatedPlaylists = [],
  onRemoveTrack,
  isRemovingTrack,
  backHref,
  backLabel = 'Go back',
  headerActions,
}: PlaylistDetailViewProps) {
  const playTrack = usePlayerStore((s) => s.playTrack)
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle)
  const shuffle = usePlayerStore((s) => s.shuffle)
  const [saved, setSaved] = useState(false)

  const theme = usePlaylistCoverTheme(playlist.coverUrl, playlist.slug)
  const themeStyle = useMemo(() => playlistCoverThemeStyle(theme), [theme])

  const cover =
    playlist.coverUrl ?? `https://picsum.photos/seed/playlist-${playlist.slug}/640/640`

  const queue = useMemo(() => playlistToPlayerQueue(playlist), [playlist])

  const playAtIndex = (index: number) => {
    const track = playlist.tracks[index]
    if (!track) return
    const url = track.audioUrl ?? track.streamUrl
    if (!url || !queue.length) return
    const queueIndex = queue.findIndex(
      (item) => item.trackId === track.trackId || item.audioUrl === url,
    )
    playTrack(queue[queueIndex >= 0 ? queueIndex : 0], {
      queue,
      queueIndex: queueIndex >= 0 ? queueIndex : 0,
    })
  }

  const handlePlayAll = () => {
    if (!queue.length) return
    playTrack(queue[0], { queue })
  }

  const curator = playlistCuratorLabel(playlist)
  const curatorHref =
    playlist.ownerType === 'artist' && playlist.artistSlug
      ? `/artist/${playlist.artistSlug}`
      : undefined

  const filteredRelated = relatedPlaylists
    .filter((item) => item.slug !== playlist.slug)
    .slice(0, 6)

  return (
    <div className="playlist-detail" style={themeStyle}>
      <header className="playlist-detail__hero">
        <div className="playlist-detail__hero-bg" aria-hidden />
        <div className="playlist-detail__hero-noise" aria-hidden />

        {(backHref || headerActions) && (
          <div className="playlist-detail__hero-nav">
            {backHref ? (
              <Link to={backHref} className="playlist-detail__back" aria-label={backLabel}>
                <ArrowLeft size={18} strokeWidth={2} aria-hidden />
              </Link>
            ) : (
              <span />
            )}
            {headerActions ? (
              <div className="playlist-detail__hero-actions">{headerActions}</div>
            ) : null}
          </div>
        )}

        <div className="playlist-detail__hero-inner">
          <div className="playlist-detail__cover-wrap">
            {playlist.coverUrl ? (
              <img src={cover} alt="" className="playlist-detail__cover" />
            ) : (
              <div className="playlist-detail__cover-fallback" aria-hidden>
                ♪
              </div>
            )}
          </div>

          <div className="playlist-detail__meta">
            <h1 className="playlist-detail__title">{playlist.title}</h1>
            {playlist.description ? (
              <p className="playlist-detail__desc">{playlist.description}</p>
            ) : null}
            <div className="playlist-detail__stats">
              {curatorHref ? (
                <Link to={curatorHref} className="playlist-detail__curator-link">
                  {curator}
                </Link>
              ) : (
                <strong>{curator}</strong>
              )}
              <span className="playlist-detail__stats-sep">·</span>
              <span>{playlistSavesLabel(playlist.slug)}</span>
              <span className="playlist-detail__stats-sep">·</span>
              <span>
                {playlist.tracks.length} song{playlist.tracks.length === 1 ? '' : 's'}
              </span>
              {playlist.tracks.length > 0 ? (
                <>
                  <span className="playlist-detail__stats-sep">·</span>
                  <span>{formatPlaylistTotalDuration(playlist.tracks)}</span>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <div className="playlist-detail__toolbar">
        <button
          type="button"
          className="playlist-detail__play"
          aria-label="Play playlist"
          disabled={!queue.length}
          onClick={handlePlayAll}
        >
          <Play size={20} fill="currentColor" aria-hidden />
        </button>
        <button
          type="button"
          className={cn('playlist-detail__icon-btn', shuffle && 'is-active')}
          aria-label={shuffle ? 'Shuffle on' : 'Shuffle off'}
          disabled={!queue.length}
          onClick={toggleShuffle}
        >
          <Shuffle size={17} strokeWidth={2} aria-hidden />
        </button>
        <button
          type="button"
          className={cn('playlist-detail__icon-btn', saved && 'is-active')}
          aria-label={saved ? 'Saved to library' : 'Save to library'}
          onClick={() => setSaved((value) => !value)}
        >
          <Plus size={18} strokeWidth={2} aria-hidden />
        </button>
        <button type="button" className="playlist-detail__icon-btn" aria-label="More options">
          <MoreHorizontal size={18} strokeWidth={2} aria-hidden />
        </button>
      </div>

      <div className="playlist-detail__body">
        <PlaylistTrackTable
          playlist={playlist}
          onPlayTrack={playAtIndex}
          onRemoveTrack={onRemoveTrack}
          isRemovingTrack={isRemovingTrack}
        />

        {filteredRelated.length > 0 ? (
          <section className="playlist-detail__related" aria-labelledby="playlist-related-heading">
            <h2 id="playlist-related-heading" className="playlist-detail__related-title">
              You might also like
            </h2>
            <div className="playlist-detail__related-grid">
              {filteredRelated.map((item) => (
                <Link
                  key={item.id}
                  to={`/playlists/${item.slug}`}
                  className="playlist-detail__related-card"
                >
                  <div className="playlist-detail__related-cover-wrap">
                    <img
                      src={item.coverUrl ?? `https://picsum.photos/seed/${item.slug}-rel/320/320`}
                      alt=""
                      className="playlist-detail__related-cover"
                      loading="lazy"
                    />
                  </div>
                  <p className="playlist-detail__related-name">{item.title}</p>
                  <p className="playlist-detail__related-by">By Institute of Sound</p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  )
}
