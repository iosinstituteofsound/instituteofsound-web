import { useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useContent } from '@/hooks/useContent'
import { getArtist } from '@/api/endpoints'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'

export default function ArtistDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const fetcher = useCallback(() => getArtist(slug!), [slug])
  const { data: artist, loading, error } = useContent(fetcher)

  if (loading) return <LoadingTransmission />
  if (error || !artist) {
    return (
      <div className="section-padding pt-32 text-center">
        <p className="text-crimson">Signal lost.</p>
        <Link to="/discover" className="text-neon text-sm mt-4 inline-block">
          ← Back to Discover
        </Link>
      </div>
    )
  }

  return (
    <div className="pt-20">
      <div className="relative h-[60vh] overflow-hidden">
        <img
          src={artist.image}
          alt={artist.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/50 to-transparent" />
      </div>
      <div className="section-padding -mt-32 relative z-10">
        <div className="max-w-3xl">
          <span className="text-[10px] tracking-[0.3em] text-neon uppercase">
            {artist.genre}
          </span>
          <h1 className="font-display text-5xl md:text-7xl font-bold mt-4">
            {artist.name}
          </h1>
          <p className="text-muted text-lg mt-6 leading-relaxed">{artist.description}</p>
          <a
            href={artist.listenUrl ?? '#'}
            className="inline-block mt-10 bg-neon text-void px-8 py-4 text-xs tracking-[0.2em] uppercase font-bold hover:bg-signal transition-colors"
          >
            Listen Now →
          </a>
          <Link
            to="/discover"
            className="block mt-8 text-xs tracking-widest text-muted hover:text-neon"
          >
            ← All Artists
          </Link>
        </div>
      </div>
    </div>
  )
}
