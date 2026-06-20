import { useState } from 'react'
import {
  Clock3,
  MoreHorizontal,
  Music2,
  Play,
  Star,
  Users,
} from 'lucide-react'
import type { PlaylistDto } from '@/modules/explore/types/explore.types'
import {
  formatTrackCount,
  listPlaylists,
  playlistDurationLabel,
  playlistFeaturedTagline,
  playlistFollowers,
  playlistFollowersLabel,
  playlistSpineLabel,
  playlistTagline,
  playlistTrackCount,
} from '@/modules/explore/lib/playlist-meta'
import { usePlayerStore } from '@/modules/player/stores/player-store'
import { playExplorePlaylist } from '@/modules/music/lib/player-queue'
import {
  ExploreSectionHead,
  ExploreSectionHeadAction,
} from '@/modules/explore/components/explore-section-head'
import { cn } from '@/shared/lib/cn'

interface ExplorePlaylistsSectionProps {
  featured: PlaylistDto | null
  items: PlaylistDto[]
}

function playPlaylist(
  playlist: PlaylistDto,
  playTrack: ReturnType<typeof usePlayerStore.getState>['playTrack'],
) {
  playExplorePlaylist(playlist, playTrack)
}

function WaveBadge() {
  return (
    <span className="explore-pl-row__wave" aria-hidden>
      {[38, 58, 44, 72].map((height, index) => (
        <span key={index} style={{ height: `${height}%` }} />
      ))}
    </span>
  )
}

function FeaturedPlaylistCard({ playlist }: { playlist: PlaylistDto }) {
  const playTrack = usePlayerStore((s) => s.playTrack)
  const [following, setFollowing] = useState(false)
  const tracks = playlistTrackCount(playlist)
  const cover = playlist.coverUrl ?? `https://picsum.photos/seed/${playlist.slug}/900/900`

  return (
    <article className="explore-pl-featured">
      <div className="explore-pl-featured__bg" aria-hidden />
      <span className="explore-pl-featured__watermark" aria-hidden>
        IOS
      </span>

      <div className="explore-pl-featured__inner">
        <div className="explore-pl-featured__art">
          <div className="explore-pl-featured__stack">
            <div className="explore-pl-featured__glow" aria-hidden />
            <div className="explore-pl-featured__vinyl" aria-hidden />
            <div className="explore-pl-featured__sleeve">
              <span className="explore-pl-featured__spine" aria-hidden>
                {playlistSpineLabel(playlist)}
              </span>
              <img src={cover} alt="" loading="lazy" className="explore-pl-featured__cover" />
            </div>
          </div>
        </div>

        <div className="explore-pl-featured__copy">
          <div className="explore-pl-featured__labels">
            <span className="explore-pl-featured__badge">
              <Star size={9} strokeWidth={2} aria-hidden />
              Featured
            </span>
            <span className="explore-pl-featured__wire">IOS Wire Pick</span>
          </div>

          <h3 className="explore-pl-featured__title">{playlist.title}</h3>
          <p className="explore-pl-featured__desc">{playlistFeaturedTagline(playlist)}</p>

          <div className="explore-pl-featured__stats">
            <div className="explore-pl-featured__stat">
              <Music2 size={12} strokeWidth={2} aria-hidden />
              <span className="explore-pl-featured__stat-num">{tracks}</span>
              <span className="explore-pl-featured__stat-lbl">Tracks</span>
            </div>
            <div className="explore-pl-featured__stat">
              <Clock3 size={12} strokeWidth={2} aria-hidden />
              <span className="explore-pl-featured__stat-num">{playlistDurationLabel(playlist)}</span>
              <span className="explore-pl-featured__stat-lbl">Duration</span>
            </div>
            <div className="explore-pl-featured__stat">
              <Users size={12} strokeWidth={2} aria-hidden />
              <span className="explore-pl-featured__stat-num">{playlistFollowers(playlist.slug)}</span>
              <span className="explore-pl-featured__stat-lbl">Followers</span>
            </div>
          </div>

          <div className="explore-pl-featured__actions">
            <button
              type="button"
              className="explore-pl-featured__play"
              onClick={() => playPlaylist(playlist, playTrack)}
            >
              <Play size={12} strokeWidth={2.5} fill="currentColor" aria-hidden />
              Play Now
            </button>
            <button
              type="button"
              className={cn('explore-pl-featured__follow', following && 'is-active')}
              onClick={() => setFollowing((value) => !value)}
            >
              {following ? 'Following' : 'Follow'}
            </button>
            <button type="button" className="explore-pl-featured__more" aria-label="More options">
              <MoreHorizontal size={16} strokeWidth={2} aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

function PlaylistListRow({ playlist }: { playlist: PlaylistDto }) {
  const playTrack = usePlayerStore((s) => s.playTrack)
  const cover = playlist.coverUrl ?? `https://picsum.photos/seed/${playlist.slug}-list/200/200`

  return (
    <button
      type="button"
      className="explore-pl-row"
      aria-label={`Play ${playlist.title}`}
      onClick={() => playPlaylist(playlist, playTrack)}
    >
      <div className="explore-pl-row__thumb-wrap">
        <WaveBadge />
        <div className="explore-pl-row__thumb-frame">
          <img src={cover} alt="" loading="lazy" className="explore-pl-row__thumb" />
        </div>
      </div>

      <div className="explore-pl-row__body">
        <p className="explore-pl-row__title">{playlist.title}</p>
        <p className="explore-pl-row__desc">{playlistTagline(playlist)}</p>
        <p className="explore-pl-row__followers">{playlistFollowersLabel(playlist.slug)}</p>
      </div>

      <div className="explore-pl-row__meta">
        <span className="explore-pl-row__count">{formatTrackCount(playlist)}</span>
        <span className="explore-pl-row__play" aria-hidden>
          <Play size={11} strokeWidth={2.5} fill="currentColor" />
        </span>
      </div>
    </button>
  )
}

export function ExplorePlaylistsSection({ featured, items }: ExplorePlaylistsSectionProps) {
  const resolvedFeatured = featured ?? items[0] ?? null
  const listItems = listPlaylists(resolvedFeatured, items)

  if (!resolvedFeatured && listItems.length === 0) return null

  return (
    <section id="explore-playlists" className="explore-section explore-pl-section">
      <ExploreSectionHead
        index={5}
        kicker="Curated"
        title="Playlists"
        description="IOS selections and wire picks."
        action={<ExploreSectionHeadAction label="All Playlists" href="#explore-playlists" />}
      />

      <div className="explore-pl-layout">
        {resolvedFeatured ? <FeaturedPlaylistCard playlist={resolvedFeatured} /> : null}

        {resolvedFeatured || listItems.length > 0 ? (
          <div className="explore-pl-list">
            <div className="explore-pl-list__wire" aria-hidden />
            {listItems.map((playlist) => (
              <PlaylistListRow key={playlist.id} playlist={playlist} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
