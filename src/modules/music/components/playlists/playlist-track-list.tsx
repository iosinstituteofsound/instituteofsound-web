import type { PlaylistDetailDto } from '@/modules/music/types/music.types'
import { AddToPlaylistButton } from '@/modules/music/components/add-to-playlist-button'
import { PlaylistTrackRowMain } from '@/modules/music/components/playlists/playlist-track-row-main'
import {
  formatDateAdded,
  formatTrackDuration,
} from '@/modules/music/lib/playlist-detail-format'
import { cn } from '@/shared/lib/cn'
import '@/modules/music/styles/playlist.css'

type PlaylistTrackListProps = {
  playlist: PlaylistDetailDto
  onPlayTrack: (index: number) => void
  variant?: 'default' | 'compact'
  showDateAdded?: boolean
  showAddToPlaylist?: boolean
  className?: string
}

export function PlaylistTrackList({
  playlist,
  onPlayTrack,
  variant = 'default',
  showDateAdded = true,
  showAddToPlaylist = true,
  className,
}: PlaylistTrackListProps) {
  const isCompact = variant === 'compact'
  const showAddedCol = showDateAdded && !isCompact

  if (!playlist.tracks.length) {
    return <p className="playlist-track-list__empty">This playlist is empty.</p>
  }

  return (
    <div className={cn('playlist-track-list', isCompact && 'playlist-track-list--compact', className)}>
      <div className="playlist-track-list__head" role="row">
        <span>#</span>
        <span>Title</span>
        {showAddedCol ? <span>Added</span> : null}
        <span aria-label="Duration">Time</span>
        {showAddToPlaylist ? <span className="sr-only">Actions</span> : null}
      </div>
      {playlist.tracks.map((track, index) => (
        <div key={`${track.trackId}-${index}`} className="playlist-track-list__row" role="row">
          <span className="playlist-track-list__index">{index + 1}</span>
          <PlaylistTrackRowMain
            track={track}
            playlist={playlist}
            index={index}
            onPlayTrack={onPlayTrack}
          />
          {showAddedCol ? (
            <span className="playlist-track-list__added">{formatDateAdded(track.addedAt)}</span>
          ) : null}
          <span className="playlist-track-list__duration">
            {formatTrackDuration(track.durationSec)}
          </span>
          {showAddToPlaylist ? (
            <div className="playlist-track-list__actions">
              <AddToPlaylistButton
                trackId={track.trackId}
                title={track.title}
                artist={track.artistName}
                artworkUrl={track.coverUrl ?? playlist.coverUrl}
              />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  )
}
