import { useCallback } from 'react'
import { getPlaylists } from '@/api/endpoints'
import { GatedLink } from '@/components/auth/GatedLink'
import { FeaturedPlaylistCard } from '@/components/discover/FeaturedPlaylistCard'
import { PlaylistCover } from '@/components/discover/PlaylistCover'
import { useContent } from '@/hooks/useContent'
import { formatTrackCount, playlistFollowers, playlistListBlurb } from '@/lib/discovery/playlists'
import type { Playlist } from '@/types'
import '@/styles/playlists-curated.css'

function playlistInitials(title: string): string {
  return title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
}

function PlaylistListRow({ playlist }: { playlist: Playlist }) {
  return (
    <GatedLink
      to={`/playlist/${playlist.slug}`}
      forceGate
      className="pl-row"
      aria-label={playlist.title}
    >
      <div className="pl-row__thumb-wrap">
        <span className="pl-row__wave" aria-hidden>
          {Array.from({ length: 4 }, (_, i) => (
            <span key={i} style={{ height: `${38 + (i % 3) * 20}%` }} />
          ))}
        </span>
        <div className="pl-row__thumb-frame">
          <PlaylistCover
            src={playlist.cover}
            alt=""
            className="pl-row__thumb"
            fallback={playlistInitials(playlist.title)}
            width={160}
            sizes="76px"
          />
        </div>
      </div>
      <div className="pl-row__body">
        <p className="pl-row__title">{playlist.title}</p>
        <p className="pl-row__desc">{playlistListBlurb(playlist)}</p>
        <p className="pl-row__followers">{playlistFollowers(playlist.slug)}</p>
      </div>
      <div className="pl-row__meta">
        <span className="pl-row__count">{formatTrackCount(playlist.trackCount)}</span>
        <span className="pl-row__play" aria-hidden>
          <PlayIcon small />
        </span>
      </div>
    </GatedLink>
  )
}

export function DiscoverPlaylistsSection() {
  const playlists = useContent(useCallback(() => getPlaylists(), []))
  const items = playlists.data ?? []
  const lead = items[0]
  const rest = items.slice(1, 6)

  return (
    <section id="discover-playlists" className="pl-sec scroll-mt-24">
      <header className="pl-sec__head">
        <div className="pl-sec__brand">
          <span className="pl-sec__idx" aria-hidden>
            05
          </span>
          <div>
            <p className="pl-sec__tag">Curated</p>
            <h2 className="pl-sec__title">Playlists</h2>
            <p className="pl-sec__sub">IOS selections and wire picks.</p>
          </div>
        </div>
        <GatedLink to="/playlists" forceGate className="pl__all-btn">
          <span className="pl__all-btn-text">All playlists</span>
          <span className="pl__all-btn-arrow" aria-hidden>
            →
          </span>
        </GatedLink>
      </header>

      {playlists.loading && <p className="disco-loading">Loading playlists…</p>}

      {lead && (
        <div className="pl__layout">
          <FeaturedPlaylistCard playlist={lead} />
          <div className="pl__list">
            <div className="pl__list-wire" aria-hidden />
            {rest.map((p) => (
              <PlaylistListRow key={p.id} playlist={p} />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

function PlayIcon({ small }: { small?: boolean }) {
  const s = small ? 11 : 12
  return (
    <svg width={s} height={s} viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M4.5 3.2v5.6l4.5-2.8-4.5-2.8z" fill="currentColor" />
    </svg>
  )
}
