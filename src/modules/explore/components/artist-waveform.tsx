import { artistInitials } from '@/modules/explore/lib/artist-meta'

export function ArtistWaveform({ slug, className }: { slug: string; className?: string }) {
  const barCount = 36
  const bars = Array.from({ length: barCount }, (_, i) => {
    const seed = slug.charCodeAt(i % slug.length)! + i * 13
    return 0.22 + (seed % 78) / 100
  })

  return (
    <div className={className ? `explore-art-wave ${className}` : 'explore-art-wave'} aria-hidden>
      {bars.map((scale, i) => (
        <span
          key={i}
          className="explore-art-wave__bar"
          style={
            {
              '--bar-scale': scale,
              '--bar-delay': `${(i % 12) * 0.055}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}

export function ArtistCardMedia({
  artist,
}: {
  artist: { slug: string; displayName: string; coverUrl?: string; avatarUrl?: string }
}) {
  const imageUrl = artist.coverUrl
  const initials = artistInitials(artist.displayName)

  if (imageUrl) {
    return <img src={imageUrl} alt="" loading="lazy" className="explore-art-card__img" />
  }

  return (
    <div className="explore-art-card__mono" aria-hidden>
      <span className="explore-art-card__mono-glyph">{initials}</span>
    </div>
  )
}
