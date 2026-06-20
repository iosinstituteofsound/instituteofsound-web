import { Link } from 'react-router-dom'
import { Play, Trash2 } from 'lucide-react'
import type { PlaylistDetailDto } from '@/modules/music/types/music.types'
import { playPlaylistFromDetail } from '@/modules/music/lib/player-queue'
import { usePlayerStore } from '@/modules/player/stores/player-store'
import { cn } from '@/shared/lib/cn'
import '@/modules/music/styles/playlist.css'

type PlaylistGridCardProps = {
  playlist: PlaylistDetailDto
  href: string
  onDelete?: (id: string) => void
  isDeleting?: boolean
  className?: string
}

function playlistCover(playlist: PlaylistDetailDto): string | undefined {
  return playlist.coverUrl ?? undefined
}

export function PlaylistGridCard({
  playlist,
  href,
  onDelete,
  isDeleting,
  className,
}: PlaylistGridCardProps) {
  const playTrack = usePlayerStore((s) => s.playTrack)
  const cover = playlistCover(playlist)
  const trackCount = playlist.tracks.length

  const handlePlay = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    playPlaylistFromDetail(playlist, playTrack, { isOwn: playlist.ownerType === 'listener' })
  }

  const handleDelete = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (!onDelete || isDeleting) return
    if (window.confirm(`Delete "${playlist.title}"? This cannot be undone.`)) {
      onDelete(playlist.id)
    }
  }

  return (
    <Link to={href} className={cn('playlist-grid-card', className)}>
      <div className="playlist-grid-card__art">
        {cover ? (
          <img src={cover} alt="" loading="lazy" className="playlist-grid-card__img" />
        ) : (
          <div className="playlist-grid-card__fallback" aria-hidden>
            {playlist.title.slice(0, 1).toUpperCase()}
          </div>
        )}
        {onDelete ? (
          <button
            type="button"
            className="playlist-grid-card__delete"
            aria-label={`Delete ${playlist.title}`}
            disabled={isDeleting}
            onClick={handleDelete}
          >
            <Trash2 size={14} aria-hidden />
          </button>
        ) : null}
        <button
          type="button"
          className="playlist-grid-card__play"
          aria-label={`Play ${playlist.title}`}
          onClick={handlePlay}
        >
          <Play size={14} fill="currentColor" aria-hidden />
        </button>
      </div>
      <div className="playlist-grid-card__body">
        <h3 className="playlist-grid-card__title">{playlist.title}</h3>
        <p className="playlist-grid-card__meta">
          {trackCount} track{trackCount === 1 ? '' : 's'} · {playlist.visibility}
        </p>
      </div>
    </Link>
  )
}
