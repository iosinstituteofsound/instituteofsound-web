import { Link } from 'react-router-dom'
import { Play } from 'lucide-react'
import type { ReleaseDetailDto, TrackDto } from '@/modules/music/types/music.types'
import { trackPagePath } from '@/modules/explore/lib/track-paths'
import { AddToPlaylistButton } from '@/modules/music/components/add-to-playlist-button'
import { TrackActionsMenu } from '@/modules/music/components/track-actions-menu'
import { cn } from '@/shared/lib/cn'

type ReleaseTrackListProps = {
  tracks: TrackDto[]
  releaseDetail: ReleaseDetailDto
  currentTrackId?: string
  onPlayTrack: (index: number) => void
  className?: string
}

export function ReleaseTrackList({
  tracks,
  releaseDetail,
  currentTrackId,
  onPlayTrack,
  className,
}: ReleaseTrackListProps) {
  if (!tracks.length) return null

  return (
    <ol className={cn('explore-release-tracklist mt-4 divide-y rounded-lg border', className)}>
      {tracks.map((track, index) => {
        const isCurrent = track.id === currentTrackId

        return (
          <li
            key={track.id}
            className={cn(
              'flex items-center justify-between gap-2 px-4 py-3',
              isCurrent && 'is-current',
            )}
          >
            <Link
              to={trackPagePath(track.id)}
              className="explore-release-tracklist__link min-w-0 flex-1"
              aria-current={isCurrent ? 'page' : undefined}
            >
              <p className="font-medium">
                {track.trackNumber}. {track.title}
              </p>
            </Link>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                className="explore-release-hero__btn explore-release-hero__btn--line"
                disabled={!track.audioUrl}
                onClick={() => onPlayTrack(index)}
                aria-label={`Play ${track.title}`}
              >
                <Play size={12} aria-hidden />
              </button>
              <AddToPlaylistButton
                trackId={track.id}
                title={track.title}
                artist={releaseDetail.artistName}
                artworkUrl={releaseDetail.coverUrl}
                className="explore-release-hero__btn explore-release-hero__btn--line"
              />
              <TrackActionsMenu
                trackId={track.id}
                title={track.title}
                artist={releaseDetail.artistName}
                audioUrl={track.audioUrl}
                artworkUrl={releaseDetail.coverUrl}
                durationSec={track.durationSec}
                releaseId={releaseDetail.id}
                artistProfileId={releaseDetail.artistProfileId}
                triggerClassName="explore-release-hero__btn explore-release-hero__btn--line"
              />
            </div>
          </li>
        )
      })}
    </ol>
  )
}
