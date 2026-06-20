import { Link } from 'react-router-dom'
import type { PlaylistDetailDto, PlaylistTrackRefDto } from '@/modules/music/types/music.types'
import { playlistTrackReleaseHref } from '@/modules/music/lib/playlist-detail-format'

type PlaylistTrackRowMainProps = {
  track: PlaylistTrackRefDto
  playlist: PlaylistDetailDto
  index: number
  onPlayTrack: (index: number) => void
}

function trackThumb(track: PlaylistTrackRefDto, playlist: PlaylistDetailDto) {
  const src = track.coverUrl ?? playlist.coverUrl
  if (src) return <img src={src} alt="" className="playlist-track-list__thumb" loading="lazy" />
  return (
    <span className="playlist-track-list__thumb-fallback" aria-hidden>
      ♪
    </span>
  )
}

export function PlaylistTrackRowMain({
  track,
  playlist,
  index,
  onPlayTrack,
}: PlaylistTrackRowMainProps) {
  const releaseHref = playlistTrackReleaseHref(track)

  const content = (
    <>
      {trackThumb(track, playlist)}
      <span className="playlist-track-list__copy">
        <span className="playlist-track-list__title">{track.title}</span>
        <span className="playlist-track-list__artist">
          {track.artistSlug && !releaseHref ? (
            <Link
              to={`/artist/${track.artistSlug}`}
              className="playlist-track-list__artist-link"
              onClick={(event) => event.stopPropagation()}
            >
              {track.artistName}
            </Link>
          ) : (
            track.artistName
          )}
        </span>
      </span>
    </>
  )

  if (releaseHref) {
    return (
      <Link to={releaseHref} className="playlist-track-list__main playlist-track-list__main--link">
        {content}
      </Link>
    )
  }

  return (
    <button type="button" className="playlist-track-list__main" onClick={() => onPlayTrack(index)}>
      {content}
    </button>
  )
}
