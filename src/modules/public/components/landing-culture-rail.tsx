import { Link } from 'react-router-dom'
import { ArrowUpRight, Music2, Play } from 'lucide-react'
import type { ArtistProfileDto, PlaylistDto } from '@/modules/explore/types/explore.types'
import { playlistTrackCount } from '@/modules/explore/lib/playlist-meta'
import { usePlayerStore } from '@/modules/player/stores/player-store'
import { Button } from '@/shared/components/ui/button'

function artistInitial(name: string): string {
  return (name.trim().charAt(0) || 'A').toUpperCase()
}

interface LandingCultureRailProps {
  featured: PlaylistDto | null
  playlists: PlaylistDto[]
  artists: ArtistProfileDto[]
}

export function LandingCultureRail({ featured, playlists, artists }: LandingCultureRailProps) {
  const playTrack = usePlayerStore((s) => s.playTrack)
  const playlist = featured ?? playlists[0] ?? null
  const artistPreview = artists.slice(0, 8)

  if (!playlist && artistPreview.length === 0) return null

  const handlePlay = () => {
    if (!playlist) return
    const track = playlist.tracks.find((item) => item.streamUrl) ?? playlist.tracks[0]
    if (!track?.streamUrl) return
    playTrack({
      id: `${playlist.id}-0`,
      title: track.title,
      artist: track.artistName,
      audioUrl: track.streamUrl,
      artworkUrl: playlist.coverUrl,
    })
  }

  return (
    <section className="landing-section" aria-labelledby="landing-culture-title">
      <header className="landing-section-head">
        <div>
          <p className="landing-section-head__num">03</p>
          <p className="landing-section-head__kicker">Culture</p>
          <h2 id="landing-culture-title" className="landing-section-head__title">
            Playlists & artists
          </h2>
          <p className="landing-section-head__sub">
            Curated listening and the artists shaping the underground right now.
          </p>
        </div>
        <Link to="/explore" className="landing-section-head__link">
          Explore culture
          <ArrowUpRight size={16} aria-hidden />
        </Link>
      </header>

      <div className="landing-culture__grid">
        {playlist ? (
          <div className="landing-culture__playlist">
            <div className="landing-culture__playlist-cover">
              {playlist.coverUrl ? (
                <img src={playlist.coverUrl} alt="" loading="lazy" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <Music2 size={28} aria-hidden />
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Featured playlist
              </p>
              <h3 className="mt-1 text-xl font-bold">{playlist.title}</h3>
              {playlist.description ? (
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{playlist.description}</p>
              ) : null}
              <p className="mt-2 text-xs text-muted-foreground">
                {playlistTrackCount(playlist)} tracks
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" size="sm" onClick={handlePlay}>
                  <Play size={14} className="mr-1" aria-hidden />
                  Play preview
                </Button>
                <Button asChild variant="secondary" size="sm">
                  <Link to="/explore">More playlists</Link>
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {artistPreview.length > 0 ? (
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Artists on the network
            </p>
            <div className="landing-culture__artists">
              {artistPreview.map((artist) => (
                <Link key={artist.id} to="/explore" className="landing-culture__artist">
                  <span className="landing-culture__artist-avatar">
                    {artist.avatarUrl ? (
                      <img src={artist.avatarUrl} alt="" loading="lazy" />
                    ) : (
                      artistInitial(artist.displayName)
                    )}
                  </span>
                  <span className="landing-culture__artist-name">{artist.displayName}</span>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
