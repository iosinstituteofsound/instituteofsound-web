import { useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useContent } from '@/hooks/useContent'
import { getPlaylist } from '@/api/endpoints'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'
import { IOSImage } from '@/components/ui/IOSImage'

export default function PlaylistDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const fetcher = useCallback(() => getPlaylist(slug!), [slug])
  const { data: playlist, loading, error } = useContent(fetcher)

  if (loading) return <LoadingTransmission variant="hell" />
  if (error || !playlist) {
    return (
      <div className="section-padding pt-32 text-center">
        <p className="text-crimson">Playlist not found in archive.</p>
        <Link to="/playlists" className="text-neon text-sm mt-4 inline-block">
          ← All Playlists
        </Link>
      </div>
    )
  }

  return (
    <div className="pt-20">
      <div className="section-padding">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div
            className="aspect-square overflow-hidden border"
            style={{ borderColor: `${playlist.accent}40` }}
          >
            <IOSImage
              src={playlist.cover}
              alt={playlist.title}
              width={800}
              priority
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="text-[10px] tracking-[0.3em] text-neon uppercase">
              Curated Archive
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-bold mt-4">
              {playlist.title}
            </h1>
            <p className="text-muted text-lg mt-4">{playlist.description}</p>
            <div className="flex gap-6 mt-6 text-sm text-muted uppercase tracking-wider">
              <span>{playlist.trackCount} tracks</span>
              <span>{playlist.duration}</span>
            </div>
            <button
              type="button"
              className="mt-10 px-8 py-4 text-xs tracking-[0.2em] uppercase font-bold text-void transition-colors"
              style={{ backgroundColor: playlist.accent }}
            >
              Play Collection →
            </button>
            <Link
              to="/playlists"
              className="block mt-6 text-xs tracking-widest text-muted hover:text-neon"
            >
              ← All Playlists
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
