import { Link } from 'react-router-dom'
import { Play } from 'lucide-react'
import type { CuratorFeaturedPlaylistDto } from '@/modules/explore/types/explore.types'
import { playExplorePlaylist } from '@/modules/music/lib/player-queue'
import { usePlayerStore } from '@/modules/player/stores/player-store'
import { curatorCompactCount } from '@/modules/profile/lib/curator-format'
import { CuratorGlassSection } from '@/modules/profile/components/curator/curator-glass-section'

type CuratorFeaturedPlaylistsProps = {
  playlists: CuratorFeaturedPlaylistDto[]
  viewAllHref?: string
}

export function CuratorFeaturedPlaylists({
  playlists,
  viewAllHref = '/explore#explore-playlists',
}: CuratorFeaturedPlaylistsProps) {
  const playTrack = usePlayerStore((state) => state.playTrack)

  if (playlists.length === 0) return null

  return (
    <CuratorGlassSection
      title="Featured Playlists"
      id="curator-featured-playlists-heading"
      viewAllHref={viewAllHref}
      viewAllLabel="View all"
      className="curator-playlists"
    >
      <div className="curator-playlists__frame" aria-hidden>
        <span className="curator-playlists__corner curator-playlists__corner--tl" />
        <span className="curator-playlists__corner curator-playlists__corner--tr" />
        <span className="curator-playlists__corner curator-playlists__corner--bl" />
        <span className="curator-playlists__corner curator-playlists__corner--br" />
      </div>

      <div className="curator-playlists__viewport">
        <div className="curator-playlists__track">
          {playlists.map((playlist, index) => {
            const cover = playlist.coverUrl ?? `https://picsum.photos/seed/${playlist.slug}/640/640`

            return (
              <article key={playlist.id} className="curator-playlists__card">
                <Link to={`/playlists/${playlist.slug}`} className="curator-playlists__link">
                  <img src={cover} alt="" loading="lazy" className="curator-playlists__cover" />
                  <div className="curator-playlists__shade" aria-hidden />

                  <div className="curator-playlists__meta">
                    <span className="curator-playlists__idx" aria-hidden>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h3 className="curator-playlists__name">{playlist.title}</h3>
                    <p className="curator-playlists__stats">
                      {curatorCompactCount(playlist.followerCount ?? 0)} followers ·{' '}
                      {curatorCompactCount(playlist.playCount ?? 0)} plays
                    </p>
                  </div>
                </Link>

                <button
                  type="button"
                  className="curator-playlists__play"
                  aria-label={`Play ${playlist.title}`}
                  onClick={() => playExplorePlaylist(playlist, playTrack)}
                >
                  <Play size={14} strokeWidth={2.5} fill="currentColor" aria-hidden />
                </button>
              </article>
            )
          })}
        </div>
      </div>
    </CuratorGlassSection>
  )
}
