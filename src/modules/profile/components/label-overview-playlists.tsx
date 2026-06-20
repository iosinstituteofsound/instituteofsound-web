import { Link } from 'react-router-dom'
import { ArrowRight, Play } from 'lucide-react'
import type { PlaylistDto } from '@/modules/explore/types/explore.types'
import { playlistTrackCount } from '@/modules/explore/lib/playlist-meta'
import { playExplorePlaylist } from '@/modules/music/lib/player-queue'
import { usePlayerStore } from '@/modules/player/stores/player-store'
import '@/modules/profile/styles/label-overview-playlists.css'

type LabelOverviewPlaylistsProps = {
  playlists: PlaylistDto[]
  viewAllHref?: string
}

function playPlaylist(
  playlist: PlaylistDto,
  playTrack: ReturnType<typeof usePlayerStore.getState>['playTrack'],
) {
  playExplorePlaylist(playlist, playTrack)
}

export function LabelOverviewPlaylists({
  playlists,
  viewAllHref = '/explore#explore-playlists',
}: LabelOverviewPlaylistsProps) {
  const playTrack = usePlayerStore((state) => state.playTrack)

  if (playlists.length === 0) return null

  return (
    <section className="lbl-ov-playlists" aria-labelledby="lbl-ov-playlists-heading">
      <header className="lbl-ov-playlists__head">
        <h2 id="lbl-ov-playlists-heading" className="lbl-ov-playlists__title">
          Label Playlists
        </h2>
        <Link to={viewAllHref} className="lbl-ov-playlists__view-all">
          View All Playlists
          <ArrowRight size={14} strokeWidth={2.25} aria-hidden />
        </Link>
      </header>

      <div className="lbl-ov-playlists__track">
        {playlists.map((playlist) => {
          const tracks = playlistTrackCount(playlist)
          const cover = playlist.coverUrl ?? `https://picsum.photos/seed/${playlist.slug}/640/640`

          return (
            <article key={playlist.id} className="lbl-ov-playlists__card">
              <img src={cover} alt="" loading="lazy" className="lbl-ov-playlists__cover" />

              <div className="lbl-ov-playlists__shade" aria-hidden />

              <div className="lbl-ov-playlists__meta">
                <h3 className="lbl-ov-playlists__name">{playlist.title}</h3>
                <p className="lbl-ov-playlists__tracks">{tracks} Tracks</p>
              </div>

              <button
                type="button"
                className="lbl-ov-playlists__play"
                aria-label={`Play ${playlist.title}`}
                onClick={() => playPlaylist(playlist, playTrack)}
              >
                <Play size={14} strokeWidth={2.5} aria-hidden />
              </button>
            </article>
          )
        })}
      </div>
    </section>
  )
}
