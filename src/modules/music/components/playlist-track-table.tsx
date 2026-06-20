import { Link } from 'react-router-dom'
import { Clock3, Play, Trash2 } from 'lucide-react'
import type { PlaylistDetailDto, PlaylistTrackRefDto } from '@/modules/music/types/music.types'
import {
  formatDateAdded,
  formatTrackDuration,
} from '@/modules/music/lib/playlist-detail-format'

interface PlaylistTrackTableProps {
  playlist: PlaylistDetailDto
  onPlayTrack: (index: number) => void
  onRemoveTrack?: (trackId: string) => void
  isRemovingTrack?: boolean
}

function trackThumb(track: PlaylistTrackRefDto, playlist: PlaylistDetailDto) {
  const src = track.coverUrl ?? playlist.coverUrl
  if (src) return <img src={src} alt="" className="playlist-track-table__thumb" loading="lazy" />
  return (
    <span className="playlist-track-table__thumb-fallback" aria-hidden>
      ♪
    </span>
  )
}

export function PlaylistTrackTable({
  playlist,
  onPlayTrack,
  onRemoveTrack,
  isRemovingTrack,
}: PlaylistTrackTableProps) {
  if (!playlist.tracks.length) {
    return <p className="playlist-detail__empty">This playlist is empty.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="playlist-track-table">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Title</th>
            <th scope="col" className="playlist-track-table__col-album">
              Album
            </th>
            <th scope="col" className="playlist-track-table__col-added">
              Date added
            </th>
            <th scope="col" aria-label="Duration">
              <Clock3 size={14} strokeWidth={2} aria-hidden />
            </th>
            {onRemoveTrack ? <th scope="col" className="w-10" aria-label="Actions" /> : null}
          </tr>
        </thead>
        <tbody>
          {playlist.tracks.map((track, index) => (
            <tr key={`${track.trackId}-${index}`}>
              <td>
                <span className="playlist-track-table__index">
                  <span className="playlist-track-table__index-num">{index + 1}</span>
                  <button
                    type="button"
                    className="playlist-track-table__index-play"
                    aria-label={`Play ${track.title}`}
                    onClick={() => onPlayTrack(index)}
                  >
                    <Play size={14} fill="currentColor" aria-hidden />
                  </button>
                </span>
              </td>
              <td>
                <button
                  type="button"
                  className="playlist-track-table__row-btn"
                  onClick={() => onPlayTrack(index)}
                >
                  <span className="playlist-track-table__title-cell">
                    {trackThumb(track, playlist)}
                    <span className="playlist-track-table__copy">
                      <span className="playlist-track-table__track-title">{track.title}</span>
                      <span className="playlist-track-table__artist">
                        {track.artistSlug ? (
                          <Link
                            to={`/artist/${track.artistSlug}`}
                            className="playlist-track-table__artist-link"
                            onClick={(event) => event.stopPropagation()}
                          >
                            {track.artistName}
                          </Link>
                        ) : (
                          track.artistName
                        )}
                      </span>
                    </span>
                  </span>
                </button>
              </td>
              <td className="playlist-track-table__col-album">
                {track.releaseTitle ? (
                  track.releaseSlug || track.releaseId ? (
                    <Link
                      to={`/releases/${track.releaseSlug ?? track.releaseId}`}
                      className="playlist-track-table__album-link"
                    >
                      {track.releaseTitle}
                    </Link>
                  ) : (
                    <span>{track.releaseTitle}</span>
                  )
                ) : (
                  '—'
                )}
              </td>
              <td className="playlist-track-table__col-added">{formatDateAdded(track.addedAt)}</td>
              <td className="playlist-track-table__duration">{formatTrackDuration(track.durationSec)}</td>
              {onRemoveTrack ? (
                <td>
                  <div className="playlist-track-table__actions">
                    <button
                      type="button"
                      className="playlist-track-table__remove playlist-detail__icon-btn"
                      aria-label={`Remove ${track.title}`}
                      disabled={isRemovingTrack}
                      onClick={() => onRemoveTrack(track.trackId)}
                    >
                      <Trash2 size={16} aria-hidden />
                    </button>
                  </div>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
